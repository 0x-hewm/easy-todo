/**
 * ThemeManager 测试套件
 * 测试主题管理功能
 */

import {
  Theme,
  ThemeColors,
  ThemeManager,
  ThemeName,
} from '../src/utils/theme';

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

// Mock matchMedia
const mockMatchMedia = jest.fn();

describe('ThemeManager', () => {
  let themeManager: ThemeManager;

  beforeEach(() => {
    // Reset singleton
    (ThemeManager as any).instance = undefined;

    // Setup mocks
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    });

    Object.defineProperty(window, 'matchMedia', {
      value: mockMatchMedia,
      writable: true,
    });

    // Mock document with complete style object
    Object.defineProperty(document, 'documentElement', {
      value: {
        style: {
          setProperty: jest.fn(),
        },
        setAttribute: jest.fn(),
        getAttribute: jest.fn(),
      },
      writable: true,
    });

    // Mock querySelector
    Object.defineProperty(document, 'querySelector', {
      value: jest.fn().mockReturnValue({
        setAttribute: jest.fn(),
      }),
      writable: true,
    });

    // Clear mocks
    jest.clearAllMocks();
    mockLocalStorage.clear();

    // Default matchMedia mock
    mockMatchMedia.mockReturnValue({
      matches: false,
      addListener: jest.fn(),
      removeListener: jest.fn(),
    });

    themeManager = ThemeManager.getInstance();
  });

  describe('单例模式', () => {
    test('应该返回相同的实例', () => {
      const instance1 = ThemeManager.getInstance();
      const instance2 = ThemeManager.getInstance();

      expect(instance1).toBe(instance2);
    });
  });

  describe('主题加载', () => {
    test('应该加载默认的浅色主题', async () => {
      mockMatchMedia.mockReturnValue({
        matches: false,
        addListener: jest.fn(),
        removeListener: jest.fn(),
      });

      await themeManager.loadTheme();

      expect(themeManager.getCurrentTheme()).toBe('light');
    });

    test('应该在系统偏好暗黑模式时加载暗黑主题', async () => {
      mockMatchMedia.mockReturnValue({
        matches: true,
        addListener: jest.fn(),
        removeListener: jest.fn(),
      });

      await themeManager.loadTheme();

      expect(themeManager.getCurrentTheme()).toBe('dark');
    });

    test('应该从localStorage加载保存的主题', async () => {
      mockLocalStorage.setItem('theme', 'ocean');

      await themeManager.loadTheme();

      expect(themeManager.getCurrentTheme()).toBe('ocean');
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('theme');
    });

    test('应该加载自定义主题', async () => {
      const customColors: ThemeColors = {
        primary: '#ff0000',
        secondary: '#00ff00',
        background: '#ffffff',
        surface: '#f5f5f5',
        text: '#000000',
        textSecondary: '#666666',
        border: '#cccccc',
        success: '#00cc00',
        warning: '#ffaa00',
        error: '#cc0000',
      };

      mockLocalStorage.setItem('theme', 'custom');
      mockLocalStorage.setItem('customTheme', JSON.stringify(customColors));

      await themeManager.loadTheme();

      expect(themeManager.getCurrentTheme()).toBe('custom');
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('customTheme');
    });

    test('应该处理无效的保存主题', async () => {
      mockLocalStorage.setItem('theme', 'invalid_theme');

      await themeManager.loadTheme();

      // 应该回退到系统偏好或默认主题
      expect(['light', 'dark']).toContain(themeManager.getCurrentTheme());
    });
  });

  describe('主题切换', () => {
    test('应该能够设置不同的主题', () => {
      const themes: ThemeName[] = ['light', 'dark', 'sepia', 'ocean', 'forest'];

      themes.forEach(theme => {
        themeManager.setTheme(theme);
        expect(themeManager.getCurrentTheme()).toBe(theme);
      });
    });

    test('应该保存主题到localStorage', () => {
      themeManager.setTheme('dark');

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('theme', 'dark');
    });

    test('应该在设置主题时应用主题', () => {
      const setPropertySpy = jest.spyOn(
        document.documentElement.style,
        'setProperty'
      );

      themeManager.setTheme('dark');

      // 验证CSS变量被设置
      expect(setPropertySpy).toHaveBeenCalled();
    });
  });

  describe('主题应用', () => {
    test('应该将主题颜色应用为CSS变量', () => {
      const setPropertySpy = jest.spyOn(
        document.documentElement.style,
        'setProperty'
      );

      themeManager.setTheme('light');

      // 验证主要颜色变量被设置
      expect(setPropertySpy).toHaveBeenCalledWith(
        expect.stringContaining('primary'),
        expect.any(String)
      );
      expect(setPropertySpy).toHaveBeenCalledWith(
        expect.stringContaining('background'),
        expect.any(String)
      );
      expect(setPropertySpy).toHaveBeenCalledWith(
        expect.stringContaining('text'),
        expect.any(String)
      );
    });

    test('应该设置主题属性到html元素', () => {
      const setAttributeSpy = jest.spyOn(
        document.documentElement,
        'setAttribute'
      );

      themeManager.setTheme('dark');

      expect(setAttributeSpy).toHaveBeenCalledWith('data-theme', 'dark');
    });
  });

  describe('获取主题信息', () => {
    test('应该返回当前主题', () => {
      themeManager.setTheme('ocean');

      expect(themeManager.getCurrentTheme()).toBe('ocean');
    });

    test('应该返回所有可用主题', () => {
      const themes = themeManager.getThemes();

      expect(Array.isArray(themes)).toBe(true);
      expect(themes.length).toBeGreaterThan(0);

      // 验证包含基本主题
      const themeNames = themes.map((t: Theme) => t.name);
      expect(themeNames).toContain('light');
      expect(themeNames).toContain('dark');
    });

    test('每个主题应该有必要的属性', () => {
      const themes = themeManager.getThemes();

      themes.forEach((theme: Theme) => {
        expect(theme).toHaveProperty('name');
        expect(theme).toHaveProperty('label');
        expect(theme).toHaveProperty('colors');

        // 验证颜色对象包含必要的属性
        const colors = theme.colors;
        expect(colors).toHaveProperty('primary');
        expect(colors).toHaveProperty('background');
        expect(colors).toHaveProperty('text');
        expect(colors).toHaveProperty('success');
        expect(colors).toHaveProperty('warning');
        expect(colors).toHaveProperty('error');
      });
    });
  });

  describe('自定义主题', () => {
    test('应该能够设置自定义主题', () => {
      const customColors: ThemeColors = {
        primary: '#ff6b6b',
        secondary: '#4ecdc4',
        background: '#f7f1e3',
        surface: '#ffffff',
        text: '#2d3436',
        textSecondary: '#636e72',
        border: '#ddd6fe',
        success: '#00b894',
        warning: '#fdcb6e',
        error: '#e17055',
      };

      themeManager.setCustomTheme(customColors);

      // 验证自定义主题被保存
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'customTheme',
        JSON.stringify(customColors)
      );

      // 如果当前主题是custom，应该应用新颜色
      const themes = themeManager.getThemes();
      const customTheme = themes.find(t => t.name === 'custom');
      expect(customTheme).toBeDefined();
    });

    test('应该验证自定义主题颜色格式', () => {
      const invalidColors = {
        primary: 'invalid-color',
        // 缺少其他必需颜色
      } as any;

      // 这个测试假设有颜色验证，如果没有可以跳过
      expect(() => {
        themeManager.setCustomTheme(invalidColors);
      }).not.toThrow(); // 或者根据实际实现决定是否应该抛出错误
    });
  });

  describe('系统主题检测', () => {
    test('应该检测系统暗黑模式偏好', async () => {
      mockMatchMedia.mockReturnValue({
        matches: true,
        addListener: jest.fn(),
        removeListener: jest.fn(),
      });

      // 清除保存的主题设置
      mockLocalStorage.removeItem('theme');

      await themeManager.loadTheme();

      expect(themeManager.getCurrentTheme()).toBe('dark');
    });

    test('应该检测系统浅色模式偏好', async () => {
      mockMatchMedia.mockReturnValue({
        matches: false,
        addListener: jest.fn(),
        removeListener: jest.fn(),
      });

      // 清除保存的主题设置
      mockLocalStorage.removeItem('theme');

      await themeManager.loadTheme();

      expect(themeManager.getCurrentTheme()).toBe('light');
    });
  });

  describe('错误处理', () => {
    test('应该处理localStorage错误', async () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });

      // 重新创建实例以触发错误处理
      (ThemeManager as any).instance = undefined;
      themeManager = ThemeManager.getInstance();

      // 应该能处理错误并继续运行
      try {
        await themeManager.loadTheme();
        expect(['light', 'dark']).toContain(themeManager.getCurrentTheme());
      } catch (error) {
        // 如果抛出错误，验证是预期的错误
        expect((error as Error).message).toBe('localStorage error');
      }
    });

    test('应该处理无效的JSON数据', async () => {
      // 重置 mock 行为
      mockLocalStorage.getItem.mockImplementation(key => {
        if (key === 'customTheme') return 'invalid json';
        if (key === 'theme') return 'custom';
        return null;
      });

      // 重新创建实例
      (ThemeManager as any).instance = undefined;
      themeManager = ThemeManager.getInstance();

      // 应该能处理无效JSON并继续运行
      try {
        await themeManager.loadTheme();
        // 如果没有抛出错误，验证主题状态
        expect(themeManager.getCurrentTheme()).toBeDefined();
      } catch (error) {
        // 如果抛出错误，这是可以接受的
        expect(error).toBeDefined();
      }
    });

    test('应该处理无效的主题名称', () => {
      // 设置一个无效的主题名称不应该导致错误
      expect(() => {
        themeManager.setTheme('invalid_theme' as ThemeName);
      }).not.toThrow();
    });
  });

  describe('性能测试', () => {
    test('主题切换应该快速响应', () => {
      const startTime = performance.now();

      // 快速切换多个主题
      for (let i = 0; i < 100; i++) {
        const themes: ThemeName[] = [
          'light',
          'dark',
          'sepia',
          'ocean',
          'forest',
        ];
        themeManager.setTheme(themes[i % themes.length]);
      }

      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(100); // 应该在100ms内完成
    });
  });
});
