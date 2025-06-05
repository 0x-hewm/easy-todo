import { Todo, TodoState } from './types';
import { NotificationService } from './services/NotificationService';
import { StorageService } from './services/StorageService';
import { DateUtils } from './utils/date';
import { TodoService } from './services/TodoService';
import { I18n } from './utils/i18n';

// 检查待办事项到期提醒的时间间隔（1分钟）
const CHECK_INTERVAL = 60 * 1000;

// 检查待办事项是否需要提醒
async function checkTodoReminders() {
  const state = await StorageService.getState();
  const now = Date.now();

  for (const todo of state.todos) {
    if (!todo.completed && todo.dueDate && !todo.reminded) {
      const reminderLeadTime = todo.reminderLeadTime ?? state.settings?.reminderLeadTime ?? 60;
      if (reminderLeadTime === undefined) continue;

      const reminderTime = todo.dueDate - (reminderLeadTime * 60 * 1000);
      
      // 如果到了提醒时间（允许1分钟的误差）
      if (Math.abs(now - reminderTime) <= CHECK_INTERVAL) {
        const reminderText = NotificationService.getReminderText(reminderLeadTime);
        NotificationService.showTodoReminder(todo.title, reminderText);
        
        // 标记为已提醒
        await TodoService.updateTodo(todo.id, { ...todo, reminded: true });
      }
    }
  }
}

// 监听扩展安装事件
chrome.runtime.onInstalled.addListener(async () => {
  console.log('Easy Todo 扩展已安装');
  
  // 使用 Promise 包装通知权限检查
  const checkNotificationPermission = () => {
    return new Promise<string>((resolve) => {
      chrome.notifications.getPermissionLevel(resolve);
    });
  };

  // 检查通知权限
  const permissionLevel = await checkNotificationPermission();
  console.log('通知权限状态:', permissionLevel);
});

// 设置图标点击事件
chrome.action.onClicked.addListener((tab) => {
  console.log('扩展图标被点击');
});

// 修改 StorageService 导入数据事件处理
if ('storage' in chrome) {
  chrome.storage.onChanged.addListener((changes: Record<string, chrome.storage.StorageChange>, namespace: string) => {
    if (namespace === 'local' && changes[StorageService.STORAGE_KEY]) {
      const newState = changes[StorageService.STORAGE_KEY].newValue as TodoState;
      const oldState = changes[StorageService.STORAGE_KEY].oldValue as TodoState;

      // 检查新完成的任务
      if (newState?.todos && oldState?.todos) {
        newState.todos.forEach((newTodo: Todo) => {
          const oldTodo = oldState.todos.find(t => t.id === newTodo.id);
          if (oldTodo && !oldTodo.completed && newTodo.completed) {
            NotificationService.showCompletionNotification(newTodo.title);
          }
        });
      }
    }
  });
}

// 改进 API 检查和初始化
let alarmsInitialized = false;
let initializationAttempts = 0;
const MAX_INIT_ATTEMPTS = 3;
const INIT_RETRY_DELAY = 1000; // 1秒

// 初始化 Alarms API
const initializeAlarms = async (): Promise<boolean> => {
  if (alarmsInitialized) return true;
  
  if (initializationAttempts >= MAX_INIT_ATTEMPTS) {
    console.error('Alarms API 初始化失败次数过多');
    return false;
  }

  initializationAttempts++;
  console.debug(`尝试初始化 Alarms API (第 ${initializationAttempts} 次)...`);

  try {
    // 确保Chrome APIs已完全加载
    if (!chrome?.alarms) {
      throw new Error('Chrome Alarms API 不可用');
    }

    // 清理现有提醒
    const alarms = await chrome.alarms.getAll();
    console.debug('现有提醒数量:', alarms.length);

    await Promise.all(
      alarms
        .filter(alarm => alarm.name.startsWith('todo-'))
        .map(alarm => chrome.alarms.clear(alarm.name))
    );
    
    // 重新创建所有待办事项的提醒
    const state = await StorageService.getState();
    const now = Date.now();
    
    const activeReminders = state.todos.filter(todo => 
      !todo.completed && 
      todo.dueDate !== undefined && 
      todo.reminderLeadTime !== undefined && 
      todo.dueDate > now
    );
    
    console.debug(`需要设置提醒的待办事项数量: ${activeReminders.length}`);
    
    for (const todo of activeReminders) {
      // 由于我们已经在filter中确保了dueDate和reminderLeadTime不是undefined
      // TypeScript仍然可能警告，所以这里使用非空断言
      const reminderTime = todo.dueDate! - (todo.reminderLeadTime! * 60 * 1000);
      if (reminderTime > now) {
        await chrome.alarms.create(`todo-${todo.id}`, {
          when: reminderTime
        });
        console.debug(`已为待办事项 "${todo.title}" 创建提醒，时间: ${new Date(reminderTime).toLocaleString()}`);
      }
    }

    alarmsInitialized = true;
    console.debug('Alarms API 初始化成功');
    return true;
  } catch (error) {
    console.error('初始化 Alarms API 失败:', error);
    
    // 延迟后重试
    if (initializationAttempts < MAX_INIT_ATTEMPTS) {
      return new Promise(resolve => {
        setTimeout(() => {
          initializeAlarms().then(resolve);
        }, INIT_RETRY_DELAY);
      });
    }
    
    return false;
  }
};

// 监听来自 popup 的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    try {
      console.debug('收到消息:', message.type);

      // 确保 Alarms API 已初始化
      if (!alarmsInitialized) {
        const success = await initializeAlarms();
        if (!success) {
          throw new Error('Alarms API 初始化失败');
        }
      }

      switch (message.type) {
        case 'SCHEDULE_NOTIFICATION': {
          const { id, title, dueDate, reminderLeadTime } = message.payload;
          console.debug('安排提醒:', { id, title, dueDate, reminderLeadTime });

          if (!id || !dueDate || typeof reminderLeadTime !== 'number') {
            throw new Error('无效的提醒数据');
          }

          await chrome.alarms.create(`todo-${id}`, {
            when: dueDate - (reminderLeadTime * 60 * 1000)
          });
          sendResponse({ success: true });
          break;
        }

        case 'CANCEL_NOTIFICATION': {
          const { todoId } = message.payload;
          if (!todoId) {
            throw new Error('无效的待办事项 ID');
          }
          await chrome.alarms.clear(`todo-${todoId}`);
          sendResponse({ success: true });
          break;
        }

        default:
          throw new Error('未知的消息类型');
      }
    } catch (error) {
      console.error('操作失败:', error);
      sendResponse({
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  })();
  return true; // 保持消息通道开放，允许异步响应
});

// 确保自动初始化
initializeAlarms().catch(error => {
  console.error('自动初始化 Alarms API 失败:', error);
});

// 添加 alarms 监听器
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (!alarm.name.startsWith('todo-')) return;

  const todoId = alarm.name.replace('todo-', '');
  const todo = await TodoService.getTodo(todoId);
  
  if (!todo) {
    console.warn(`找不到ID为 ${todoId} 的待办事项，无法显示提醒`);
    return;
  }

  const i18n = I18n.getInstance();
  await NotificationService.showNotification(
    i18n.t('notifications.reminder') || '待办事项提醒',
    i18n.t('notifications.reminderMessage', { title: todo.title }) || `待办事项 "${todo.title}" 即将到期`,
    { requireInteraction: true }
  );
  
  // 标记为已提醒
  await TodoService.updateTodo(todoId, { reminded: true });
});

// 定期检查提醒（作为备份机制）
setInterval(checkTodoReminders, CHECK_INTERVAL);
// 启动时立即检查一次
checkTodoReminders();