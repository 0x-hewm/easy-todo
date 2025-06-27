import { TagService } from '../services/TagService';
import { TagInfo, Todo } from '../types';
import { I18n } from '../utils/i18n';

export class TaskForm extends HTMLElement {
  private form: HTMLFormElement | null = null;
  private tags: TagInfo[] = [];
  private selectedTagIds: string[] = [];
  private currentTodoId: string | null = null;
  private i18n = I18n.getInstance();

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  async connectedCallback() {
    await this.loadTags();
    this.render();
    this.setupListeners();
  }

  private async loadTags() {
    try {
      this.tags = await TagService.getAllTags();
    } catch (error) {
      console.error('加载标签失败:', error);
    }
  }

  private render() {
    if (!this.shadowRoot) return;

    const now = new Date();
    const minDateTime = now.toISOString().slice(0, 16);

    const formTitle = this.currentTodoId
      ? this.i18n.t('todo.edit')
      : this.i18n.t('todo.add');
    const saveButtonText = this.currentTodoId
      ? this.i18n.t('todo.save')
      : this.i18n.t('todo.add');

    const style = `
      <style>
        :host {
          display: block;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.6);
          z-index: 1000;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 16px;
          box-sizing: border-box;
        }
        .task-form {
          width: 90%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
          background: var(--background-color);
          padding: 24px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          animation: slide-up 0.3s ease;
        }
        @keyframes slide-up {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .form-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 12px;
        }
        .form-title {
          font-size: 20px;
          font-weight: 600;
          color: var(--primary-color);
          margin: 0;
        }
        .input-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 8px;
        }
        label {
          font-size: 14px;
          font-weight: 500;
          color: var(--text-color);
        }
        input, textarea, select {
          padding: 10px 12px;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          font-size: 14px;
          transition: all 0.2s;
          background: var(--surface-color);
          color: var(--text-color);
        }
        textarea {
          resize: vertical;
          min-height: 100px;
        }
        input[type="datetime-local"] {
          appearance: none;
          -webkit-appearance: none;
          background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="gray" viewBox="0 0 16 16"><path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5z"/></svg>');
          background-repeat: no-repeat;
          background-position: right 10px center;
          background-size: 16px;
          padding-right: 32px;
          cursor: pointer;
          font-family: inherit;
        }
        input[type="datetime-local"]:focus {
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.15);
          outline: none;
        }
        .form-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 16px;
          border-top: 1px solid var(--border-color);
          padding-top: 16px;
        }
        button {
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s;
        }
        .submit-btn {
          background: var(--primary-color);
          color: white;
        }
        .submit-btn:hover {
          background: #1976d2;
          transform: translateY(-1px);
        }
        .cancel-btn {
          background: #f5f5f5;
          color: #666;
        }
        .cancel-btn:hover {
          background: #e0e0e0;
        }
        .tag-selector {
          margin: 8px 0;
        }
        .tag-list {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          padding: 12px;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          min-height: 50px;
        }
        .tag-item {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 20px;
          cursor: pointer;
          user-select: none;
          transition: all 0.2s ease;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .tag-item.selected {
          transform: scale(1.05);
          box-shadow: 0 0 0 2px var(--primary-color), 0 2px 4px rgba(0,0,0,0.1);
        }
        .tag-label {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }
        .selected-count {
          font-size: 12px;
          color: var(--text-secondary-color);
          background: var(--surface-color);
          padding: 2px 8px;
          border-radius: 12px;
        }
        .error-message {
          color: #f44336;
          font-size: 12px;
          margin-top: 4px;
          display: none;
        }
        .input-group.error input,
        .input-group.error textarea,
        .input-group.error select {
          border-color: #f44336;
        }
        .input-group.error .error-message {
          display: block;
        }
      </style>
    `;

    this.shadowRoot.innerHTML = `
      ${style}
      <form class="task-form" novalidate>
        <div class="form-header">
          <h2 class="form-title">${formTitle}</h2>
        </div>
        <div class="input-group">
          <label for="title">${this.i18n.t('todo.title')}</label>
          <input type="text" id="title" name="title" required placeholder="${this.i18n.t('todo.titlePlaceholder')}">
          <div class="error-message">${this.i18n.t('todo.titleRequired')}</div>
        </div>
        <div class="input-group">
          <label for="description">${this.i18n.t('todo.description')}</label>
          <textarea id="description" name="description" placeholder="${this.i18n.t('todo.descriptionPlaceholder')}"></textarea>
        </div>
        <div class="input-group">
          <label for="dueDate">${this.i18n.t('todo.dueDate')}</label>
          <input type="datetime-local" 
                 id="dueDate" 
                 name="dueDate"
                 min="${minDateTime}">
          <div class="error-message">${this.i18n.t('todo.dueDateError')}</div>
        </div>
        <div class="input-group">
          <label for="reminderTime">${this.i18n.t('todo.reminderTime')}</label>
          <select id="reminderTime" name="reminderTime">
            <option value="">${this.i18n.t('todo.noReminder')}</option>
            <option value="0">${this.i18n.t('todo.atDueTime')}</option>
            <option value="15">${this.i18n.t('todo.before15Min')}</option>
            <option value="30">${this.i18n.t('todo.before30Min')}</option>
            <option value="60" selected>${this.i18n.t('todo.before1Hour')}</option>
            <option value="120">${this.i18n.t('todo.before2Hours')}</option>
            <option value="1440">${this.i18n.t('todo.before1Day')}</option>
            <option value="custom">${this.i18n.t('todo.customTime')}</option>
          </select>
          <div id="customReminderInput" style="display: none; margin-top: 8px;">
            <input type="number" name="customMinutes" min="1" placeholder="${this.i18n.t('todo.customMinutes')}">
          </div>
        </div>
        <div class="input-group">
          <div class="tag-label">
            <label>${this.i18n.t('tags.title')}</label>
            <span class="selected-count">${this.selectedTagIds.length} ${this.i18n.t('tags.selected')}</span>
          </div>
          <div class="tag-selector">
            <div id="tagList" class="tag-list"></div>
          </div>
        </div>
        <div class="form-footer">
          <button type="button" class="cancel-btn">${this.i18n.t('todo.cancel')}</button>
          <button type="submit" class="submit-btn">${saveButtonText}</button>
        </div>
      </form>
    `;

    this.renderTags();
    this.form = this.shadowRoot.querySelector('form');
    const reminderSelect = this.shadowRoot.querySelector(
      '#reminderTime'
    ) as HTMLSelectElement;
    const customReminderInput = this.shadowRoot.querySelector(
      '#customReminderInput'
    ) as HTMLDivElement;

    reminderSelect.addEventListener('change', () => {
      customReminderInput.style.display =
        reminderSelect.value === 'custom' ? 'block' : 'none';
    });
  }

