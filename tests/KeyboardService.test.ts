import { KeyboardService, Shortcut } from '../src/services/KeyboardService';

// Mock document
const mockAddEventListener = jest.fn();
const mockRemoveEventListener = jest.fn();

Object.defineProperty(global, 'document', {
  value: {
    addEventListener: mockAddEventListener,
    removeEventListener: mockRemoveEventListener,
  },
  writable: true,
});

describe('KeyboardService', () => {
  let keyboardService: KeyboardService;
  let mockHandler: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset singleton instance
    (KeyboardService as any).instance = undefined;
    keyboardService = KeyboardService.getInstance();
    mockHandler = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const instance1 = KeyboardService.getInstance();
      const instance2 = KeyboardService.getInstance();

      expect(instance1).toBe(instance2);
      expect(instance1).toBeInstanceOf(KeyboardService);
    });

    it('should initialize keyboard listener on first instantiation', () => {
      expect(mockAddEventListener).toHaveBeenCalledWith(
        'keydown',
        expect.any(Function)
      );
    });
  });

  describe('registerShortcut', () => {
    it('should register handler for existing shortcut', () => {
      keyboardService.registerShortcut('newTodo', mockHandler);

      expect(mockHandler).not.toHaveBeenCalled();
    });

    it('should warn for unknown shortcut action', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      keyboardService.registerShortcut('unknownAction', mockHandler);

      expect(consoleSpy).toHaveBeenCalledWith(
        '未知的快捷键操作: unknownAction'
      );
      consoleSpy.mockRestore();
    });
  });

  describe('unregisterShortcut', () => {
    it('should unregister handler', () => {
      keyboardService.registerShortcut('newTodo', mockHandler);
      keyboardService.unregisterShortcut('newTodo');

      // Simulate keydown event
      const keydownListener = mockAddEventListener.mock.calls[0][1];
      const mockEvent = {
        key: 'n',
        ctrlKey: true,
        metaKey: false,
        altKey: false,
        shiftKey: false,
        preventDefault: jest.fn(),
      };

      keydownListener(mockEvent);

      expect(mockHandler).not.toHaveBeenCalled();
    });
  });

  describe('getShortcuts', () => {
    it('should return copy of shortcuts', () => {
      const shortcuts = keyboardService.getShortcuts();

      expect(shortcuts).toEqual({
        newTodo: { key: 'n', ctrl: true, description: '新建任务' },
        search: { key: 'f', ctrl: true, description: '搜索' },
        save: { key: 's', ctrl: true, description: '保存' },
        toggleTheme: {
          key: 't',
          ctrl: true,
          shift: true,
          description: '切换主题',
        },
        toggleFilter: {
          key: 'f',
          ctrl: true,
          shift: true,
          description: '切换过滤器',
        },
        exportData: {
          key: 'e',
          ctrl: true,
          shift: true,
          description: '导出数据',
        },
        importData: {
          key: 'i',
          ctrl: true,
          shift: true,
          description: '导入数据',
        },
      });

      // Should be a copy, not reference
      shortcuts.newAction = { key: 'x', description: 'test' };
      expect(keyboardService.getShortcuts()).not.toHaveProperty('newAction');
    });
  });

  describe('getShortcutDescription', () => {
    it('should return correct description for existing shortcut', () => {
      const description = keyboardService.getShortcutDescription('newTodo');
      expect(description).toBe('Ctrl+N (新建任务)');
    });

    it('should return description with multiple modifiers', () => {
      const description = keyboardService.getShortcutDescription('toggleTheme');
      expect(description).toBe('Ctrl+Shift+T (切换主题)');
    });

    it('should return empty string for unknown action', () => {
      const description = keyboardService.getShortcutDescription('unknown');
      expect(description).toBe('');
    });

    it('should handle Alt modifier', () => {
      keyboardService.addShortcut('testAlt', {
        key: 'a',
        alt: true,
        description: '测试Alt',
      });

      const description = keyboardService.getShortcutDescription('testAlt');
      expect(description).toBe('Alt+A (测试Alt)');
    });
  });

  describe('addShortcut', () => {
    it('should add new shortcut', () => {
      const newShortcut: Shortcut = {
        key: 'x',
        ctrl: true,
        description: '新快捷键',
      };

      keyboardService.addShortcut('newAction', newShortcut);

      const shortcuts = keyboardService.getShortcuts();
      expect(shortcuts.newAction).toEqual(newShortcut);
    });
  });

  describe('removeShortcut', () => {
    it('should remove shortcut and handler', () => {
      keyboardService.registerShortcut('newTodo', mockHandler);
      keyboardService.removeShortcut('newTodo');

      const shortcuts = keyboardService.getShortcuts();
      expect(shortcuts).not.toHaveProperty('newTodo');

      // Handler should also be removed
      const keydownListener = mockAddEventListener.mock.calls[0][1];
      const mockEvent = {
        key: 'n',
        ctrlKey: true,
        metaKey: false,
        altKey: false,
        shiftKey: false,
        preventDefault: jest.fn(),
      };

      keydownListener(mockEvent);
      expect(mockHandler).not.toHaveBeenCalled();
    });
  });

  describe('keyboard event handling', () => {
    beforeEach(() => {
      keyboardService.registerShortcut('newTodo', mockHandler);
    });

    it('should trigger handler for matching shortcut with Ctrl', () => {
      const keydownListener = mockAddEventListener.mock.calls[0][1];
      const mockEvent = {
        key: 'n',
        ctrlKey: true,
        metaKey: false,
        altKey: false,
        shiftKey: false,
        preventDefault: jest.fn(),
      };

      keydownListener(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockHandler).toHaveBeenCalled();
    });

    it('should trigger handler for matching shortcut with Meta (macOS)', () => {
      const keydownListener = mockAddEventListener.mock.calls[0][1];
      const mockEvent = {
        key: 'n',
        ctrlKey: false,
        metaKey: true,
        altKey: false,
        shiftKey: false,
        preventDefault: jest.fn(),
      };

      keydownListener(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockHandler).toHaveBeenCalled();
    });

    it('should not trigger handler for non-matching key', () => {
      const keydownListener = mockAddEventListener.mock.calls[0][1];
      const mockEvent = {
        key: 'x',
        ctrlKey: true,
        metaKey: false,
        altKey: false,
        shiftKey: false,
        preventDefault: jest.fn(),
      };

      keydownListener(mockEvent);

      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
      expect(mockHandler).not.toHaveBeenCalled();
    });

    it('should not trigger handler for missing required modifiers', () => {
      const keydownListener = mockAddEventListener.mock.calls[0][1];
      const mockEvent = {
        key: 'n',
        ctrlKey: false,
        metaKey: false,
        altKey: false,
        shiftKey: false,
        preventDefault: jest.fn(),
      };

      keydownListener(mockEvent);

      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
      expect(mockHandler).not.toHaveBeenCalled();
    });

    it('should handle shortcuts with multiple modifiers', () => {
      const shiftCtrlHandler = jest.fn();
      keyboardService.registerShortcut('toggleTheme', shiftCtrlHandler);

      const keydownListener = mockAddEventListener.mock.calls[0][1];
      const mockEvent = {
        key: 't',
        ctrlKey: true,
        metaKey: false,
        altKey: false,
        shiftKey: true,
        preventDefault: jest.fn(),
      };

      keydownListener(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(shiftCtrlHandler).toHaveBeenCalled();
    });

    it('should handle case insensitive key matching', () => {
      const keydownListener = mockAddEventListener.mock.calls[0][1];
      const mockEvent = {
        key: 'N',
        ctrlKey: true,
        metaKey: false,
        altKey: false,
        shiftKey: false,
        preventDefault: jest.fn(),
      };

      keydownListener(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockHandler).toHaveBeenCalled();
    });

    it('should not trigger when handler is not registered', () => {
      const keydownListener = mockAddEventListener.mock.calls[0][1];
      const mockEvent = {
        key: 'x', // Use a key that doesn't have a shortcut
        ctrlKey: true,
        metaKey: false,
        altKey: false,
        shiftKey: false,
        preventDefault: jest.fn(),
      };

      keydownListener(mockEvent);

      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
    });
  });
});
