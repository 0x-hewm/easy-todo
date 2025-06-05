import { Todo, TodoFilter, TodoState } from '../types';
import { StorageService } from './StorageService';
import { NotificationService } from './NotificationService';

export class TodoService {
  static async createTodo(
    title: string, 
    description?: string, 
    dueDate?: number, 
    tags: string[] = [],
    priority: 'low' | 'medium' | 'high' = 'medium',
    reminderLeadTime?: number
  ): Promise<Todo> {
    if (!title.trim()) {
      throw new Error('标题不能为空');
    }

    const todo: Todo = {
      id: crypto.randomUUID(),
      title: title.trim(),
      description: description?.trim(),
      dueDate,
      completed: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      priority,
      tags: tags || [],
      reminderLeadTime,
      reminded: false
    };

    // 验证截止日期
    if (todo.dueDate !== undefined && todo.dueDate < Date.now()) {
      throw new Error('截止日期不能早于当前时间');
    }

    // 创建提醒的逻辑优化
    if (todo.dueDate !== undefined && todo.reminderLeadTime !== undefined) {
      const reminderTime = todo.dueDate - (todo.reminderLeadTime * 60 * 1000);
      if (reminderTime < Date.now()) {
        throw new Error('提醒时间不能早于当前时间');
      }

      try {
        await NotificationService.scheduleNotification({
          id: todo.id,
          title: todo.title,
          dueDate: todo.dueDate,
          reminderLeadTime: todo.reminderLeadTime
        });
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(`设置提醒失败: ${error.message}`);
        }
        throw error;
      }
    }

    const state = await StorageService.getState();
    state.todos = [...state.todos, todo];
    await StorageService.setState(state);
    return todo;
  }

  static async getTodos(filter: TodoFilter): Promise<Todo[]> {
    const state = await StorageService.getState();
    return state.todos.filter(todo => {
      // 状态过滤
      if (filter.status && filter.status !== 'all') {
        if (filter.status === 'active' && todo.completed) return false;
        if (filter.status === 'completed' && !todo.completed) return false;
      }

      // 优先级过滤
      if (filter.priority && todo.priority !== filter.priority) return false;

      // 标签过滤
      if (filter.tags && filter.tags.length > 0) {
        if (!filter.tags.some(tagId => todo.tags.includes(tagId))) return false;
      }

      // 文本搜索
      if (filter.searchText) {
        const searchLower = filter.searchText.toLowerCase();
        const titleMatch = todo.title.toLowerCase().includes(searchLower);
        const descMatch = todo.description?.toLowerCase().includes(searchLower);
        if (!titleMatch && !descMatch) return false;
      }

      return true;
    });
  }

  static async getTodo(id: string): Promise<Todo | undefined> {
    const state = await StorageService.getState();
    return state.todos.find(todo => todo.id === id);
  }

  static async updateTodo(todoId: string, updates: Partial<Todo>): Promise<void> {
    try {
      const state = await StorageService.getState();
      const todoIndex = state.todos.findIndex(t => t.id === todoId);
      if (todoIndex === -1) {
        throw new Error('任务不存在');
      }

      const updatedTodo = {
        ...state.todos[todoIndex],
        ...updates,
        updatedAt: Date.now()
      };

      state.todos[todoIndex] = updatedTodo;
      await StorageService.setState(state);

      // 更新提醒
      if (updates.dueDate !== undefined || updates.reminderLeadTime !== undefined) {
        try {
          await NotificationService.cancelNotification(todoId);

          // 只有当dueDate和reminderLeadTime都存在时才设置提醒
          if (updatedTodo.dueDate !== undefined && 
              typeof updatedTodo.reminderLeadTime === 'number' && 
              updatedTodo.reminderLeadTime >= 0) {
            await NotificationService.scheduleNotification({
              id: todoId,
              title: updatedTodo.title,
              dueDate: updatedTodo.dueDate,
              reminderLeadTime: updatedTodo.reminderLeadTime
            });
          } else {
            console.debug(`未为任务 ${todoId} 设置提醒: 截止日期或提醒时间无效`);
          }
        } catch (error) {
          console.error(`更新任务 ${todoId} 的提醒失败:`, error);
        }
      }
    } catch (error) {
      console.error('更新任务失败:', error);
      throw error;
    }
  }

  static async deleteTodo(todoId: string): Promise<void> {
    await NotificationService.cancelNotification(todoId);

    const state = await StorageService.getState();
    state.todos = state.todos.filter(todo => todo.id !== todoId);
    await StorageService.setState(state);
  }

  static async toggleTodoStatus(todoId: string): Promise<void> {
    const state = await StorageService.getState();
    const todo = state.todos.find(t => t.id === todoId);
    
    if (!todo) {
      throw new Error('任务不存在');
    }

    todo.completed = !todo.completed;
    todo.updatedAt = Date.now();
    
    await StorageService.updateTodo(todo);
  }

  static async getStatistics(): Promise<{ total: number; completed: number; active: number }> {
    const state = await StorageService.getState();
    const total = state.todos.length;
    const completed = state.todos.filter(todo => todo.completed).length;
    
    return {
      total,
      completed,
      active: total - completed
    };
  }

  static async getTodosByTag(tagId: string): Promise<Todo[]> {
    const state = await StorageService.getState();
    return state.todos.filter(todo => todo.tags.includes(tagId));
  }

  static async updateTodoTags(todoId: string, tags: string[]): Promise<void> {
    const state = await StorageService.getState();
    const todo = state.todos.find(t => t.id === todoId);
    
    if (!todo) {
      throw new Error('任务不存在');
    }

    todo.tags = tags;
    todo.updatedAt = Date.now();
    await StorageService.updateTodo(todo);
  }

  static async updateTodosOrder(todos: Todo[]): Promise<void> {
    const state = await StorageService.getState();
    state.todos = todos;
    await StorageService.setState(state);
  }
}