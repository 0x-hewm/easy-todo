import { Todo } from '../types';
import { StorageService } from './StorageService';

export interface TodoTemplate {
  id: string;
  name: string;
  description?: string;
  todo: Partial<Todo>;
  createdAt: number;
  updatedAt: number;
}

export class TemplateService {
  private static readonly TEMPLATES_KEY = 'todo-templates';

  static async getTemplates(): Promise<TodoTemplate[]> {
    const result = await chrome.storage.local.get(this.TEMPLATES_KEY);
    return result[this.TEMPLATES_KEY] || [];
  }

  static async saveTemplate(template: Omit<TodoTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<TodoTemplate> {
    const templates = await this.getTemplates();
    const newTemplate: TodoTemplate = {
      ...template,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    await chrome.storage.local.set({
      [this.TEMPLATES_KEY]: [...templates, newTemplate]
    });
    
    return newTemplate;
  }

  static async deleteTemplate(id: string): Promise<void> {
    const templates = await this.getTemplates();
    await chrome.storage.local.set({
      [this.TEMPLATES_KEY]: templates.filter(t => t.id !== id)
    });
  }

  static async createTodoFromTemplate(templateId: string): Promise<Todo | null> {
    const templates = await this.getTemplates();
    const template = templates.find(t => t.id === templateId);
    
    if (!template) return null;

    return {
      id: crypto.randomUUID(),
      title: template.todo.title || '',
      description: template.todo.description,
      completed: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      priority: template.todo.priority || 'medium',
      tags: template.todo.tags || [],
      dueDate: template.todo.dueDate,
      reminderLeadTime: template.todo.reminderLeadTime,
      reminded: false // 添加 reminded 属性
    };
  }

  static async updateTemplate(
    id: string, 
    updates: Partial<Omit<TodoTemplate, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<TodoTemplate | null> {
    const templates = await this.getTemplates();
    const templateIndex = templates.findIndex(t => t.id === id);
    
    if (templateIndex === -1) return null;
    
    const updatedTemplate: TodoTemplate = {
      ...templates[templateIndex],
      ...updates,
      updatedAt: Date.now()
    };
    
    templates[templateIndex] = updatedTemplate;
    await chrome.storage.local.set({ [this.TEMPLATES_KEY]: templates });
    
    return updatedTemplate;
  }

  static async duplicateTemplate(id: string): Promise<TodoTemplate | null> {
    const templates = await this.getTemplates();
    const template = templates.find(t => t.id === id);
    
    if (!template) return null;
    
    const newTemplate: TodoTemplate = {
      ...template,
      id: crypto.randomUUID(),
      name: `${template.name} (复制)`,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    templates.push(newTemplate);
    await chrome.storage.local.set({ [this.TEMPLATES_KEY]: templates });
    
    return newTemplate;
  }
}
