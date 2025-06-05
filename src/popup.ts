import { TodoService } from './services/TodoService';
import { StorageService } from './services/StorageService';
import { TagService } from './services/TagService';
import { TodoFilter, Todo } from './types';
import { ThemeManager } from './utils/theme';
import { I18n } from './utils/i18n';
import './components/TaskForm';
import './components/TaskItem';
import './components/TaskList';
import './components/TaskStats';
import './components/TagManager';
import './components/ShortcutHints';
import { AnalyticsView } from './components/AnalyticsView';

class PopupManager {
  private todoList: HTMLElement;
  private taskStats: HTMLElement;
  private todoForm: HTMLElement;
  private themeToggle: HTMLButtonElement;
  private languageSelect: HTMLSelectElement;
  private addTodoBtn: HTMLButtonElement;
  private newTodoInput: HTMLInputElement;
  private statusFilter: HTMLSelectElement;
  private searchInput: HTMLInputElement;
  private exportBtn: HTMLButtonElement;
  private importBtn: HTMLButtonElement;
  private importFile: HTMLInputElement;
  private tagManager: HTMLElement;
  private settingsBtn: HTMLButtonElement;
  private selectedTags: string[] = [];
  private selectedQuickTags: string[] = [];

  private themeManager = ThemeManager.getInstance();
  private i18n = I18n.getInstance();