  private async renderTags() {
    const tagList = this.shadowRoot!.querySelector('#tagList');
    if (!tagList) return;

    if (this.tags.length === 0) {
      tagList.innerHTML = '<div class="empty-message">暂无可用标签</div>';
      return;
    }

    tagList.innerHTML = this.tags
      .map(
        tag => `
      <div class="tag-item ${this.selectedTagIds.includes(tag.id) ? 'selected' : ''}"
           data-tag-id="${tag.id}"
           style="background-color: ${tag.color}; color: white;">
        ${tag.name}
      </div>
    `
      )
      .join('');

    this.setupTagListeners();
  }

  private setupListeners() {
    if (!this.form) return;

    this.form.addEventListener('submit', e => {
      e.preventDefault();
      const formData = new FormData(this.form!);
      const title = formData.get('title') as string;

      if (!title.trim()) {
        alert('标题不能为空');
        return;
      }

      const dueDate = formData.get('dueDate') as string;
      let dueDateTimestamp: number | undefined = undefined;

      if (dueDate) {
        try {
          const [datePart, timePart] = dueDate.split('T');
          if (!datePart || !timePart) {
            alert('日期格式无效');
            return;
          }

          const [year, month, day] = datePart.split('-').map(Number);
          const [hours, minutes] = timePart.split(':').map(Number);

          if (
            !year ||
            !month ||
            !day ||
            hours === undefined ||
            minutes === undefined
          ) {
            alert('日期或时间格式无效');
            return;
          }

          const selectedDate = new Date(year, month - 1, day, hours, minutes);
          const now = Date.now();

          if (selectedDate.getTime() < now) {
            alert('截止时间不能早于当前时间');
            return;
          }

          dueDateTimestamp = selectedDate.getTime();
        } catch (error) {
          console.error('日期解析错误:', error);
          alert('日期格式无效');
          return;
        }
      }

      // 确保选中提醒时间时，截止日期也已设置
      const reminderLeadTime: number | undefined =
        this.getReminderTime(formData);
      if (reminderLeadTime !== undefined && dueDateTimestamp === undefined) {
        alert('设置提醒时必须设置截止时间');
        return;
      }

      const todo = {
        id: this.currentTodoId || undefined,
        title: title.trim(),
        description: ((formData.get('description') as string) || '').trim(),
        priority:
          (formData.get('priority') as 'low' | 'medium' | 'high') || 'medium',
        dueDate: dueDateTimestamp,
        tags: this.selectedTagIds,
        reminderLeadTime,
      };

      const event = new CustomEvent('todoSubmit', {
        detail: todo,
        bubbles: true,
        composed: true,
      });
      this.dispatchEvent(event);
    });

    const cancelBtn = this.shadowRoot!.querySelector('.cancel-btn');
    cancelBtn?.addEventListener('click', () => {
      const event = new CustomEvent('formCancel', {
        bubbles: true,
        composed: true,
      });
      this.dispatchEvent(event);
    });

    this.addEventListener('requestFormData', () => {
      if (!this.form) return;

      const formData = new FormData(this.form);
      const todoData = {
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        tags: this.selectedTagIds,
        dueDate: formData.get('dueDate') as string,
        reminderLeadTime: this.getReminderTime(formData),
      };

      const event = new CustomEvent('formDataResponse', {
        detail: todoData,
        bubbles: true,
        composed: true,
      });
      this.dispatchEvent(event);
    });
  }

