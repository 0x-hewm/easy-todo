import { Todo } from '../types';
import './TaskItem';

export class TaskList extends HTMLElement {
  private todos: Todo[] = [];
  private draggedTodo: Todo | null = null;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  static get observedAttributes() {
    return ['data-todos'];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (name === 'data-todos') {
      this.todos = JSON.parse(newValue);
      this.render();
    }
  }

  private render() {
    if (!this.shadowRoot) return;

    const style = `
      <style>
        :host {
          display: block;
          margin: 16px 0;
        }
        .empty-state {
          text-align: center;
          padding: 40px 20px;
          color: var(--text-secondary-color);
          background: var(--surface-color);
          border-radius: var(--border-radius-md);
          box-shadow: var(--shadow-sm);
          font-size: 16px;
          animation: fadeIn var(--transition-normal);
        }
        .empty-icon {
          font-size: 48px;
          margin-bottom: 16px;
          opacity: 0.6;
        }
        .task-item {
          margin: 12px 0;
          cursor: move;
          transition: transform 0.3s ease, opacity 0.3s ease;
          animation: slideIn var(--transition-normal);
        }
        .task-item.dragging {
          opacity: 0.6;
          transform: scale(0.98) rotate(1deg);
          box-shadow: var(--shadow-lg);
          z-index: 10;
        }
        .drop-target {
          border: 2px dashed var(--primary-color);
          border-radius: var(--border-radius-md);
          margin: 8px 0;
          height: 4px;
          transition: height 0.3s ease, background-color 0.3s ease;
        }
        .drop-target.active {
          height: 60px;
          background: rgba(var(--primary-rgb), 0.1);
        }
        .task-list {
          min-height: 100px;
        }
        
        @keyframes slideIn {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      </style>
    `;

    const todoElements = this.todos.map((todo, index) => `
      <div class="task-item" 
           draggable="true"
           data-todo-id="${todo.id}"
           data-index="${index}"
           style="animation-delay: ${index * 0.05}s">
        <task-item data-todo='${JSON.stringify(todo)}'></task-item>
      </div>
    `).join('');

    this.shadowRoot.innerHTML = `
      ${style}
      <div class="task-list">
        ${this.todos.length === 0 
          ? `<div class="empty-state">
               <div class="empty-icon">📝</div>
               <p>暂无待办事项</p>
               <p>创建一个新的待办事项开始吧!</p>
             </div>` 
          : todoElements}
      </div>
    `;

    this.setupDragAndDrop();
    this.setupEventListeners();
  }

  private setupDragAndDrop() {
    const taskItems = this.shadowRoot!.querySelectorAll('.task-item');

    taskItems.forEach(item => {
      item.addEventListener('dragstart', (e) => {
        const target = e.target as HTMLElement;
        target.classList.add('dragging');
        this.draggedTodo = this.todos[Number(target.dataset.index)];
        (e as DragEvent).dataTransfer!.effectAllowed = 'move';
      });

      item.addEventListener('dragend', (e) => {
        const target = e.target as HTMLElement;
        target.classList.remove('dragging');
        this.draggedTodo = null;
        this.removeDragTargets();
      });

      item.addEventListener('dragover', (e) => {
        e.preventDefault();
        const target = e.currentTarget as HTMLElement;
        if (this.draggedTodo && this.draggedTodo.id !== target.dataset.todoId) {
          this.showDropTarget(target);
        }
      });

      item.addEventListener('drop', (e) => {
        e.preventDefault();
        const dropTarget = e.currentTarget as HTMLElement;
        const dropIndex = Number(dropTarget.dataset.index);
        
        if (this.draggedTodo) {
          const dragIndex = this.todos.findIndex(t => t.id === this.draggedTodo!.id);
          if (dragIndex !== dropIndex) {
            this.reorderTodos(dragIndex, dropIndex);
          }
        }
      });
    });
  }

  private showDropTarget(target: HTMLElement) {
    this.removeDragTargets();
    const dropTarget = document.createElement('div');
    dropTarget.className = 'drop-target active';
    target.parentNode!.insertBefore(dropTarget, target);
  }

  private removeDragTargets() {
    this.shadowRoot!.querySelectorAll('.drop-target').forEach(el => el.remove());
  }

  private async reorderTodos(fromIndex: number, toIndex: number) {
    const newTodos = [...this.todos];
    const [movedTodo] = newTodos.splice(fromIndex, 1);
    newTodos.splice(toIndex, 0, movedTodo);
    
    // 触发重排序事件
    const event = new CustomEvent('todoReorder', {
      detail: { todos: newTodos },
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(event);
  }

  private setupEventListeners() {
    this.shadowRoot!.querySelectorAll('task-item').forEach(item => {
      item.addEventListener('todoToggle', (e: Event) => {
        const event = new CustomEvent('todoToggle', {
          detail: (e as CustomEvent).detail,
          bubbles: true,
          composed: true
        });
        this.dispatchEvent(event);
      });

      item.addEventListener('todoDelete', (e: Event) => {
        const event = new CustomEvent('todoDelete', {
          detail: (e as CustomEvent).detail,
          bubbles: true,
          composed: true
        });
        this.dispatchEvent(event);
      });

      item.addEventListener('todoEdit', (e: Event) => {
        const event = new CustomEvent('todoEdit', {
          detail: (e as CustomEvent).detail,
          bubbles: true,
          composed: true
        });
        this.dispatchEvent(event);
      });
    });
  }
}

customElements.define('task-list', TaskList);