  constructor() {
    // 初始化 DOM 元素
    this.todoList = document.getElementById('todoList') as HTMLElement;
    this.taskStats = document.getElementById('taskStats') as HTMLElement;
    this.todoForm = document.getElementById('todoForm') as HTMLElement;
    this.themeToggle = document.getElementById('themeToggle') as HTMLButtonElement;
    this.languageSelect = document.getElementById('languageSelect') as HTMLSelectElement;
    this.addTodoBtn = document.getElementById('addTodoBtn') as HTMLButtonElement;
    this.newTodoInput = document.getElementById('newTodoInput') as HTMLInputElement;
    this.statusFilter = document.getElementById('statusFilter') as HTMLSelectElement;
    this.searchInput = document.getElementById('searchInput') as HTMLInputElement;
    this.exportBtn = document.getElementById('exportBtn') as HTMLButtonElement;
    this.importBtn = document.getElementById('importBtn') as HTMLButtonElement;
    this.importFile = document.getElementById('importFile') as HTMLInputElement;
    this.tagManager = document.getElementById('tagManager') as HTMLElement;
    this.settingsBtn = document.getElementById('settingsBtn') as HTMLButtonElement;

    // 修改设置按钮点击事件
    const dropdownMenu = document.querySelector('.dropdown-menu');
    
    this.settingsBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.settingsBtn.classList.toggle('active');
    });

    // 点击外部关闭下拉菜单
    document.addEventListener('click', (e) => {
      // 修改条件，使其更直接地检查是否点击在settingsBtn之外
      if (e.target !== this.settingsBtn && !this.settingsBtn.contains(e.target as Node)) {
        this.settingsBtn?.classList.remove('active');
      }
    });

    // ESC 键关闭下拉菜单
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.settingsBtn?.classList.remove('active');
      }
    });

    // 添加语言变更监听
    window.addEventListener('languageChange', () => {
      this.updateAllTranslations();
    });

    this.initializeEventListeners();
    this.initializeComponents().catch(error => {
      console.error('初始化失败:', error);
    });

    // 添加全局状态变化监听
    window.addEventListener('todoStateChange', async () => {
      await this.refreshTodoList();
      await this.renderQuickTags();
    });
  }

  private async initializeComponents() {
    try {
      // 显示加载状态
      this.showLoadingState();
      
      await this.themeManager.loadTheme();
      await this.i18n.init();
      await this.refreshTodoList();
      this.updateTranslations();

      // 初始化模板管理器
      const templateManager = document.querySelector('template-manager') as HTMLElementTagNameMap['template-manager'];
      if (templateManager) {
        templateManager.addEventListener('useTemplate', (e: Event) => {
          const { todo } = (e as CustomEvent).detail;
          const todoForm = document.querySelector('task-form') as HTMLElementTagNameMap['task-form'];
          if (todoForm) {
            todoForm.setFormData(todo);
            todoForm.style.display = 'block';
          }
        });
      }

      // 初始化数据分析视图
      const analyticsView = document.querySelector('analytics-view') as AnalyticsView;
      if (analyticsView) {
        // 当任务状态改变时刷新统计数据
        document.addEventListener('todoStateChange', () => {
          analyticsView.refresh();
        });
      }

      // 设置标签变化监听器
      this.setupTagChangeListener();
      
      // 必须在这里调用renderQuickTags，确保DOM已经初始化
      await this.renderQuickTags();

      // 初始检查是否有标签，决定是否显示标签选择器
      const hasAnyTags = await TagService.hasAnyTags();
      const tagSelectorContainer = document.querySelector('.tags-selector') as HTMLElement;
      if (tagSelectorContainer) {
        tagSelectorContainer.style.display = hasAnyTags ? 'block' : 'none';
      }
      
      // 设置通知权限
      await this.requestNotificationPermission();
      
      // 隐藏加载状态
      this.hideLoadingState();
    } catch (error) {
      console.error('组件初始化失败:', error);
      this.showErrorState('组件初始化失败，请刷新重试');
      throw error;
    }
  }

  private async requestNotificationPermission() {
    try {
      // 请求通知权限
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        console.log('通知权限状态:', permission);
      }
    } catch (error) {
      console.warn('无法初始化通知系统:', error);
    }
  }

  private showLoadingState() {
    const loadingEl = document.createElement('div');
    loadingEl.id = 'app-loading';
    loadingEl.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: var(--background-color);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 9999;
      ">
        <div style="
          width: 40px;
          height: 40px;
          border: 3px solid var(--border-color);
          border-top-color: var(--primary-color);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        "></div>
        <p style="margin-top: 16px; color: var(--text-color);">正在加载...</p>
      </div>
      <style>
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      </style>
    `;
    document.body.appendChild(loadingEl);
  }

  private hideLoadingState() {
    const loadingEl = document.getElementById('app-loading');
    if (loadingEl) {
      loadingEl.style.opacity = '0';
      loadingEl.style.transition = 'opacity 0.5s';
      setTimeout(() => {
        loadingEl.remove();
      }, 500);
    }
  }

  private showErrorState(message: string) {
    const errorEl = document.createElement('div');
    errorEl.innerHTML = `
      <div style="
        padding: 16px;
        margin: 16px;
        background: rgba(244, 67, 54, 0.1);
        border-left: 4px solid var(--error-color);
        color: var(--text-color);
        border-radius: 4px;
      ">
        <h3 style="margin: 0 0 8px 0; color: var(--error-color);">错误</h3>
        <p style="margin: 0;">${message}</p>
        <button id="retry-btn" style="
          margin-top: 12px;
          padding: 8px 16px;
          background: var(--primary-color);
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        ">重试</button>
      </div>
    `;
    document.body.appendChild(errorEl);
    
    document.getElementById('retry-btn')?.addEventListener('click', () => {
      window.location.reload();
    });
  }

  // 使用箭头函数保留this上下文
  private setupTagChangeListener() {
    // 先移除可能存在的旧监听器
    this.tagManager.removeEventListener('tagsChange', this.handleTagsChange);
    
    // 使用实例方法保持一致的引用，便于后续移除
    this.tagManager.addEventListener('tagsChange', this.handleTagsChange);
  }

  // 使用箭头函数保留this上下文
  private handleTagsChange = async () => {
    await this.renderQuickTags();
    await this.refreshTodoList();
  };

  private async renderQuickTags() {
    const container = document.getElementById('quickTagSelector');
    const tagSelectorContainer = document.querySelector('.tags-selector') as HTMLElement;
    if (!container || !tagSelectorContainer) return;

    try {
      const tags = await TagService.getAllTags();
      if (tags.length === 0) {
        tagSelectorContainer.style.display = 'none';
        return;
      }

      tagSelectorContainer.style.display = 'block';
      container.innerHTML = tags.map(tag => `
        <label class="tag-checkbox" style="background-color: ${tag.color}; color: white;">
          <input type="checkbox" value="${tag.id}" ${this.selectedTags.includes(tag.id) ? 'checked' : ''}>
          <span>${tag.name}</span>
        </label>
      `).join('');

      const newContainer = container.cloneNode(true) as HTMLElement;
      container.parentNode?.replaceChild(newContainer, container);
      
      newContainer.addEventListener('change', (e) => {
        const checkbox = e.target as HTMLInputElement;
        if (checkbox.type === 'checkbox') {
          if (checkbox.checked) {
            this.selectedTags.push(checkbox.value);
          } else {
            this.selectedTags = this.selectedTags.filter(id => id !== checkbox.value);
          }
        }
      });
    } catch (error) {
      console.error('加载标签失败:', error);
      tagSelectorContainer.style.display = 'none';
    }
  }

  private async refreshTodoList() {
    const filter: TodoFilter = {
      status: this.statusFilter.value as 'all' | 'active' | 'completed',
      searchText: this.searchInput.value,
      tags: this.selectedTags.length > 0 ? this.selectedTags : undefined
    };

    const todos = await TodoService.getTodos(filter);
    const stats = await TodoService.getStatistics();

    this.todoList.setAttribute('data-todos', JSON.stringify(todos));
    this.taskStats.setAttribute('data-stats', JSON.stringify(stats));
  }

  private initializeEventListeners() {
    this.themeToggle.addEventListener('click', async () => {
      const currentTheme = this.themeManager.getCurrentTheme();
      await this.themeManager.setTheme(currentTheme === 'light' ? 'dark' : 'light');
    });

    this.languageSelect.addEventListener('change', (e) => {
      e.stopPropagation();
      const locale = this.languageSelect.value as 'zh' | 'en';
      this.i18n.setLocale(locale);
    });

    this.languageSelect.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    this.addTodoBtn.addEventListener('click', () => this.handleAddTodo());
    this.newTodoInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.handleAddTodo();
      }
    });

    this.statusFilter.addEventListener('change', () => this.refreshTodoList());
    this.searchInput.addEventListener('input', () => this.refreshTodoList());

    this.todoList.addEventListener('todoToggle', (e: Event) => {
      const { id } = (e as CustomEvent).detail;
      this.handleToggleTodo(id);
    });

    this.todoList.addEventListener('todoDelete', (e: Event) => {
      const { id } = (e as CustomEvent).detail;
      this.handleDeleteTodo(id);
    });

    this.todoList.addEventListener('todoEdit', (e: Event) => {
      const { todo } = (e as CustomEvent).detail;
      const todoForm = document.querySelector('task-form') as HTMLElementTagNameMap['task-form'];
      if (todoForm) {
        todoForm.setFormData(todo);
        todoForm.style.display = 'block';
      }
    });

    this.todoForm.addEventListener('todoSubmit', (e: Event) => {
      const todoData = (e as CustomEvent).detail;
      this.handleTodoSubmit(todoData);
    });

    this.todoForm.addEventListener('formCancel', () => {
      this.handleFormCancel();
    });

    this.exportBtn.addEventListener('click', async () => {
      try {
        const data = await StorageService.exportData();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `easy-todo-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Export failed:', error);
        alert('导出失败，请重试');
      }
    });

    this.importBtn.addEventListener('click', () => {
      this.importFile.click();
    });

    this.importFile.addEventListener('change', async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const jsonData = event.target?.result as string;
          const success = await StorageService.importData(jsonData);
          if (success) {
            alert(this.i18n.t('alerts.import.success'));
            await this.refreshTodoList();
            await this.renderQuickTags();
            const tagManager = document.querySelector('tag-manager') as HTMLElementTagNameMap['tag-manager'];
            if (tagManager) {
              await tagManager.loadTags();
            }
            const taskStats = document.querySelector('task-stats');
            if (taskStats) {
              const stats = await TodoService.getStatistics();
              taskStats.setAttribute('data-stats', JSON.stringify(stats));
            }
          } else {
            alert(this.i18n.t('alerts.import.error'));
          }
        } catch (error) {
          console.error('Import failed:', error);
          alert(this.i18n.t('alerts.import.error'));
        }
        this.importFile.value = '';
      };

      reader.readAsText(file);
    });

    this.tagManager.addEventListener('tagSelect', (e: Event) => {
      const { tagId } = (e as CustomEvent).detail;
      this.toggleTagFilter(tagId);
    });

    this.tagManager.addEventListener('tagsChange', () => {
      this.refreshTodoList();
    });

    this.tagManager.addEventListener('tagsChange', () => {
      const todoForm = document.querySelector('task-form') as HTMLElementTagNameMap['task-form'];
      if (todoForm) {
        todoForm.refresh();
      }
    });

    this.todoList.addEventListener('todoReorder', async (e: Event) => {
      const { todos } = (e as CustomEvent).detail;
      await TodoService.updateTodosOrder(todos);
      await this.refreshTodoList();
    });
  }

  private async handleAddTodo() {
    const title = this.newTodoInput.value.trim();
    if (!title) return;

    try {
      await TodoService.createTodo(
        title,
        undefined,
        undefined,
        this.selectedTags
      );
      
      this.newTodoInput.value = '';
      this.selectedTags = [];
      this.resetTagCheckboxes();
      await this.renderQuickTags();
      await this.refreshTodoList();
    } catch (error) {
      console.error('创建任务失败:', error);
      alert('创建任务失败，请重试');
    }
  }

  private resetTagCheckboxes() {
    const checkboxes = document.querySelectorAll<HTMLInputElement>('#quickTagSelector input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
      checkbox.checked = false;
    });
  }

  private async handleToggleTodo(todoId: string) {
    await TodoService.toggleTodoStatus(todoId);
    await this.refreshTodoList();
  }

  private async handleDeleteTodo(todoId: string) {
    await TodoService.deleteTodo(todoId);
    await this.refreshTodoList();
  }

  private async handleTodoSubmit(todoData: Partial<Todo>) {
    try {
      if (todoData.id) {
        await TodoService.updateTodo(todoData.id, {
          ...todoData,
          updatedAt: Date.now()
        });
      } else {
        await TodoService.createTodo(
          todoData.title!,
          todoData.description,
          todoData.dueDate,
          todoData.tags || [],
          'medium',
          todoData.reminderLeadTime
        );
      }

      await this.refreshTodoList();
      const todoForm = document.querySelector('task-form') as HTMLElementTagNameMap['task-form'];
      if (todoForm) {
        todoForm.style.display = 'none';
        
        setTimeout(() => {
          todoForm.reset();
        }, 100);
      }
    } catch (error) {
      console.error('保存任务失败:', error);
      alert(this.i18n.t('todo.saveError'));
    }
  }

  private handleFormCancel() {
    const todoForm = document.getElementById('todoForm') as HTMLElementTagNameMap['task-form'];
    if (todoForm) {
      todoForm.style.display = 'none';
      setTimeout(() => {
        todoForm.reset();
      }, 100);
    }
  }

  private async toggleTagFilter(tagId: string) {
    const index = this.selectedTags.indexOf(tagId);
    if (index === -1) {
      this.selectedTags.push(tagId);
    } else {
      this.selectedTags.splice(index, 1);
    }

    this.tagManager.setAttribute('data-selected-tags', JSON.stringify(this.selectedTags));
    await this.refreshTodoList();
  }

  private async updateAllTranslations() {
    this.updateTranslations();
    await this.refreshTodoList();

    const tagManager = document.querySelector('tag-manager') as HTMLElementTagNameMap['tag-manager'];
    if (tagManager) {
      await tagManager.loadTags();
    }

    this.exportBtn.title = this.i18n.t('data.export');
    this.importBtn.title = this.i18n.t('data.import');
    document.querySelector('#themeToggle .text')!.textContent = this.i18n.t('menu.theme');
    document.querySelector('#exportBtn .text')!.textContent = this.i18n.t('menu.export');
    document.querySelector('#importBtn .text')!.textContent = this.i18n.t('menu.import');
  }

  private updateTranslations() {
    document.querySelector('h1')!.textContent = this.i18n.t('app.title');
    this.addTodoBtn.textContent = this.i18n.t('app.addTodo');
    this.newTodoInput.placeholder = this.i18n.t('app.placeholder');

    this.updateSelectOptions(this.statusFilter, [
      { value: 'all', label: this.i18n.t('filters.all') },
      { value: 'active', label: this.i18n.t('filters.active') },
      { value: 'completed', label: this.i18n.t('filters.completed') }
    ]);

    this.searchInput.placeholder = this.i18n.t('filters.search');
    this.exportBtn.title = this.i18n.t('data.export');
    this.importBtn.title = this.i18n.t('data.import');
    document.querySelector('#themeToggle .text')!.textContent = this.i18n.t('menu.theme');
    document.querySelector('#exportBtn .text')!.textContent = this.i18n.t('menu.export');
    document.querySelector('#importBtn .text')!.textContent = this.i18n.t('menu.import');
    this.settingsBtn.title = this.i18n.t('menu.settings');
  }

  private updateSelectOptions(select: HTMLSelectElement, options: Array<{value: string, label: string}>) {
    const currentValue = select.value;
    select.innerHTML = options
      .map(opt => `<option value="${opt.value}">${opt.label}</option>`)
      .join('');
    select.value = currentValue;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new PopupManager();
});