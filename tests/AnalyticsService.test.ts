/**
 * AnalyticsService 测试套件
 * 测试分析服务的数据统计功能
 */

import { AnalyticsService } from '../src/services/AnalyticsService';
import { StorageService } from '../src/services/StorageService';
import { Todo } from '../src/types';

// Mock StorageService
jest.mock('../src/services/StorageService');
const mockStorageService = StorageService as jest.Mocked<typeof StorageService>;

describe('AnalyticsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockTodos: Todo[] = [
    {
      id: '1',
      title: '高优先级任务',
      completed: true,
      priority: 'high',
      tags: ['work', 'urgent'],
      createdAt: Date.now() - 86400000, // 1天前
      updatedAt: Date.now() - 43200000, // 12小时前
      description: '',
      dueDate: undefined,
      reminderLeadTime: 15,
      reminded: false,
    },
    {
      id: '2',
      title: '中优先级任务',
      completed: false,
      priority: 'medium',
      tags: ['personal'],
      createdAt: Date.now() - 172800000, // 2天前
      updatedAt: Date.now() - 172800000,
      description: '',
      dueDate: undefined,
      reminderLeadTime: 15,
      reminded: false,
    },
    {
      id: '3',
      title: '低优先级任务',
      completed: true,
      priority: 'low',
      tags: ['work'],
      createdAt: Date.now() - 259200000, // 3天前
      updatedAt: Date.now() - 86400000, // 1天前
      description: '',
      dueDate: undefined,
      reminderLeadTime: 15,
      reminded: false,
    },
  ];

  describe('getAnalytics', () => {
    beforeEach(() => {
      mockStorageService.getState.mockResolvedValue({
        todos: mockTodos,
        tags: [],
        filter: {
          status: 'all',
        },
        settings: {
          language: 'zh',
          reminderEnabled: true,
          reminderLeadTime: 15,
        },
      });
    });

    test('应该返回完整的分析数据', async () => {
      const analytics = await AnalyticsService.getAnalytics();

      expect(analytics).toHaveProperty('totalTasks');
      expect(analytics).toHaveProperty('completedTasks');
      expect(analytics).toHaveProperty('activeTasks');
      expect(analytics).toHaveProperty('completionRate');
      expect(analytics).toHaveProperty('tasksByPriority');
      expect(analytics).toHaveProperty('tasksByTag');
      expect(analytics).toHaveProperty('averageCompletionTime');
      expect(analytics).toHaveProperty('tasksByDate');
    });

    test('应该正确计算完成统计', async () => {
      const analytics = await AnalyticsService.getAnalytics();

      expect(analytics.totalTasks).toBe(3);
      expect(analytics.completedTasks).toBe(2);
      expect(analytics.activeTasks).toBe(1);
      expect(analytics.completionRate).toBeCloseTo(66.67, 2);
    });

    test('应该正确计算优先级统计', async () => {
      const analytics = await AnalyticsService.getAnalytics();

      expect(analytics.tasksByPriority).toEqual({
        high: 1,
        medium: 1,
        low: 1,
      });
    });

    test('应该正确计算标签统计', async () => {
      const analytics = await AnalyticsService.getAnalytics();

      expect(analytics.tasksByTag).toEqual({
        work: 2,
        urgent: 1,
        personal: 1,
      });
    });

    test('应该正确计算平均完成时间', async () => {
      const analytics = await AnalyticsService.getAnalytics();

      // 任务1: 12小时完成时间 (43200000ms)
      // 任务3: 2天完成时间 (172800000ms)
      // 平均: (43200000 + 172800000) / 2 = 108000000ms
      expect(analytics.averageCompletionTime).toBe(108000000);
    });

    test('应该正确计算日期统计', async () => {
      const analytics = await AnalyticsService.getAnalytics();

      // 每个任务创建在不同的日期，每个日期应该有1个任务
      const dateKeys = Object.keys(analytics.tasksByDate);
      expect(dateKeys).toHaveLength(3);

      Object.values(analytics.tasksByDate).forEach(count => {
        expect(count).toBe(1);
      });
    });

    test('当没有任务时应该返回零值', async () => {
      mockStorageService.getState.mockResolvedValue({
        todos: [],
        tags: [],
        filter: {
          status: 'all',
        },
        settings: {
          language: 'zh',
          reminderEnabled: true,
          reminderLeadTime: 15,
        },
      });

      const analytics = await AnalyticsService.getAnalytics();

      expect(analytics.totalTasks).toBe(0);
      expect(analytics.completedTasks).toBe(0);
      expect(analytics.activeTasks).toBe(0);
      expect(analytics.completionRate).toBe(0);
      expect(analytics.averageCompletionTime).toBe(0);
      expect(analytics.tasksByPriority).toEqual({
        high: 0,
        medium: 0,
        low: 0,
      });
      expect(analytics.tasksByTag).toEqual({});
      expect(analytics.tasksByDate).toEqual({});
    });

    test('当所有任务都未完成时应该正确计算', async () => {
      const incompleteTodos = mockTodos.map(todo => ({
        ...todo,
        completed: false,
      }));

      mockStorageService.getState.mockResolvedValue({
        todos: incompleteTodos,
        tags: [],
        filter: {
          status: 'all',
        },
        settings: {
          language: 'zh',
          reminderEnabled: true,
          reminderLeadTime: 15,
        },
      });

      const analytics = await AnalyticsService.getAnalytics();

      expect(analytics.completionRate).toBe(0);
      expect(analytics.completedTasks).toBe(0);
      expect(analytics.activeTasks).toBe(3);
      expect(analytics.averageCompletionTime).toBe(0);
    });

    test('当所有任务都已完成时应该正确计算', async () => {
      const completedTodos = mockTodos.map(todo => ({
        ...todo,
        completed: true,
      }));

      mockStorageService.getState.mockResolvedValue({
        todos: completedTodos,
        tags: [],
        filter: {
          status: 'all',
        },
        settings: {
          language: 'zh',
          reminderEnabled: true,
          reminderLeadTime: 15,
        },
      });

      const analytics = await AnalyticsService.getAnalytics();

      expect(analytics.completionRate).toBe(100);
      expect(analytics.completedTasks).toBe(3);
      expect(analytics.activeTasks).toBe(0);
      expect(analytics.averageCompletionTime).toBeGreaterThan(0);
    });

    test('应该处理没有标签的任务', async () => {
      const todosWithoutTags = mockTodos.map(todo => ({
        ...todo,
        tags: [],
      }));

      mockStorageService.getState.mockResolvedValue({
        todos: todosWithoutTags,
        tags: [],
        filter: {
          status: 'all',
        },
        settings: {
          language: 'zh',
          reminderEnabled: true,
          reminderLeadTime: 15,
        },
      });

      const analytics = await AnalyticsService.getAnalytics();

      expect(analytics.tasksByTag).toEqual({});
    });

    test('应该处理同一天创建的多个任务', async () => {
      const now = Date.now();
      const sameDayTodos = [
        { ...mockTodos[0], createdAt: now },
        { ...mockTodos[1], createdAt: now },
        { ...mockTodos[2], createdAt: now - 1000 }, // 1秒前，同一天
      ];

      mockStorageService.getState.mockResolvedValue({
        todos: sameDayTodos,
        tags: [],
        filter: {
          status: 'all',
        },
        settings: {
          language: 'zh',
          reminderEnabled: true,
          reminderLeadTime: 15,
        },
      });

      const analytics = await AnalyticsService.getAnalytics();

      const today = new Date(now).toISOString().split('T')[0];
      expect(analytics.tasksByDate[today]).toBeGreaterThanOrEqual(2);
    });

    test('应该处理StorageService错误', async () => {
      mockStorageService.getState.mockRejectedValue(new Error('Storage error'));

      await expect(AnalyticsService.getAnalytics()).rejects.toThrow(
        'Storage error'
      );
    });
  });
});
