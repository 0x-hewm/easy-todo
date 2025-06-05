import { Todo, TagInfo } from '../types';
import { DateUtils } from '../utils/date';
import { TagService } from '../services/TagService';
import { I18n } from '../utils/i18n';

export class TaskItem extends HTMLElement {
  private todo: Todo = {
    id: '',
    title: '',
    completed: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    priority: 'medium',
    tags: [],
    reminded: false
  };
  private tags: TagInfo[] = [];
  private i18n = I18n.getInstance();

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  static get observedAttributes() {
    return ['data-todo'];
  }

  connectedCallback() {
    this.loadTags();
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (name === 'data-todo') {
      this.todo = JSON.parse(newValue);
      this.loadTags();
    }
  }

  private async loadTags() {
    if (!this.todo) return;
    
    try {
      const allTags = await TagService.getAllTags();
      this.tags = allTags.filter(tag => this.todo.tags.includes(tag.id));
      this.render();
    } catch (error) {
      console.error('加载标签失败:', error);
    }
  }

  private formatDateTime(timestamp: number): string {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    return this.i18n.t('todo.dueDateTime', {
      year: year.toString(),
      month: month.toString(),
      day: day.toString()
    });
  }

  private render() {
    if (!this.shadowRoot || !this.todo) return;

    const style = `
      <style>
        :host {
          display: block;
          margin: 8px 0;
        }
        .todo-item {
          display: flex;
          flex-direction: column;
          padding: 16px;
          background: var(--surface-color);
          border-radius: var(--border-radius-md);
          box-shadow: var(--shadow-sm);
          transition: all var(--transition-normal);
        }
        .todo-item:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }
        .todo-item.completed {
          opacity: 0.8;
          background: var(--surface-color);
          border-left: none;
        }
        .priority-high { 
          border-left: 4px solid var(--error-color); 
          background-image: linear-gradient(to right, rgba(244, 67, 54, 0.05), transparent);
        }
        .priority-medium { 
          border-left: 4px solid var(--warning-color); 
          background-image: linear-gradient(to right, rgba(255, 152, 0, 0.05), transparent);
        }
        .priority-low { 
          border-left: 4px solid var(--success-color); 
          background-image: linear-gradient(to right, rgba(76, 175, 80, 0.05), transparent);
        }
        .todo-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
        }
        .checkbox {
          margin: 0;
          width: 20px;
          height: 20px;
          accent-color: var(--primary-color);
          cursor: pointer;
        }
        .content {
          flex: 1;
        }
        .title {
          margin: 0;
          font-size: 16px;
          color: var(--text-color);
          font-weight: 500;
        }
        .completed .title {
          text-decoration: line-through;
          opacity: 0.7;
        }
        .description {
          margin: 6px 0 0;
          font-size: 14px;
          color: var(--text-secondary-color);
          line-height: 1.4;
        }
        .meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 12px;
          font-size: 12px;
          color: var(--text-secondary-color);
        }
        .tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 10px;
        }
        .tag {
          padding: 3px 8px;
          border-radius: 12px;
          font-size: 11px;
          color: white;
          font-weight: 500;
          box-shadow: var(--shadow-sm);
        }
        .actions {
          display: flex;
          gap: 8px;
        }
        button {
          padding: 6px 10px;
          border: none;
          border-radius: var(--border-radius-sm);
          cursor: pointer;
          font-size: 12px;
          font-weight: 500;
          transition: all var(--transition-fast);
        }
        .delete-btn {
          background: var(--error-color);
          color: white;
        }
        .delete-btn:hover {
          background: #d32f2f;
        }
        .edit-btn {
          background: var(--primary-color);
          color: white;
        }
        .edit-btn:hover {
          background: #1976d2;
        }
        .due-date {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-weight: 500;
        }
        .overdue {
          color: var(--error-color);
        }
      </style>
    `;

    const now = Date.now();
    const isOverdue = this.todo.dueDate !== undefined && 
                      this.todo.dueDate < now && 
                      !this.todo.completed;
    const tagsHtml = this.tags.map(tag => `
      <span class="tag" style="background-color: ${tag.color}">${tag.name}</span>
    `).join('');

    this.shadowRoot.innerHTML = `
      ${style}
      <div class="todo-item priority-${this.todo.priority} ${this.todo.completed ? 'completed' : ''}">
        <div class="todo-header">
          <input type="checkbox" class="checkbox" ${this.todo.completed ? 'checked' : ''}>
          <div class="content">
            <h3 class="title">${this.todo.title}</h3>
            ${this.todo.description ? `<p class="description">${this.todo.description}</p>` : ''}
          </div>
          <div class="actions">
            <button class="edit-btn">${this.i18n.t('button.edit')}</button>
            <button class="delete-btn">${this.i18n.t('button.delete')}</button>
          </div>
        </div>
        ${this.tags.length > 0 ? `<div class="tags">${tagsHtml}</div>` : ''}
        <div class="meta">
          <span>${this.i18n.t('todo.createdAt')} ${this.formatDateTime(this.todo.createdAt)}</span>
          ${this.todo.dueDate !== undefined ? `
            <span class="due-date ${isOverdue ? 'overdue' : ''}">
              ${this.i18n.t('todo.dueDate')} ${this.formatDateTime(this.todo.dueDate)}
              ${isOverdue ? ` (${this.i18n.t('todo.overdue')})` : ''}
            </span>` : ''}
        </div>
      </div>
    `;

    this.addEventListeners();
  }

  private addEventListeners() {
    if (!this.shadowRoot) return;

    const checkbox = this.shadowRoot.querySelector('.checkbox');
    const deleteBtn = this.shadowRoot.querySelector('.delete-btn');
    const editBtn = this.shadowRoot.querySelector('.edit-btn');

    checkbox?.addEventListener('change', () => {
      const event = new CustomEvent('todoToggle', {
        detail: { id: this.todo.id },
        bubbles: true,
        composed: true
      });
      this.dispatchEvent(event);
    });

    deleteBtn?.addEventListener('click', () => {
      const event = new CustomEvent('todoDelete', {
        detail: { id: this.todo.id },
        bubbles: true,
        composed: true
      });
      this.dispatchEvent(event);
    });

    editBtn?.addEventListener('click', () => {
      const event = new CustomEvent('todoEdit', {
        detail: { todo: this.todo },
        bubbles: true,
        composed: true
      });
      this.dispatchEvent(event);
    });
  }
}

customElements.define('task-item', TaskItem);