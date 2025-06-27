/**
 * TagService 测试套件
 * 测试标签管理的核心功能，包括增删改查、标签与任务的关联等
 */

import { StorageService } from '../src/services/StorageService';
import { TagService } from '../src/services/TagService';
import { TagInfo, Todo, TodoState } from '../src/types';

// Mock StorageService
jest.mock('../src/services/StorageService');
const mockStorageService = StorageService as jest.Mocked<typeof StorageService>;

describe('TagService', () => {
  let mockState: TodoState;
  let mockTags: TagInfo[];
  let mockTodos: Todo[];

  beforeEach(() => {
    jest.clearAllMocks();

    // 创建测试数据
    mockTags = [
      {
        id: 'tag1',
        name: '工作',
        color: '#4a90e2',
        createAt: Date.now() - 86400000,
      },
      {
        id: 'tag2',
        name: '个人',
        color: '#27ae60',
        createAt: Date.now() - 172800000,
      },
      {
        id: 'tag3',
        name: '学习',
        color: '#e74c3c',
        createAt: Date.now() - 259200000,
      },
    ];

    mockTodos = [
      {
        id: 'todo1',
        title: '工作任务',
        completed: false,
        priority: 'high',
        tags: ['tag1'],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        reminded: false,
      },
      {
        id: 'todo2',
        title: '个人任务',
        completed: false,
        priority: 'medium',
        tags: ['tag2'],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        reminded: false,
      },
      {
        id: 'todo3',
        title: '多标签任务',
        completed: false,
        priority: 'low',
        tags: ['tag1', 'tag3'],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        reminded: false,
      },
    ];

    mockState = {
      todos: mockTodos,
      tags: mockTags,
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
  });

  describe('getAllTags', () => {
    test('应该能够获取所有标签', async () => {
      const tags = await TagService.getAllTags();

      expect(tags).toHaveLength(3);
      expect(tags).toEqual(mockTags);
      expect(mockStorageService.getState).toHaveBeenCalled();
    });

    test('当没有标签时应该返回空数组', async () => {
      mockState.tags = [];
      mockStorageService.getState.mockResolvedValue(mockState);

      const tags = await TagService.getAllTags();

      expect(tags).toEqual([]);
    });

    test('当标签属性为undefined时应该返回空数组', async () => {
      mockState.tags = undefined as any;
      mockStorageService.getState.mockResolvedValue(mockState);

      const tags = await TagService.getAllTags();

      expect(tags).toEqual([]);
    });
  });

  describe('createTag', () => {
    test('应该能够创建新的标签', async () => {
      const newTag = await TagService.createTag('新标签', '#ff0000');

      expect(newTag).toBeDefined();
      expect(newTag.id).toBeTruthy();
      expect(newTag.name).toBe('新标签');
      expect(newTag.color).toBe('#ff0000');
      expect(newTag.createAt).toBeGreaterThan(0);
      expect(mockStorageService.setState).toHaveBeenCalled();
    });

    test('创建标签时如果没有指定颜色应该使用默认颜色', async () => {
      const newTag = await TagService.createTag('新标签', '');

      expect(newTag.color).toMatch(/^#[0-9a-f]{6}$/i);
      expect(newTag.color).not.toBe('');
    });

    test('不能创建重名的标签', async () => {
      await expect(TagService.createTag('工作', '#ff0000')).rejects.toThrow(
        '标签已存在'
      );
    });

    test('创建标签应该生成唯一ID', async () => {
      const tag1 = await TagService.createTag('标签1', '#ff0000');
      const tag2 = await TagService.createTag('标签2', '#00ff00');

      expect(tag1.id).not.toBe(tag2.id);
    });
  });

  describe('updateTag', () => {
    test('应该能够更新现有标签', async () => {
      const updates = {
        name: '更新后的工作',
        color: '#ff0000',
      };

      const updatedTag = await TagService.updateTag('tag1', updates);

      expect(updatedTag.name).toBe('更新后的工作');
      expect(updatedTag.color).toBe('#ff0000');
      expect(updatedTag.id).toBe('tag1'); // ID 不应该被修改
      expect(mockStorageService.setState).toHaveBeenCalled();
    });

    test('更新不存在的标签应该抛出错误', async () => {
      await expect(
        TagService.updateTag('nonexistent', { name: '不存在' })
      ).rejects.toThrow('标签不存在');
    });

    test('不能将标签名称改为已存在的名称', async () => {
      await expect(
        TagService.updateTag('tag1', { name: '个人' })
      ).rejects.toThrow('标签名称已存在');
    });

    test('应该能够只更新部分字段', async () => {
      const updatedTag = await TagService.updateTag('tag1', {
        color: '#123456',
      });

      expect(updatedTag.name).toBe('工作'); // 名称不变
      expect(updatedTag.color).toBe('#123456'); // 颜色更新
    });
  });

  describe('deleteTag', () => {
    test('应该能够删除未被使用的标签', async () => {
      // 创建一个未被使用的标签
      mockState.tags = [
        ...mockTags,
        {
          id: 'unused-tag',
          name: '未使用标签',
          color: '#000000',
          createAt: Date.now(),
        },
      ];
      mockStorageService.getState.mockResolvedValue(mockState);

      await TagService.deleteTag('unused-tag');

      expect(mockStorageService.setState).toHaveBeenCalled();
      const callArgs = mockStorageService.setState.mock.calls[0][0];
      expect(
        callArgs.tags?.find((t: TagInfo) => t.id === 'unused-tag')
      ).toBeUndefined();
    });

    test('不能删除被任务使用的标签', async () => {
      await expect(TagService.deleteTag('tag1')).rejects.toThrow(
        /标签已被\d+个待办事项使用/
      );
    });

    test('删除不存在的标签应该正常执行', async () => {
      await expect(TagService.deleteTag('nonexistent')).resolves.not.toThrow();
      expect(mockStorageService.setState).toHaveBeenCalled();
    });
  });

  describe('addTagToTodo', () => {
    test('应该能够为任务添加标签', async () => {
      await TagService.addTagToTodo('todo2', 'tag3');

      expect(mockStorageService.updateTodo).toHaveBeenCalled();
      const updatedTodo = mockStorageService.updateTodo.mock.calls[0][0];
      expect(updatedTodo.tags).toContain('tag3');
    });

    test('添加任务不存在时应该抛出错误', async () => {
      await expect(
        TagService.addTagToTodo('nonexistent', 'tag1')
      ).rejects.toThrow('任务不存在');
    });

    test('添加不存在的标签时应该抛出错误', async () => {
      await expect(
        TagService.addTagToTodo('todo1', 'nonexistent-tag')
      ).rejects.toThrow('标签不存在');
    });

    test('重复添加相同标签应该不会重复', async () => {
      await TagService.addTagToTodo('todo1', 'tag1'); // tag1 已经存在于 todo1

      // 由于标签已存在，updateTodo 不应该被调用
      expect(mockStorageService.updateTodo).not.toHaveBeenCalled();
    });
  });

  describe('removeTagFromTodo', () => {
    test('应该能够从任务中移除标签', async () => {
      await TagService.removeTagFromTodo('todo1', 'tag1');

      expect(mockStorageService.updateTodo).toHaveBeenCalled();
      const updatedTodo = mockStorageService.updateTodo.mock.calls[0][0];
      expect(updatedTodo.tags).not.toContain('tag1');
    });

    test('移除任务不存在时应该抛出错误', async () => {
      await expect(
        TagService.removeTagFromTodo('nonexistent', 'tag1')
      ).rejects.toThrow('任务不存在');
    });

    test('移除不存在的标签应该正常执行', async () => {
      await expect(
        TagService.removeTagFromTodo('todo1', 'nonexistent-tag')
      ).resolves.not.toThrow();

      expect(mockStorageService.updateTodo).toHaveBeenCalled();
    });
  });

  describe('hasAnyTags', () => {
    test('有标签时应该返回true', async () => {
      const result = await TagService.hasAnyTags();
      expect(result).toBe(true);
    });

    test('没有标签时应该返回false', async () => {
      mockState.tags = [];
      mockStorageService.getState.mockResolvedValue(mockState);

      const result = await TagService.hasAnyTags();
      expect(result).toBe(false);
    });
  });

  describe('isTagUsed', () => {
    test('应该能够检查标签是否被使用', async () => {
      const usedResult = await TagService.isTagUsed('tag1');
      const unusedResult = await TagService.isTagUsed('tag2');

      expect(usedResult.used).toBe(true);
      expect(usedResult.count).toBe(2); // tag1 被 todo1 和 todo3 使用

      expect(unusedResult.used).toBe(true);
      expect(unusedResult.count).toBe(1); // tag2 被 todo2 使用
    });

    test('未被使用的标签应该返回正确的状态', async () => {
      // 添加一个未被使用的标签
      mockState.tags = [
        ...mockTags,
        {
          id: 'unused',
          name: '未使用',
          color: '#000000',
          createAt: Date.now(),
        },
      ];
      mockStorageService.getState.mockResolvedValue(mockState);

      const result = await TagService.isTagUsed('unused');

      expect(result.used).toBe(false);
      expect(result.count).toBe(0);
    });
  });

  describe('颜色管理', () => {
    test('应该为新标签选择未使用的默认颜色', async () => {
      // 清空现有标签，只保留一个使用了默认颜色的标签
      mockState.tags = [
        {
          id: 'tag1',
          name: '现有标签',
          color: '#4a90e2', // 第一个默认颜色
          createAt: Date.now(),
        },
      ];
      mockStorageService.getState.mockResolvedValue(mockState);

      const newTag = await TagService.createTag('新标签', '');

      // 新标签应该使用第二个默认颜色
      expect(newTag.color).toBe('#27ae60');
    });

    test('当所有默认颜色都被使用时应该随机选择一个', async () => {
      // 创建使用了所有默认颜色的标签
      const allColors = [
        '#4a90e2',
        '#27ae60',
        '#e74c3c',
        '#f1c40f',
        '#9b59b6',
        '#e67e22',
        '#1abc9c',
        '#34495e',
      ];
      mockState.tags = allColors.map((color, index) => ({
        id: `tag${index}`,
        name: `标签${index}`,
        color,
        createAt: Date.now(),
      }));
      mockStorageService.getState.mockResolvedValue(mockState);

      const newTag = await TagService.createTag('新标签', '');

      // 应该是默认颜色之一
      expect(allColors).toContain(newTag.color);
    });
  });

  describe('错误处理', () => {
    test('存储服务出错时应该抛出异常', async () => {
      mockStorageService.getState.mockRejectedValue(new Error('存储错误'));

      await expect(TagService.getAllTags()).rejects.toThrow('存储错误');
    });

    test('保存时出错应该抛出异常', async () => {
      mockStorageService.setState.mockRejectedValue(new Error('保存失败'));

      await expect(TagService.createTag('新标签', '#ff0000')).rejects.toThrow(
        '保存失败'
      );
    });
  });
});
