import { TagService } from '../services/TagService';
import { I18n } from '../utils/i18n';
import { TagInfo } from '../types';

export class TagManager extends HTMLElement {
  private tags: TagInfo[] = [];
  private selectedTags: string[] = [];
  private i18n = I18n.getInstance();

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  static get observedAttributes() {
    return ['data-selected-tags'];
  }

  connectedCallback() {
    this.loadTags();
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (name === 'data-selected-tags') {
      this.selectedTags = JSON.parse(newValue || '[]');
      this.render();
    }
  }

  async loadTags() {
    try {
      this.tags = await TagService.getAllTags();
      this.render();
    } catch (error) {
      console.error('加载标签失败:', error);
    }
  }

  private async createTag(name: string, color: string) {
    try {
      await TagService.createTag(name, color);
      await this.loadTags();
      this.dispatchEvent(new CustomEvent('tagsChange'));
    } catch (error) {
      console.error('创建标签失败:', error);
      alert(error instanceof Error ? error.message : '创建标签失败');
    }
  }

  private renderErrorMessage(message: string) {
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    errorElement.style.cssText = `
      color: var(--error-color);
      padding: 8px 12px;
      margin: 8px 0;
      background: rgba(244, 67, 54, 0.1);
      border-left: 3px solid var(--error-color);
      border-radius: var(--border-radius-sm);
    `;
    
    // 添加到DOM
    const container = this.shadowRoot?.querySelector('.tag-container');
    if (container) {
      // 先删除任何现有错误消息
      const existingError = this.shadowRoot?.querySelector('.error-message');
      if (existingError) {
        existingError.remove();
      }
      
      container.insertAdjacentElement('afterend', errorElement);
      
      // 设置定时器自动移除错误消息
      setTimeout(() => {
        errorElement.style.opacity = '0';
        errorElement.style.transition = 'opacity 0.5s ease';
        setTimeout(() => errorElement.remove(), 500);
      }, 5000);
    }
  }

  private async deleteTag(tagId: string) {
    try {
      // 先检查标签是否被使用
      const tagInfo = await TagService.isTagUsed(tagId);
      if (tagInfo.used) {
        const message = `无法删除标签：此标签正被${tagInfo.count}个待办事项使用，删除后可能导致筛选问题`;
        this.renderErrorMessage(message);
        return;
      }
      
      if (!confirm('确定要删除这个标签吗？')) return;
      
      await TagService.deleteTag(tagId);
      await this.loadTags();
      this.dispatchEvent(new CustomEvent('tagsChange'));
    } catch (error) {
      console.error('删除标签失败:', error);
      const message = error instanceof Error ? error.message : '删除标签失败';
      this.renderErrorMessage(message);
    }
  }

  private handleTagClick(tagId: string) {
    const event = new CustomEvent('tagSelect', {
      detail: { tagId },
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(event);
  }

  private render() {
    if (!this.shadowRoot) return;

    const style = `
      <style>
        :host {
          display: block;
          margin: 8px 0;
        }
        .tag-container {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 8px;
        }
        .tag {
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          user-select: none;
          transition: opacity 0.2s;
        }
        .tag:hover {
          opacity: 0.8;
        }
        .tag.selected {
          outline: 2px solid var(--primary-color);
        }
        .delete-btn {
          border: none;
          background: none;
          color: inherit;
          padding: 0;
          font: inherit;
          cursor: pointer;
          opacity: 0.6;
        }
        .delete-btn:hover {
          opacity: 1;
        }
        .add-tag {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 8px;
        }
        .input-row {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        .color-picker {
          width: 40px;
          height: 30px;
          padding: 0;
          border: 1px solid var(--border-color);
          border-radius: 4px;
        }
        .add-tag input {
          flex: 1;
          padding: 4px 8px;
          border: 1px solid var(--border-color);
          border-radius: 4px;
        }
        .add-tag button {
          padding: 4px 12px;
          background: var(--primary-color);
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .error-message {
          color: var(--error-color);
          padding: 8px 12px;
          margin: 8px 0;
          background: rgba(244, 67, 54, 0.1);
          border-left: 3px solid var(--error-color);
          border-radius: 4px;
          font-size: 13px;
        }
      </style>
    `;

    this.shadowRoot.innerHTML = `
      ${style}
      <div class="tag-container">
        ${this.tags.map(tag => `
          <div class="tag ${this.selectedTags.includes(tag.id) ? 'selected' : ''}"
               style="background-color: ${tag.color}; color: white;"
               data-tag-id="${tag.id}">
            ${tag.name}
            <button class="delete-btn" data-tag-id="${tag.id}">×</button>
          </div>
        `).join('')}
      </div>
      <div class="add-tag">
        <div class="input-row">
          <input type="text" id="newTagInput" placeholder="${this.i18n.t('tag.add')}">
          <input type="color" id="tagColor" class="color-picker" 
                 value="${this.getDefaultColor()}"
                 title="选择标签颜色">
          <button id="addTagBtn">${this.i18n.t('button.add')}</button>
        </div>
      </div>
    `;

    this.setupEventListeners();
  }

  private setupEventListeners() {
    const container = this.shadowRoot!.querySelector('.tag-container');
    const addBtn = this.shadowRoot!.querySelector('#addTagBtn');
    const input = this.shadowRoot!.querySelector('#newTagInput') as HTMLInputElement;
    const colorInput = this.shadowRoot!.querySelector('#tagColor') as HTMLInputElement;

    // 标签点击事件
    container?.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const tagElement = target.closest('.tag') as HTMLElement;
      if (tagElement) {
        const tagId = tagElement.dataset.tagId;
        if (tagId) {
          if (target.classList.contains('delete-btn')) {
            this.deleteTag(tagId);
          } else {
            this.handleTagClick(tagId);
          }
        }
      }
    });

    // 添加标签事件
    const handleAdd = () => {
      const name = input.value.trim();
      const color = colorInput.value;
      if (name) {
        this.createTag(name, color);
        input.value = '';
      }
    };

    addBtn?.addEventListener('click', handleAdd);
    input?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        handleAdd();
      }
    });
  }

  private getDefaultColor(): string {
    const defaultColors = [
      '#4a90e2', '#27ae60', '#e74c3c', '#f1c40f',
      '#9b59b6', '#e67e22', '#1abc9c', '#34495e'
    ];
    return defaultColors[this.tags.length % defaultColors.length];
  }
}

customElements.define('tag-manager', TagManager);