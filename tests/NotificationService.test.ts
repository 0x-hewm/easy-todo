import { NotificationService } from '../src/services/NotificationService';

// Mock Chrome APIs
const mockChrome = {
  notifications: {
    create: jest.fn().mockResolvedValue(undefined),
    clear: jest.fn().mockResolvedValue(undefined),
  },
  runtime: {
    getURL: jest.fn(path => `chrome-extension://mock-id/${path}`),
    sendMessage: jest.fn(),
    lastError: null,
  },
};

class MockNotification {
  static permission: string = 'granted';
  static requestPermission = jest.fn().mockResolvedValue('granted');

  constructor(
    public title: string,
    public options?: any
  ) {}
}

describe('NotificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (global as any).chrome = mockChrome;
    mockChrome.runtime.lastError = null;

    (global as any).window = (global as any).window || {};
    (global as any).window.Notification = MockNotification;
    (global as any).Notification = MockNotification;
    MockNotification.permission = 'granted';
    MockNotification.requestPermission.mockResolvedValue('granted');

    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'debug').mockImplementation();

    jest
      .spyOn(global, 'setTimeout')
      .mockImplementation((callback: any, delay?: number) => {
        if (delay && delay <= 0) callback();
        return 'mock-timeout-id' as any;
      });
    jest.spyOn(global, 'clearTimeout').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('requestPermission', () => {
    test('当浏览器支持通知时应该请求权限', async () => {
      const result = await NotificationService.requestPermission();
      expect(result).toBe(true);
      expect(MockNotification.requestPermission).toHaveBeenCalled();
    });

    test('当浏览器不支持通知时应该返回false', async () => {
      delete (global as any).window.Notification;
      delete (global as any).Notification;

      const result = await NotificationService.requestPermission();
      expect(result).toBe(false);
      expect(console.warn).toHaveBeenCalledWith('此浏览器不支持通知功能');

      (global as any).window.Notification = MockNotification;
      (global as any).Notification = MockNotification;
    });
  });

  describe('showNotification', () => {
    test('当Chrome API可用时应该使用chrome.notifications', async () => {
      await NotificationService.showNotification('测试标题', '测试消息');

      expect(mockChrome.notifications.create).toHaveBeenCalledWith({
        type: 'basic',
        iconUrl: 'chrome-extension://mock-id/assets/icons/icon48.webp',
        title: '测试标题',
        message: '测试消息',
        requireInteraction: false,
        priority: 2,
      });
    });

    test('当所有API都不可用时应该输出到控制台', async () => {
      (global as any).chrome = undefined;
      delete (global as any).window.Notification;
      delete (global as any).Notification;

      await NotificationService.showNotification('测试标题', '测试消息');

      expect(console.log).toHaveBeenCalledWith('通知: 测试标题 - 测试消息');

      (global as any).chrome = mockChrome;
      (global as any).window.Notification = MockNotification;
      (global as any).Notification = MockNotification;
    });
  });

  describe('scheduleNotification', () => {
    const validTodo = {
      id: 'todo1',
      title: '测试任务',
      dueDate: Date.now() + 60000,
      reminderLeadTime: 15,
    };

    test('应该验证todo数据的完整性', async () => {
      await expect(
        NotificationService.scheduleNotification({
          ...validTodo,
          id: '',
        } as any)
      ).rejects.toThrow('无效的提醒数据');
    });

    test('当Chrome API可用时应该发送消息', async () => {
      mockChrome.runtime.sendMessage.mockImplementation((message, callback) => {
        callback({ success: true });
      });

      await NotificationService.scheduleNotification(validTodo);

      expect(mockChrome.runtime.sendMessage).toHaveBeenCalled();
    });
  });

  describe('getReminderText', () => {
    test('应该正确格式化提醒时间文本', () => {
      expect(NotificationService.getReminderText(0)).toBe('现在');
      expect(NotificationService.getReminderText(60)).toBe('1小时后');
      expect(NotificationService.getReminderText(15)).toBe('15分钟后');
    });
  });
});
