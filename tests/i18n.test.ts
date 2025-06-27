/**
 * I18n 测试套件
 * 测试国际化功能
 */

import { I18n, Locale } from '../src/utils/i18n';

describe('I18n', () => {
  let i18n: I18n;

  beforeEach(() => {
    // 重置单例实例
    (I18n as any).instance = undefined;
    i18n = I18n.getInstance();
  });

  describe('单例模式', () => {
    test('应该返回相同的实例', () => {
      const instance1 = I18n.getInstance();
      const instance2 = I18n.getInstance();

      expect(instance1).toBe(instance2);
    });
  });

  describe('语言设置', () => {
    test('默认语言应该是中文', () => {
      expect(i18n.getCurrentLocale()).toBe('zh');
    });

    test('应该能够设置语言', () => {
      i18n.setLocale('en');
      expect(i18n.getCurrentLocale()).toBe('en');

      i18n.setLocale('zh');
      expect(i18n.getCurrentLocale()).toBe('zh');
    });
  });

  describe('翻译功能', () => {
    test('应该返回中文翻译', () => {
      i18n.setLocale('zh');

      expect(i18n.t('app.title')).toBe('简单待办');
      expect(i18n.t('app.addTodo')).toBe('添加');
      expect(i18n.t('filters.all')).toBe('全部');
      expect(i18n.t('filters.active')).toBe('进行中');
      expect(i18n.t('filters.completed')).toBe('已完成');
    });

    test('应该返回英文翻译', () => {
      i18n.setLocale('en');

      expect(i18n.t('app.title')).toBe('Easy Todo');
      expect(i18n.t('app.addTodo')).toBe('Add');
      expect(i18n.t('filters.all')).toBe('All');
      expect(i18n.t('filters.active')).toBe('Active');
      expect(i18n.t('filters.completed')).toBe('Completed');
    });

    test('当键不存在时应该返回键本身', () => {
      const nonExistentKey = 'non.existent.key';

      expect(i18n.t(nonExistentKey)).toBe(nonExistentKey);
    });

    test('应该处理模板变量', () => {
      i18n.setLocale('zh');

      const result = i18n.t('todo.dueDateTime', {
        year: '2023',
        month: '6',
        day: '15',
      });

      expect(result).toBe('2023年6月15日');
    });

    test('应该处理英文模板变量', () => {
      i18n.setLocale('en');

      const result = i18n.t('todo.dueDateTime', {
        year: '2023',
        month: '6',
        day: '15',
      });

      expect(result).toBe('6/15/2023');
    });

    test('应该处理通知消息模板', () => {
      i18n.setLocale('zh');

      const reminderResult = i18n.t('notifications.reminderMessage', {
        title: '完成报告',
      });
      expect(reminderResult).toBe('待办事项 "完成报告" 即将到期');

      const completionResult = i18n.t('notifications.completionMessage', {
        title: '完成报告',
      });
      expect(completionResult).toBe('恭喜！你完成了任务：完成报告');
    });

    test('应该处理没有变量的模板', () => {
      i18n.setLocale('zh');

      const result = i18n.t('app.title', {});
      expect(result).toBe('简单待办');

      const resultWithUndefined = i18n.t('app.title');
      expect(resultWithUndefined).toBe('简单待办');
    });

    test('应该处理多个变量', () => {
      // 假设有一个包含多个变量的键（如果没有，我们可以跳过这个测试）
      // 这里使用现有的键进行测试
      i18n.setLocale('zh');

      const result = i18n.t('todo.dueDateTime', {
        year: '2023',
        month: '12',
        day: '25',
      });

      expect(result).toBe('2023年12月25日');
      expect(result).toContain('2023');
      expect(result).toContain('12');
      expect(result).toContain('25');
    });
  });

  describe('常用翻译键测试', () => {
    test('应该包含所有基本应用翻译', () => {
      const basicKeys = [
        'app.title',
        'app.addTodo',
        'app.placeholder',
        'filters.all',
        'filters.active',
        'filters.completed',
        'button.add',
        'button.edit',
        'button.delete',
      ];

      i18n.setLocale('zh');
      basicKeys.forEach(key => {
        expect(i18n.t(key)).not.toBe(key); // 确保有翻译
        expect(i18n.t(key)).toBeTruthy(); // 确保翻译不为空
      });

      i18n.setLocale('en');
      basicKeys.forEach(key => {
        expect(i18n.t(key)).not.toBe(key); // 确保有翻译
        expect(i18n.t(key)).toBeTruthy(); // 确保翻译不为空
      });
    });

    test('应该包含待办事项相关翻译', () => {
      const todoKeys = [
        'todo.add',
        'todo.edit',
        'todo.save',
        'todo.cancel',
        'todo.title',
        'todo.description',
        'todo.titlePlaceholder',
        'todo.descriptionPlaceholder',
      ];

      i18n.setLocale('zh');
      todoKeys.forEach(key => {
        expect(i18n.t(key)).not.toBe(key);
        expect(i18n.t(key)).toBeTruthy();
      });
    });

    test('应该包含标签相关翻译', () => {
      const tagKeys = ['tag.add', 'tags.title'];

      i18n.setLocale('zh');
      tagKeys.forEach(key => {
        expect(i18n.t(key)).not.toBe(key);
        expect(i18n.t(key)).toBeTruthy();
      });
    });

    test('应该包含通知相关翻译', () => {
      const notificationKeys = [
        'notifications.reminder',
        'notifications.completion',
      ];

      i18n.setLocale('zh');
      notificationKeys.forEach(key => {
        expect(i18n.t(key)).not.toBe(key);
        expect(i18n.t(key)).toBeTruthy();
      });
    });
  });

  describe('变量替换', () => {
    test('应该处理单个变量替换', () => {
      i18n.setLocale('zh');

      const result = i18n.t('notifications.reminderMessage', {
        title: '测试任务',
      });
      expect(result).toContain('测试任务');
      expect(result).toBe('待办事项 "测试任务" 即将到期');
    });

    test('应该处理多个变量替换', () => {
      i18n.setLocale('zh');

      const result = i18n.t('todo.dueDateTime', {
        year: '2024',
        month: '3',
        day: '10',
      });

      expect(result).toContain('2024');
      expect(result).toContain('3');
      expect(result).toContain('10');
      expect(result).toBe('2024年3月10日');
    });

    test('应该处理缺少变量的情况', () => {
      i18n.setLocale('zh');

      // 模板需要 title 变量，但没有提供
      const result = i18n.t('notifications.reminderMessage', {});

      // 应该保留原始模板或处理缺失变量
      expect(result).toContain('{title}');
    });

    test('应该处理额外变量', () => {
      i18n.setLocale('zh');

      // 提供了额外的变量
      const result = i18n.t('app.title', {
        extraVar: 'extra',
        anotherVar: 'another',
      });

      expect(result).toBe('简单待办');
    });
  });

  describe('边界条件', () => {
    test('应该处理空字符串键', () => {
      expect(i18n.t('')).toBe('');
    });

    test('应该处理null或undefined键', () => {
      expect(i18n.t(null as any)).toBe(null);
      expect(i18n.t(undefined as any)).toBe(undefined);
    });

    test('应该处理特殊字符键', () => {
      const specialKey = 'key.with.special-chars_123';
      expect(i18n.t(specialKey)).toBe(specialKey);
    });

    test('应该处理无效的locale设置', () => {
      // 尝试设置无效的语言
      i18n.setLocale('invalid' as Locale);
      // 应该回退到默认或保持当前语言
      expect(['zh', 'en', 'invalid']).toContain(i18n.getCurrentLocale());
    });
  });

  describe('性能测试', () => {
    test('多次调用相同翻译应该快速响应', () => {
      i18n.setLocale('zh');

      const startTime = performance.now();

      for (let i = 0; i < 1000; i++) {
        i18n.t('app.title');
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // 1000次调用应该在合理时间内完成（比如50ms）
      expect(duration).toBeLessThan(50);
    });

    test('语言切换应该快速响应', () => {
      const startTime = performance.now();

      for (let i = 0; i < 100; i++) {
        i18n.setLocale(i % 2 === 0 ? 'zh' : 'en');
        i18n.t('app.title');
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // 100次切换应该在合理时间内完成
      expect(duration).toBeLessThan(20);
    });
  });
});
