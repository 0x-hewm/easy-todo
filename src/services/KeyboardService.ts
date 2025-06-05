export interface Shortcut {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  meta?: boolean;
  description: string;
}

export interface ShortcutMap {
  [action: string]: Shortcut;
}

export class KeyboardService {
  private static instance: KeyboardService;
  private shortcuts: ShortcutMap = {
    'newTodo': { key: 'n', ctrl: true, description: '新建任务' },
    'search': { key: 'f', ctrl: true, description: '搜索' },
    'save': { key: 's', ctrl: true, description: '保存' },
    'toggleTheme': { key: 't', ctrl: true, shift: true, description: '切换主题' },
    'toggleFilter': { key: 'f', ctrl: true, shift: true, description: '切换过滤器' },
    'exportData': { key: 'e', ctrl: true, shift: true, description: '导出数据' },
    'importData': { key: 'i', ctrl: true, shift: true, description: '导入数据' },
  };

  private handlers: { [action: string]: () => void } = {};

  private constructor() {
    this.initializeKeyboardListener();
  }

  public static getInstance(): KeyboardService {
    if (!KeyboardService.instance) {
      KeyboardService.instance = new KeyboardService();
    }
    return KeyboardService.instance;
  }

  private initializeKeyboardListener() {
    document.addEventListener('keydown', (event: KeyboardEvent) => {
      const matchedAction = this.findMatchingShortcut(event);
      if (matchedAction) {
        event.preventDefault();
        this.handlers[matchedAction]?.();
      }
    });
  }

  private findMatchingShortcut(event: KeyboardEvent): string | null {
    const pressedKey = event.key.toLowerCase();
    const hasCtrl = event.ctrlKey || event.metaKey; // macOS 上使用 Command 键
    const hasAlt = event.altKey;
    const hasShift = event.shiftKey;

    for (const [action, shortcut] of Object.entries(this.shortcuts)) {
      if (
        pressedKey === shortcut.key.toLowerCase() &&
        (!shortcut.ctrl || hasCtrl) &&
        (!shortcut.alt || hasAlt) &&
        (!shortcut.shift || hasShift)
      ) {
        return action;
      }
    }
    return null;
  }

  public registerShortcut(action: string, handler: () => void): void {
    if (this.shortcuts[action]) {
      this.handlers[action] = handler;
    } else {
      console.warn(`未知的快捷键操作: ${action}`);
    }
  }

  public unregisterShortcut(action: string): void {
    delete this.handlers[action];
  }

  public getShortcuts(): ShortcutMap {
    return { ...this.shortcuts };
  }

  public getShortcutDescription(action: string): string {
    const shortcut = this.shortcuts[action];
    if (!shortcut) return '';

    const parts: string[] = [];
    if (shortcut.ctrl) parts.push('Ctrl');
    if (shortcut.alt) parts.push('Alt');
    if (shortcut.shift) parts.push('Shift');
    parts.push(shortcut.key.toUpperCase());

    return `${parts.join('+')} (${shortcut.description})`;
  }

  // 添加新的快捷键
  public addShortcut(action: string, shortcut: Shortcut): void {
    this.shortcuts[action] = shortcut;
  }

  // 移除快捷键
  public removeShortcut(action: string): void {
    delete this.shortcuts[action];
    delete this.handlers[action];
  }
}