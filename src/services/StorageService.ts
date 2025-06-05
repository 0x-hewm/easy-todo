import { Todo, TodoState } from '../types';

export class StorageService {
  public static readonly STORAGE_KEY = 'easy-todo-state';

  static async getState(): Promise<TodoState> {
    const result = await chrome.storage.local.get(this.STORAGE_KEY);
    return result[this.STORAGE_KEY] || { 
      todos: [],
      tags: [], // 添加空标签数组作为默认值
      filter: { status: 'all' },
      settings: {
        language: 'zh',
        reminderEnabled: true,
        reminderLeadTime: 60 // 默认提前60分钟提醒
      }
    };
  }

  static async setState(state: TodoState): Promise<void> {
    await chrome.storage.local.set({ [this.STORAGE_KEY]: state });
  }

  static async addTodo(todo: Todo): Promise<void> {
    const state = await this.getState();
    state.todos.push(todo);
    await this.setState(state);
  }

  static async updateTodo(todo: Todo): Promise<void> {
    const state = await this.getState();
    const index = state.todos.findIndex(t => t.id === todo.id);
    if (index !== -1) {
      state.todos[index] = todo;
      await this.setState(state);
    }
  }

  static async deleteTodo(todoId: string): Promise<void> {
    const state = await this.getState();
    state.todos = state.todos.filter(todo => todo.id !== todoId);
    await this.setState(state);
  }

  static async updateFilter(filter: Partial<TodoState['filter']>): Promise<void> {
    const state = await this.getState();
    state.filter = { ...state.filter, ...filter };
    await this.setState(state);
  }

  static async updateSettings(settings: Partial<TodoState['settings']>): Promise<void> {
    const state = await this.getState();
    const defaultSettings = {
      language: 'zh' as const,
      reminderEnabled: true,
      reminderLeadTime: 60
    };
    state.settings = {
      ...defaultSettings,
      ...state.settings,
      ...settings
    };
    await this.setState(state);
  }

  // 导出数据
  static async exportData(): Promise<string> {
    const state = await this.getState();
    const exportData = {
      version: '1.0',
      timestamp: Date.now(),
      data: state
    };
    return JSON.stringify(exportData, null, 2);
  }

  // 导入数据
  static async importData(jsonData: string): Promise<boolean> {
    try {
      const importedData = JSON.parse(jsonData);
      
      // 验证数据...
      
      await this.setState(importedData.data);
      
      // 在 Service Worker 中，直接返回成功
      return true;
    } catch (error) {
      console.error('Data import failed:', error);
      return false;
    }
  }

  // 清除所有数据
  static async clearAllData(): Promise<void> {
    await chrome.storage.local.remove(this.STORAGE_KEY);
  }
}