import { TodoTemplate, TemplateService } from '../services/TemplateService';
import { NotificationService } from '../services/NotificationService';

export class TemplateManager extends HTMLElement {
  private templates: TodoTemplate[] = [];

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.loadTemplates();
  }

  private async loadTemplates() {
    try {
      this.templates = await TemplateService.getTemplates();
      this.render();
    } catch (error) {
      console.error('加载模板失败:', error);
      NotificationService.showNotification('错误', '加载模板失败', {});
    }
  }

  private async saveCurrentAsTemplate() {
    const todo = this.getCurrentTodo();
    if (!todo) return;

    try {
      const template = await TemplateService.saveTemplate({
        name: todo.title,
        description: '从当前任务创建的模板',
        todo: todo
      });
      
      this.templates.push(template);
      this.render();
      NotificationService.showNotification('成功', '模板保存成功');
    } catch (error) {
      console.error('保存模板失败:', error);
      NotificationService.showNotification('错误', '保存模板失败');
    }
  }

  private getCurrentTodo() {
    // 获取当前正在编辑的任务
    const form = document.querySelector('task-form');
    if (!form) return null;
    
    // 获取表单数据
    const formData = new FormData(form.shadowRoot!.querySelector('form')!);
    return {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      priority: formData.get('priority') as 'low' | 'medium' | 'high',
      // ...其他字段...
    };
  }

  private render() {
    const style = `
      <style>
        :host {
          display: block;
          margin: 16px 0;
        }
        .template-list {
          display: grid;
          gap: 8px;
        }
        .template-item {
          display: flex;
          align-items: center;
          padding: 8px;
          background: var(--surface-color);
          border-radius: 4px;
          box-shadow: var(--shadow-sm);
        }
        .template-info {
          flex: 1;
        }
        .template-name {
          font-weight: bold;
        }
        .template-description {
          font-size: 0.9em;
          color: var(--text-secondary-color);
        }
        .actions {
          display: flex;
          gap: 8px;
        }
        button {
          padding: 4px 8px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          background: var(--primary-color);
          color: white;
        }
        .delete-btn {
          background: var(--error-color);
        }
      </style>
    `;

    const templatesHtml = this.templates.map(template => `
      <div class="template-item">
        <div class="template-info">
          <div class="template-name">${template.name}</div>
          <div class="template-description">${template.description || ''}</div>
        </div>
        <div class="actions">
          <button onclick="this.getRootNode().host.useTemplate('${template.id}')">
            使用模板
          </button>
          <button class="delete-btn" onclick="this.getRootNode().host.deleteTemplate('${template.id}')">
            删除
          </button>
        </div>
      </div>
    `).join('');

    this.shadowRoot!.innerHTML = `
      ${style}
      <div class="template-list">
        ${this.templates.length ? templatesHtml : '<div>暂无模板</div>'}
      </div>
      <button onclick="this.getRootNode().host.saveCurrentAsTemplate()">
        保存当前为模板
      </button>
    `;
  }

  private async useTemplate(id: string) {
    try {
      const todo = await TemplateService.createTodoFromTemplate(id);
      if (!todo) {
        throw new Error('模板不存在');
      }

      // 触发使用模板事件
      const event = new CustomEvent('useTemplate', {
        detail: { todo },
        bubbles: true,
        composed: true
      });
      this.dispatchEvent(event);
      
      NotificationService.showNotification('成功', '已应用模板', {});
    } catch (error) {
      console.error('使用模板失败:', error);
      NotificationService.showNotification('错误', '使用模板失败', {});
    }
  }

  private async deleteTemplate(id: string) {
    if (!confirm('确定要删除这个模板吗？')) return;

    try {
      await TemplateService.deleteTemplate(id);
      this.templates = this.templates.filter(t => t.id !== id);
      this.render();
      NotificationService.showNotification('成功', '模板已删除');
    } catch (error) {
      console.error('删除模板失败:', error);
      NotificationService.showNotification('错误', '删除模板失败');
    }
  }
}

customElements.define('template-manager', TemplateManager);