  private getReminderTime(formData: FormData): number | undefined {
    const reminderType = formData.get('reminderType') as string;

    if (!reminderType || reminderType === 'none') return undefined;

    switch (reminderType) {
      case 'atTime':
        return 0;
      case '15min':
        return 15;
      case '30min':
        return 30;
      case '1hour':
        return 60;
      case '2hours':
        return 120;
      case '1day':
        return 1440;
      case 'custom':
        const customMinutes = formData.get('customMinutes');
        return customMinutes
          ? parseInt(customMinutes as string, 10)
          : undefined;
      default:
        return undefined;
    }
  }

  private setupTagListeners() {
    this.shadowRoot!.querySelectorAll('.tag-item').forEach(tag => {
      tag.addEventListener('click', e => {
        const tagId = (e.currentTarget as HTMLElement).dataset.tagId;
        if (!tagId) return;

        const index = this.selectedTagIds.indexOf(tagId);
        if (index === -1) {
          this.selectedTagIds.push(tagId);
        } else {
          this.selectedTagIds.splice(index, 1);
        }

        this.renderTags();
        const event = new CustomEvent('tagsChange', {
          detail: { selectedTags: this.selectedTagIds },
          bubbles: true,
          composed: true,
        });
        this.dispatchEvent(event);
      });
    });
  }

  public setFormData(todo: Partial<Todo>) {
    if (!this.form) return;

    this.currentTodoId = todo.id || null;
    const titleInput = this.form.querySelector('#title') as HTMLInputElement;
    titleInput.value = todo.title || '';

    const descriptionInput = this.form.querySelector(
      '#description'
    ) as HTMLTextAreaElement;
    const dueDateInput = this.form.querySelector(
      '#dueDate'
    ) as HTMLInputElement;

    if (todo.description) descriptionInput.value = todo.description;

    // 安全地处理dueDate
    if (todo.dueDate !== undefined && todo.dueDate !== null) {
      const date = new Date(todo.dueDate);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');

      const dateTimeStr = `${year}-${month}-${day}T${hours}:${minutes}`;
      dueDateInput.value = dateTimeStr;
    } else {
      dueDateInput.value = '';
    }

    if (todo.tags) {
      this.selectedTagIds = [...todo.tags];
      this.renderTags();
    }

    const reminderSelect = this.form.querySelector(
      '#reminderTime'
    ) as HTMLSelectElement;
    const customReminderInput = this.form.querySelector(
      'input[name="customMinutes"]'
    ) as HTMLInputElement;

    if (todo.reminderLeadTime !== undefined) {
      const standardTimes = [0, 15, 30, 60, 120, 1440];
      if (standardTimes.includes(todo.reminderLeadTime)) {
        reminderSelect.value = todo.reminderLeadTime.toString();
      } else {
        reminderSelect.value = 'custom';
        customReminderInput.value = todo.reminderLeadTime.toString();
        this.shadowRoot
          ?.querySelector('#customReminderInput')
          ?.setAttribute('style', 'display: block');
      }
    }

    const formTitle = this.shadowRoot!.querySelector(
      '.form-title'
    ) as HTMLHeadingElement;
    const submitBtn = this.form.querySelector(
      '.submit-btn'
    ) as HTMLButtonElement;

    formTitle.textContent = this.currentTodoId
      ? this.i18n.t('todo.edit')
      : this.i18n.t('todo.add');
    submitBtn.textContent = this.currentTodoId
      ? this.i18n.t('todo.save')
      : this.i18n.t('todo.add');
  }

  public reset() {
    if (!this.form) return;
    this.form.reset();
    this.selectedTagIds = [];
    this.currentTodoId = null; // 重置任务 ID
    const submitBtn = this.form.querySelector(
      '.submit-btn'
    ) as HTMLButtonElement;
    submitBtn.textContent = '添加';
    this.renderTags();
  }

  public async refresh() {
    await this.loadTags();
    await this.renderTags();
  }
}

customElements.define('task-form', TaskForm);
