/**
 * TodoService 测试套件
 * 测试待办事项的核心业务逻辑，包括增删改查、状态管理、过滤和排序等功能
 */

import { NotificationService } from '../src/services/NotificationService';
import { StorageService } from '../src/services/StorageService';
import { TodoService } from '../src/services/TodoService';
import { Todo, TodoFilter, TodoState } from '../src/types';

// Mock Services
jest.mock('../src/services/StorageService');
jest.mock('../src/services/NotificationService');

const mockStorageService = StorageService as jest.Mocked<typeof StorageService>;
const mockNotificationService = NotificationService as jest.Mocked<
  typeof NotificationService
>;

describe('TodoService', () => {
  let mockState: TodoState;
  let mockTodos: Todo[];

  beforeEach(() => {
    // 重置所有 mock
    jest.clearAllMocks();

    // 创建测试数据
    mockTodos = [
      {
        id: '1',
        title: '测试任务1',
        description: '测试描述1',
        completed: false,
        priority: 'high',
        tags: ['工作', '重要'],
        createdAt: Date.now() - 86400000, // 1天前
        updatedAt: Date.now() - 86400000,
        dueDate: Date.now() + 86400000, // 1天后
        reminderLeadTime: 60,
        reminded: false,
      },
      {
        id: '2',
        title: '测试任务2',
        description: '测试描述2',
        completed: true,
        priority: 'medium',
        tags: ['个人'],
        createdAt: Date.now() - 172800000, // 2天前
        updatedAt: Date.now() - 86400000,
        dueDate: Date.now() - 3600000, // 1小时前(已过期)
        reminderLeadTime: 30,
        reminded: true,
      },
      {
        id: '3',
        title: '测试任务3',
        description: '测试描述3',
        completed: false,
        priority: 'low',
        tags: ['学习'],
        createdAt: Date.now() - 259200000, // 3天前
        updatedAt: Date.now() - 86400000,
        reminderLeadTime: 120,
        reminded: false,
      },
    ];

    mockState = {
      todos: mockTodos,
      tags: [
        { id: 'tag1', name: '工作', color: '#ff0000', createAt: Date.now() },
        { id: 'tag2', name: '个人', color: '#00ff00', createAt: Date.now() },
        { id: 'tag3', name: '学习', color: '#0000ff', createAt: Date.now() },
      ],
      filter: {
        status: 'all',
      },
      settings: {
        language: 'zh',
        reminderEnabled: true,
        reminderLeadTime: 60,
      },
    };

    // Mock StorageService 方法
    mockStorageService.getState.mockResolvedValue(mockState);
    mockStorageService.setState.mockResolvedValue(undefined);
    mockStorageService.updateTodo.mockResolvedValue(undefined);

    // Mock NotificationService 方法
    mockNotificationService.scheduleNotification.mockResolvedValue(undefined);
    mockNotificationService.cancelNotification.mockResolvedValue(undefined);
  });

  describe('createTodo', () => {
    test('应该能够创建新的待办事项', async () => {
      const newTodo = await TodoService.createTodo(
        '新任务',
        '新任务描述',
        Date.now() + 172800000, // 2天后
        ['工作'],
        'high',
        60
      );

      expect(newTodo).toBeDefined();
      expect(newTodo.id).toBeTruthy();
      expect(newTodo.title).toBe('新任务');
      expect(newTodo.description).toBe('新任务描述');
      expect(newTodo.completed).toBe(false);
      expect(newTodo.priority).toBe('high');
      expect(newTodo.tags).toEqual(['工作']);
      expect(newTodo.reminderLeadTime).toBe(60);
      expect(mockStorageService.setState).toHaveBeenCalled();
      expect(mockNotificationService.scheduleNotification).toHaveBeenCalled();
    });

    test('创建待办事项时标题不能为空', async () => {
      await expect(TodoService.createTodo('')).rejects.toThrow('标题不能为空');

      await expect(TodoService.createTodo('   ')).rejects.toThrow(
        '标题不能为空'
      );
    });

    test('截止日期不能早于当前时间', async () => {
      const pastDate = Date.now() - 86400000; // 1天前

      await expect(
        TodoService.createTodo('测试任务', undefined, pastDate)
      ).rejects.toThrow('截止日期不能早于当前时间');
    });

    test('提醒时间不能早于当前时间', async () => {
      const nearFutureDate = Date.now() + 1000; // 1秒后
      const longReminderTime = 120; // 2小时提醒

      await expect(
        TodoService.createTodo(
          '测试任务',
          undefined,
          nearFutureDate,
          [],
          'medium',
          longReminderTime
        )
      ).rejects.toThrow('提醒时间不能早于当前时间');
    });

    test('应该正确处理可选参数', async () => {
      const simpleTodo = await TodoService.createTodo('简单任务');

      expect(simpleTodo.title).toBe('简单任务');
      expect(simpleTodo.description).toBeUndefined();
      expect(simpleTodo.dueDate).toBeUndefined();
      expect(simpleTodo.tags).toEqual([]);
      expect(simpleTodo.priority).toBe('medium');
      expect(simpleTodo.reminderLeadTime).toBeUndefined();
    });
  });

  describe('getTodos', () => {
    test('应该能够获取所有待办事项', async () => {
      const filter: TodoFilter = { status: 'all' };
      const todos = await TodoService.getTodos(filter);

      expect(todos).toHaveLength(3);
      expect(mockStorageService.getState).toHaveBeenCalled();
    });

    test('应该能够按状态过滤待办事项', async () => {
      const activeFilter: TodoFilter = { status: 'active' };
      const activeTodos = await TodoService.getTodos(activeFilter);

      const completedFilter: TodoFilter = { status: 'completed' };
      const completedTodos = await TodoService.getTodos(completedFilter);

      expect(activeTodos).toHaveLength(2);
      expect(completedTodos).toHaveLength(1);
      expect(activeTodos.every(todo => !todo.completed)).toBe(true);
      expect(completedTodos.every(todo => todo.completed)).toBe(true);
    });

    test('应该能够按优先级过滤待办事项', async () => {
      const highFilter: TodoFilter = { priority: 'high' };
      const highTodos = await TodoService.getTodos(highFilter);

      const mediumFilter: TodoFilter = { priority: 'medium' };
      const mediumTodos = await TodoService.getTodos(mediumFilter);

      expect(highTodos).toHaveLength(1);
      expect(mediumTodos).toHaveLength(1);
      expect(highTodos[0].priority).toBe('high');
      expect(mediumTodos[0].priority).toBe('medium');
    });

    test('应该能够按标签过滤待办事项', async () => {
      const workFilter: TodoFilter = { tags: ['工作'] };
      const workTodos = await TodoService.getTodos(workFilter);

      const personalFilter: TodoFilter = { tags: ['个人'] };
      const personalTodos = await TodoService.getTodos(personalFilter);

      expect(workTodos).toHaveLength(1);
      expect(personalTodos).toHaveLength(1);
      expect(workTodos[0].tags).toContain('工作');
      expect(personalTodos[0].tags).toContain('个人');
    });

    test('应该能够按文本搜索待办事项', async () => {
      const searchFilter: TodoFilter = { searchText: '测试任务1' };
      const searchResults = await TodoService.getTodos(searchFilter);

      const descSearchFilter: TodoFilter = { searchText: '测试描述2' };
      const descSearchResults = await TodoService.getTodos(descSearchFilter);

      expect(searchResults).toHaveLength(1);
      expect(searchResults[0].title).toBe('测试任务1');
      expect(descSearchResults).toHaveLength(1);
      expect(descSearchResults[0].description).toBe('测试描述2');
    });

    test('搜索应该不区分大小写', async () => {
      const filter: TodoFilter = { searchText: '测试' };
      const results = await TodoService.getTodos(filter);

      expect(results).toHaveLength(3);
    });

    test('应该能够组合多个过滤条件', async () => {
      const complexFilter: TodoFilter = {
        status: 'active',
        priority: 'high',
        tags: ['工作'],
        searchText: '测试',
      };
      const results = await TodoService.getTodos(complexFilter);

      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('1');
    });
  });

  describe('getTodo', () => {
    test('应该能够根据ID获取待办事项', async () => {
      const todo = await TodoService.getTodo('1');

      expect(todo).toBeDefined();
      expect(todo!.id).toBe('1');
      expect(todo!.title).toBe('测试任务1');
    });

    test('获取不存在的待办事项应该返回undefined', async () => {
      const todo = await TodoService.getTodo('999');

      expect(todo).toBeUndefined();
    });
  });

  describe('updateTodo', () => {
    test('应该能够更新现有待办事项', async () => {
      const updates = {
        title: '更新后的标题',
        description: '更新后的描述',
        priority: 'low' as const,
      };

      await TodoService.updateTodo('1', updates);

      expect(mockStorageService.setState).toHaveBeenCalled();
      // 验证状态中的数据是否被正确更新
      const callArgs = mockStorageService.setState.mock.calls[0][0];
      const updatedTodo = callArgs.todos.find((t: Todo) => t.id === '1');
      expect(updatedTodo).toBeDefined();
      expect(updatedTodo!.title).toBe('更新后的标题');
      expect(updatedTodo!.description).toBe('更新后的描述');
      expect(updatedTodo!.priority).toBe('low');
    });

    test('更新不存在的待办事项应该抛出错误', async () => {
      await expect(
        TodoService.updateTodo('999', { title: '不存在的任务' })
      ).rejects.toThrow('任务不存在');
    });

    test('更新提醒相关字段应该重新设置通知', async () => {
      const updates = {
        dueDate: Date.now() + 172800000, // 2天后
        reminderLeadTime: 30,
      };

      await TodoService.updateTodo('1', updates);

      expect(mockNotificationService.cancelNotification).toHaveBeenCalledWith(
        '1'
      );
      expect(mockNotificationService.scheduleNotification).toHaveBeenCalled();
    });
  });

  describe('deleteTodo', () => {
    test('应该能够删除待办事项', async () => {
      await TodoService.deleteTodo('1');

      expect(mockNotificationService.cancelNotification).toHaveBeenCalledWith(
        '1'
      );
      expect(mockStorageService.setState).toHaveBeenCalled();

      const callArgs = mockStorageService.setState.mock.calls[0][0];
      expect(callArgs.todos).toHaveLength(2);
      expect(callArgs.todos.find((t: Todo) => t.id === '1')).toBeUndefined();
    });
  });

  describe('toggleTodoStatus', () => {
    test('应该能够切换待办事项完成状态', async () => {
      await TodoService.toggleTodoStatus('1');

      expect(mockStorageService.updateTodo).toHaveBeenCalled();
      const updatedTodo = mockStorageService.updateTodo.mock.calls[0][0];
      expect(updatedTodo.completed).toBe(true);
    });

    test('切换不存在的待办事项应该抛出错误', async () => {
      // 模拟找不到待办事项的情况
      mockState.todos = [];
      mockStorageService.getState.mockResolvedValue(mockState);

      await expect(TodoService.toggleTodoStatus('999')).rejects.toThrow(
        '任务不存在'
      );
    });
  });

  describe('getStatistics', () => {
    test('应该能够获取待办事项统计信息', async () => {
      const stats = await TodoService.getStatistics();

      expect(stats.total).toBe(3);
      expect(stats.completed).toBe(1);
      expect(stats.active).toBe(2);
    });
  });

  describe('getTodosByTag', () => {
    test('应该能够根据标签获取待办事项', async () => {
      const workTodos = await TodoService.getTodosByTag('工作');
      const personalTodos = await TodoService.getTodosByTag('个人');

      expect(workTodos).toHaveLength(1);
      expect(workTodos[0].tags).toContain('工作');
      expect(personalTodos).toHaveLength(1);
      expect(personalTodos[0].tags).toContain('个人');
    });

    test('不存在的标签应该返回空数组', async () => {
      const noTodos = await TodoService.getTodosByTag('不存在的标签');
      expect(noTodos).toHaveLength(0);
    });
  });

  describe('updateTodoTags', () => {
    test('应该能够更新待办事项的标签', async () => {
      const newTags = ['新标签1', '新标签2'];
      await TodoService.updateTodoTags('1', newTags);

      expect(mockStorageService.updateTodo).toHaveBeenCalled();
      const updatedTodo = mockStorageService.updateTodo.mock.calls[0][0];
      expect(updatedTodo.tags).toEqual(newTags);
    });

    test('更新不存在的待办事项标签应该抛出错误', async () => {
      mockState.todos = [];
      mockStorageService.getState.mockResolvedValue(mockState);

      await expect(TodoService.updateTodoTags('999', ['标签'])).rejects.toThrow(
        '任务不存在'
      );
    });
  });

  describe('updateTodosOrder', () => {
    test('应该能够更新待办事项顺序', async () => {
      const reorderedTodos = [mockTodos[2], mockTodos[0], mockTodos[1]];
      await TodoService.updateTodosOrder(reorderedTodos);

      expect(mockStorageService.setState).toHaveBeenCalled();
      const callArgs = mockStorageService.setState.mock.calls[0][0];
      expect(callArgs.todos).toEqual(reorderedTodos);
    });
  });

  describe('错误处理', () => {
    test('存储服务出错时应该抛出异常', async () => {
      mockStorageService.getState.mockRejectedValue(new Error('存储错误'));

      await expect(TodoService.getTodos({})).rejects.toThrow('存储错误');
    });

    test('通知服务出错时应该抛出自定义错误', async () => {
      mockNotificationService.scheduleNotification.mockRejectedValue(
        new Error('通知错误')
      );

      await expect(
        TodoService.createTodo(
          '测试任务',
          undefined,
          Date.now() + 86400000,
          [],
          'medium',
          60
        )
      ).rejects.toThrow('设置提醒失败: 通知错误');
    });
  });
});
