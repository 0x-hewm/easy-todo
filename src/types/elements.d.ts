import { Todo } from './index';
import { TagManager } from '../components/TagManager';
import { TaskForm } from '../components/TaskForm';
import { TaskList } from '../components/TaskList';
import { TaskItem } from '../components/TaskItem';
import { TemplateManager } from '../components/TemplateManager';
import { AnalyticsView } from '../components/AnalyticsView';

declare global {
  interface HTMLElementTagNameMap {
    'tag-manager': TagManager;
    'task-form': TaskForm;
    'task-list': TaskList;
    'task-item': TaskItem;
    'template-manager': TemplateManager;
    'analytics-view': AnalyticsView;
    'theme-selector': HTMLElement;
    'custom-theme-editor': HTMLElement;
    'task-stats': HTMLElement;
  }

  interface TaskFormElement extends HTMLElement {
    setFormData(data: Partial<Todo>): void;
    reset(): void;
    refresh(): void;
    style: CSSStyleDeclaration;
  }

  interface TemplateManagerElement extends HTMLElement {
    addEventListener(type: string, listener: (event: CustomEvent) => void): void;
  }

  interface AnalyticsViewElement extends HTMLElement {
    refresh(): void;
  }
}
