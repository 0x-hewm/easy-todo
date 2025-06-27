import { StorageService } from '../src/services/StorageService';
import { Todo, TodoState } from '../src/types';

// Mock Chrome Storage API
const mockChromeStorage = {
  local: {
    get: jest.fn(),
    set: jest.fn(),
  },
};

(global as any).chrome = {
  storage: mockChromeStorage,
};

describe('StorageService', () => {
  const mockTodo: Todo = {
    id: '1',
    title: '测试任务',
    description: '测试描述',
    completed: false,
    priority: 'medium',
    tags: ['测试'],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    reminderLeadTime: 60,
    reminded: false,
  };

  const mockState: TodoState = {
    todos: [mockTodo],
    tags: [
      { id: 'tag1', name: '测试', color: '#ff0000', createAt: Date.now() },
    ],
    filter: { status: 'all' },
    settings: {
      language: 'zh',
      reminderEnabled: true,
      reminderLeadTime: 60,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getState', () => {
    it('should return stored state', async () => {
      mockChromeStorage.local.get.mockResolvedValue({
        'easy-todo-state': mockState,
      });

      const result = await StorageService.getState();

      expect(mockChromeStorage.local.get).toHaveBeenCalledWith(
        'easy-todo-state'
      );
      expect(result).toEqual(mockState);
    });

    it('should return default state when no data exists', async () => {
      mockChromeStorage.local.get.mockResolvedValue({});

      const result = await StorageService.getState();

      expect(result).toEqual({
        todos: [],
        tags: [],
        filter: { status: 'all' },
        settings: {
          language: 'zh',
          reminderEnabled: true,
          reminderLeadTime: 60,
        },
      });
    });
  });

  describe('setState', () => {
    it('should save state to storage', async () => {
      mockChromeStorage.local.set.mockResolvedValue(undefined);

      await StorageService.setState(mockState);

      expect(mockChromeStorage.local.set).toHaveBeenCalledWith({
        'easy-todo-state': mockState,
      });
    });
  });

  describe('addTodo', () => {
    it('should add todo to existing state', async () => {
      const initialState = { ...mockState, todos: [] };

      mockChromeStorage.local.get.mockResolvedValue({
        'easy-todo-state': initialState,
      });
      mockChromeStorage.local.set.mockResolvedValue(undefined);

      await StorageService.addTodo(mockTodo);

      expect(mockChromeStorage.local.get).toHaveBeenCalledWith(
        'easy-todo-state'
      );
      expect(mockChromeStorage.local.set).toHaveBeenCalledWith({
        'easy-todo-state': {
          ...initialState,
          todos: [mockTodo],
        },
      });
    });
  });

  describe('updateTodo', () => {
    it('should update existing todo', async () => {
      const updatedTodo: Todo = {
        ...mockTodo,
        title: '更新的任务',
        completed: true,
        updatedAt: Date.now(),
      };

      mockChromeStorage.local.get.mockResolvedValue({
        'easy-todo-state': mockState,
      });
      mockChromeStorage.local.set.mockResolvedValue(undefined);

      await StorageService.updateTodo(updatedTodo);

      expect(mockChromeStorage.local.set).toHaveBeenCalledWith({
        'easy-todo-state': {
          ...mockState,
          todos: [updatedTodo],
        },
      });
    });

    it('should not update if todo not found', async () => {
      const nonExistentTodo: Todo = {
        ...mockTodo,
        id: 'non-existent',
      };

      mockChromeStorage.local.get.mockResolvedValue({
        'easy-todo-state': mockState,
      });
      mockChromeStorage.local.set.mockResolvedValue(undefined);

      await StorageService.updateTodo(nonExistentTodo);

      // Should not call set since todo wasn't found
      expect(mockChromeStorage.local.set).not.toHaveBeenCalled();
    });
  });

  describe('deleteTodo', () => {
    it('should remove todo from state', async () => {
      mockChromeStorage.local.get.mockResolvedValue({
        'easy-todo-state': mockState,
      });
      mockChromeStorage.local.set.mockResolvedValue(undefined);

      await StorageService.deleteTodo('1');

      expect(mockChromeStorage.local.set).toHaveBeenCalledWith({
        'easy-todo-state': {
          ...mockState,
          todos: [],
        },
      });
    });

    it('should handle deletion of non-existent todo', async () => {
      mockChromeStorage.local.get.mockResolvedValue({
        'easy-todo-state': mockState,
      });
      mockChromeStorage.local.set.mockResolvedValue(undefined);

      await StorageService.deleteTodo('non-existent');

      // State should remain unchanged
      expect(mockChromeStorage.local.set).toHaveBeenCalledWith({
        'easy-todo-state': mockState,
      });
    });
  });

  describe('updateFilter', () => {
    it('should update filter in state', async () => {
      mockChromeStorage.local.get.mockResolvedValue({
        'easy-todo-state': mockState,
      });
      mockChromeStorage.local.set.mockResolvedValue(undefined);

      await StorageService.updateFilter({ status: 'completed' });

      expect(mockChromeStorage.local.set).toHaveBeenCalledWith({
        'easy-todo-state': {
          ...mockState,
          filter: { status: 'completed' },
        },
      });
    });

    it('should merge with existing filter', async () => {
      const stateWithComplexFilter = {
        ...mockState,
        filter: { status: 'all', search: 'test' },
      };

      mockChromeStorage.local.get.mockResolvedValue({
        'easy-todo-state': stateWithComplexFilter,
      });
      mockChromeStorage.local.set.mockResolvedValue(undefined);

      await StorageService.updateFilter({ status: 'completed' });

      expect(mockChromeStorage.local.set).toHaveBeenCalledWith({
        'easy-todo-state': {
          ...stateWithComplexFilter,
          filter: { status: 'completed', search: 'test' },
        },
      });
    });
  });

  describe('error handling', () => {
    it('should propagate storage errors on getState', async () => {
      const error = new Error('Storage access denied');
      mockChromeStorage.local.get.mockRejectedValue(error);

      await expect(StorageService.getState()).rejects.toThrow(
        'Storage access denied'
      );
    });

    it('should propagate storage errors on setState', async () => {
      const error = new Error('Storage quota exceeded');
      mockChromeStorage.local.set.mockRejectedValue(error);

      await expect(StorageService.setState(mockState)).rejects.toThrow(
        'Storage quota exceeded'
      );
    });
  });
});
