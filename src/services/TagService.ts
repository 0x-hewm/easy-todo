import { TagInfo, TodoState } from '../types';
import { StorageService } from './StorageService';
import { I18n } from '../utils/i18n';

export class TagService {
  private static readonly DEFAULT_COLORS = [
    '#4a90e2', // 蓝色
    '#27ae60', // 绿色
    '#e74c3c', // 红色
    '#f1c40f', // 黄色
    '#9b59b6', // 紫色
    '#e67e22', // 橙色
    '#1abc9c', // 青色
    '#34495e'  // 深灰色
  ];
  
  private static i18n = I18n.getInstance();

  static async getAllTags(): Promise<TagInfo[]> {
    const state = await StorageService.getState();
    return state.tags || [];
  }

  static async createTag(name: string, color: string): Promise<TagInfo> {
    const state = await StorageService.getState();
    const existingTag = state.tags?.find(tag => tag.name === name);
    
    if (existingTag) {
      throw new Error('标签已存在');
    }

    const newTag: TagInfo = {
      id: crypto.randomUUID(),
      name,
      color: color || this.getNextColor(state.tags || []), // 使用传入的颜色或默认颜色
      createAt: Date.now()
    };

    state.tags = [...(state.tags || []), newTag];
    await StorageService.setState(state);
    return newTag;
  }

  static async updateTag(tagId: string, updates: Partial<TagInfo>): Promise<TagInfo> {
    const state = await StorageService.getState();
    const tagIndex = state.tags?.findIndex(tag => tag.id === tagId) ?? -1;
    
    if (tagIndex === -1) {
      throw new Error('标签不存在');
    }

    if (updates.name && state.tags?.some(tag => tag.name === updates.name && tag.id !== tagId)) {
      throw new Error('标签名称已存在');
    }

    const updatedTag = {
      ...state.tags![tagIndex],
      ...updates,
      id: tagId // 确保 ID 不被修改
    };

    state.tags![tagIndex] = updatedTag;
    await StorageService.setState(state);
    return updatedTag;
  }

  static async deleteTag(tagId: string): Promise<void> {
    const state = await StorageService.getState();
    
    // 检查标签是否被任务使用
    const taggedTodos = state.todos.filter(todo => todo.tags.includes(tagId));
    
    // 如果有任务使用此标签，禁止删除
    if (taggedTodos.length > 0) {
      throw new Error(`标签已被${taggedTodos.length}个待办事项使用，删除后可能导致筛选问题`);
    }
    
    // 从标签列表中删除
    state.tags = state.tags?.filter(tag => tag.id !== tagId) || [];
    
    await StorageService.setState(state);
  }

  static async addTagToTodo(todoId: string, tagId: string): Promise<void> {
    const state = await StorageService.getState();
    const todo = state.todos.find(t => t.id === todoId);
    
    if (!todo) {
      throw new Error('任务不存在');
    }

    if (!state.tags?.some(tag => tag.id === tagId)) {
      throw new Error('标签不存在');
    }

    if (!todo.tags.includes(tagId)) {
      todo.tags.push(tagId);
      await StorageService.updateTodo(todo);
    }
  }

  static async removeTagFromTodo(todoId: string, tagId: string): Promise<void> {
    const state = await StorageService.getState();
    const todo = state.todos.find(t => t.id === todoId);
    
    if (!todo) {
      throw new Error('任务不存在');
    }

    todo.tags = todo.tags.filter(id => id !== tagId);
    await StorageService.updateTodo(todo);
  }

  // 添加一个方法检查是否有标签
  static async hasAnyTags(): Promise<boolean> {
    const tags = await this.getAllTags();
    return tags.length > 0;
  }

  // 添加一个方法检查某个标签是否被使用
  static async isTagUsed(tagId: string): Promise<{used: boolean, count: number}> {
    const state = await StorageService.getState();
    const taggedTodos = state.todos.filter(todo => todo.tags.includes(tagId));
    return { used: taggedTodos.length > 0, count: taggedTodos.length };
  }

  private static getNextColor(existingTags: TagInfo[]): string {
    const usedColors = new Set(existingTags.map(tag => tag.color));
    const availableColor = this.DEFAULT_COLORS.find(color => !usedColors.has(color));
    return availableColor || this.DEFAULT_COLORS[Math.floor(Math.random() * this.DEFAULT_COLORS.length)];
  }
}