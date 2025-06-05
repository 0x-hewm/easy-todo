import { I18n } from '../utils/i18n';
import { MessageResponse } from '../types';

export class NotificationService {
  private static i18n = I18n.getInstance();

  static async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('此浏览器不支持通知功能');
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  static async showNotification(title: string, message: string, options: {
    requireInteraction?: boolean;
  } = {}): Promise<void> {
    try {
      // 尝试多种通知方式，确保至少有一种通知能够显示
      
      // 1. 首先尝试使用chrome.notifications API (扩展环境)
      if (typeof chrome !== 'undefined' && chrome.notifications) {
        await chrome.notifications.create({
          type: 'basic',
          iconUrl: chrome.runtime.getURL('assets/icons/icon48.webp'), // 使用WebP格式图标
          title: title,
          message: message,
          requireInteraction: options.requireInteraction || false,
          priority: 2
        });
        return;
      }
      
      // 2. 如果chrome.notifications不可用，退回到Web Notifications API
      if ('Notification' in window) {
        if (Notification.permission !== 'granted') {
          const permission = await Notification.requestPermission();
          if (permission !== 'granted') {
            console.warn('通知权限未获得');
            return;
          }
        }
        
        new Notification(title, {
          body: message,
          icon: '/assets/icons/icon48.webp', // 使用WebP格式图标
          requireInteraction: options.requireInteraction
        });
        return;
      }
      
      // 3. 如果通知API都不可用，使用alert作为后备选项
      console.log(`通知: ${title} - ${message}`);
      
    } catch (error) {
      console.error('显示通知失败:', error);
      // 打印通知信息到控制台，确保开发者能看到
      console.log(`通知内容(失败): ${title} - ${message}`);
    }
  }

  static async scheduleNotification(todo: {
    id: string;
    title: string;
    dueDate?: number;
    reminderLeadTime?: number;
  }): Promise<void> {
    // 验证提醒数据的有效性
    if (!todo.id || !todo.title || !todo.dueDate || typeof todo.reminderLeadTime !== 'number') {
      let reason = "未知原因";
      if (!todo.id) reason = "缺少 ID";
      else if (!todo.title) reason = "缺少标题";
      else if (!todo.dueDate) reason = "缺少截止日期";
      else if (typeof todo.reminderLeadTime !== 'number') reason = "提醒时间格式错误";
      
      console.error(`无效的提醒数据 (${reason}):`, todo);
      throw new Error(`无效的提醒数据 (${reason})`);
    }

    try {
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
        try {
          // 使用可靠的消息传递方式
          const response: any = await new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({
              type: 'SCHEDULE_NOTIFICATION',
              payload: {
                id: todo.id,
                title: todo.title,
                dueDate: todo.dueDate,
                reminderLeadTime: todo.reminderLeadTime
              }
            }, (response) => {
              if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message || "消息发送失败"));
              } else {
                resolve(response);
              }
            });
          });
          
          if (response && response.success) {
            console.debug(`成功安排提醒: ${todo.title}`);
            return;
          }
          
          throw new Error((response && response.error) || '安排提醒失败');
        } catch (error) {
          console.warn('使用Chrome API安排提醒失败，将使用备用方法:', error);
        }
      }
      
      // 后备方法: 设置本地超时
      this._setupLocalReminder(todo);
      
    } catch (error) {
      console.error('安排提醒失败:', error);
      throw error;
    }
  }

  // 添加一个辅助方法处理本地提醒备份机制
  private static _setupLocalReminder(todo: {
    id: string;
    title: string;
    dueDate?: number;
    reminderLeadTime?: number;
  }): void {
    // 确保dueDate和reminderLeadTime都存在
    if (todo.dueDate === undefined || todo.reminderLeadTime === undefined) {
      console.warn('无法设置本地提醒: 截止日期或提醒时间未定义');
      return;
    }
    
    const reminderTime = todo.dueDate - (todo.reminderLeadTime * 60 * 1000);
    const now = Date.now();
    
    // 如果提醒时间已经过去，直接显示通知
    if (reminderTime <= now) {
      this.showTodoReminder(todo.title, this.getReminderText(todo.reminderLeadTime));
      return;
    }
    
    // 为将来的提醒设置超时
    const timeoutId = setTimeout(() => {
      this.showTodoReminder(todo.title, this.getReminderText(todo.reminderLeadTime || 0));
    }, reminderTime - now);
    
    // 保存timeout ID以便于取消
    this._reminderTimeouts = this._reminderTimeouts || new Map();
    this._reminderTimeouts.set(todo.id, timeoutId);
    
    console.log(`已为 "${todo.title}" 设置本地提醒，提醒时间: ${new Date(reminderTime).toLocaleString()}`);
  }

  // 存储提醒timeout的Map
  private static _reminderTimeouts: Map<string, ReturnType<typeof setTimeout>> = new Map();
  
  static async cancelNotification(todoId: string): Promise<void> {
    try {
      // 1. 尝试通过Chrome扩展API取消提醒
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
        try {
          await new Promise<any>((resolve) => {
            chrome.runtime.sendMessage({
              type: 'CANCEL_NOTIFICATION',
              payload: { todoId }
            }, resolve);
          });
        } catch (error) {
          console.warn('取消Chrome通知失败:', error);
        }
      }
      
      // 2. 取消本地设置的timeout
      if (this._reminderTimeouts && this._reminderTimeouts.has(todoId)) {
        const timeoutId = this._reminderTimeouts.get(todoId);
        if (timeoutId) {
          clearTimeout(timeoutId);
          this._reminderTimeouts.delete(todoId);
          console.log(`已取消任务 ${todoId} 的提醒`);
        }
      }
    } catch (error) {
      console.warn('取消提醒失败:', error);
    }
  }

  static getReminderText(minutes: number): string {
    if (minutes === 0) return '现在';
    if (minutes === 60) return '1小时后';
    if (minutes === 1440) return '1天后';
    if (minutes > 60) return `${Math.floor(minutes / 60)}小时${minutes % 60 ? minutes % 60 + '分钟' : ''}后`;
    return `${minutes}分钟后`;
  }

  static async showTodoReminder(title: string, timeText: string): Promise<void> {
    await this.showNotification(
      '待办事项提醒',
      `${title} 将在${timeText}到期`,
      { requireInteraction: true }
    );
  }

  static async showCompletionNotification(title: string): Promise<void> {
    await this.showNotification(
      '任务完成',
      `恭喜！你完成了任务：${title}`,
      { requireInteraction: false }
    );
  }
}