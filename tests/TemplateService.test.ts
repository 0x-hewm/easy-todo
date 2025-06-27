import { TemplateService, TodoTemplate } from '../src/services/TemplateService';

// Mock Chrome API
const mockChromeStorage = {
  local: {
    get: jest.fn(),
    set: jest.fn(),
    remove: jest.fn(),
    clear: jest.fn(),
  },
};

(global as any).chrome = {
  storage: mockChromeStorage,
};

// Mock crypto.randomUUID
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: jest.fn(
      () => 'mock-uuid-' + Math.random().toString(36).substr(2, 9)
    ),
  },
});

describe('TemplateService', () => {
  const mockTemplate: TodoTemplate = {
    id: 'template-1',
    name: '工作任务模板',
    description: '用于创建工作相关任务',
    todo: {
      title: '工作任务',
      description: '这是一个工作任务',
      priority: 'high',
      tags: ['work', 'important'],
      dueDate: Date.now() + 86400000, // 明天
      reminderLeadTime: 3600000, // 1小时
    },
    createdAt: 1640995200000,
    updatedAt: 1640995200000,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockChromeStorage.local.get.mockResolvedValue({});
    mockChromeStorage.local.set.mockResolvedValue(undefined);
  });

  describe('getTemplates', () => {
    it('should return empty array when no templates exist', async () => {
      mockChromeStorage.local.get.mockResolvedValue({});

      const templates = await TemplateService.getTemplates();

      expect(templates).toEqual([]);
      expect(mockChromeStorage.local.get).toHaveBeenCalledWith(
        'todo-templates'
      );
    });

    it('should return existing templates', async () => {
      const mockTemplates = [mockTemplate];
      mockChromeStorage.local.get.mockResolvedValue({
        'todo-templates': mockTemplates,
      });

      const templates = await TemplateService.getTemplates();

      expect(templates).toEqual(mockTemplates);
    });
  });

  describe('saveTemplate', () => {
    it('should save new template with generated id and timestamps', async () => {
      const mockExistingTemplates = [mockTemplate];
      mockChromeStorage.local.get.mockResolvedValue({
        'todo-templates': mockExistingTemplates,
      });

      const templateData = {
        name: '新模板',
        description: '新模板描述',
        todo: {
          title: '新任务',
          priority: 'medium' as const,
          tags: ['test'],
        },
      };

      const savedTemplate = await TemplateService.saveTemplate(templateData);

      expect(savedTemplate).toMatchObject({
        ...templateData,
        id: expect.any(String),
        createdAt: expect.any(Number),
        updatedAt: expect.any(Number),
      });

      expect(mockChromeStorage.local.set).toHaveBeenCalledWith({
        'todo-templates': [...mockExistingTemplates, savedTemplate],
      });
    });

    it('should generate unique id for new template', async () => {
      const templateData = {
        name: '测试模板',
        todo: { title: '测试任务' },
      };

      const savedTemplate = await TemplateService.saveTemplate(templateData);

      expect(savedTemplate.id).toBeTruthy();
      expect(typeof savedTemplate.id).toBe('string');
    });
  });

  describe('deleteTemplate', () => {
    it('should delete template by id', async () => {
      const mockTemplates = [
        mockTemplate,
        { ...mockTemplate, id: 'template-2', name: '另一个模板' },
      ];
      mockChromeStorage.local.get.mockResolvedValue({
        'todo-templates': mockTemplates,
      });

      await TemplateService.deleteTemplate('template-1');

      expect(mockChromeStorage.local.set).toHaveBeenCalledWith({
        'todo-templates': [
          { ...mockTemplate, id: 'template-2', name: '另一个模板' },
        ],
      });
    });

    it('should handle deletion of non-existent template', async () => {
      const mockTemplates = [mockTemplate];
      mockChromeStorage.local.get.mockResolvedValue({
        'todo-templates': mockTemplates,
      });

      await TemplateService.deleteTemplate('non-existent-id');

      expect(mockChromeStorage.local.set).toHaveBeenCalledWith({
        'todo-templates': mockTemplates,
      });
    });
  });

  describe('createTodoFromTemplate', () => {
    it('should create todo from existing template', async () => {
      mockChromeStorage.local.get.mockResolvedValue({
        'todo-templates': [mockTemplate],
      });

      const todo = await TemplateService.createTodoFromTemplate('template-1');

      expect(todo).toMatchObject({
        id: expect.any(String),
        title: mockTemplate.todo.title,
        description: mockTemplate.todo.description,
        completed: false,
        createdAt: expect.any(Number),
        updatedAt: expect.any(Number),
        priority: mockTemplate.todo.priority,
        tags: mockTemplate.todo.tags,
        dueDate: mockTemplate.todo.dueDate,
        reminderLeadTime: mockTemplate.todo.reminderLeadTime,
        reminded: false,
      });
    });

    it('should create todo with default values when template has partial data', async () => {
      const minimalTemplate: TodoTemplate = {
        id: 'minimal-template',
        name: '最小模板',
        todo: {},
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      mockChromeStorage.local.get.mockResolvedValue({
        'todo-templates': [minimalTemplate],
      });

      const todo =
        await TemplateService.createTodoFromTemplate('minimal-template');

      expect(todo).toMatchObject({
        id: expect.any(String),
        title: '',
        description: undefined,
        completed: false,
        priority: 'medium',
        tags: [],
        dueDate: undefined,
        reminderLeadTime: undefined,
        reminded: false,
      });
    });

    it('should return null for non-existent template', async () => {
      mockChromeStorage.local.get.mockResolvedValue({
        'todo-templates': [mockTemplate],
      });

      const todo = await TemplateService.createTodoFromTemplate('non-existent');

      expect(todo).toBeNull();
    });
  });

  describe('updateTemplate', () => {
    it('should update existing template', async () => {
      const mockTemplates = [mockTemplate];
      mockChromeStorage.local.get.mockResolvedValue({
        'todo-templates': mockTemplates,
      });

      const updates = {
        name: '更新的模板名称',
        description: '更新的描述',
        todo: {
          title: '更新的任务标题',
          priority: 'low' as const,
        },
      };

      const updatedTemplate = await TemplateService.updateTemplate(
        'template-1',
        updates
      );

      expect(updatedTemplate).toMatchObject({
        ...mockTemplate,
        ...updates,
        updatedAt: expect.any(Number),
      });

      expect(mockChromeStorage.local.set).toHaveBeenCalledWith({
        'todo-templates': [updatedTemplate],
      });
    });

    it('should return null for non-existent template', async () => {
      mockChromeStorage.local.get.mockResolvedValue({
        'todo-templates': [mockTemplate],
      });

      const result = await TemplateService.updateTemplate('non-existent', {
        name: '更新名称',
      });

      expect(result).toBeNull();
    });

    it('should preserve original createdAt when updating', async () => {
      const mockTemplates = [mockTemplate];
      mockChromeStorage.local.get.mockResolvedValue({
        'todo-templates': mockTemplates,
      });

      const updatedTemplate = await TemplateService.updateTemplate(
        'template-1',
        {
          name: '新名称',
        }
      );

      expect(updatedTemplate?.createdAt).toBe(mockTemplate.createdAt);
      expect(updatedTemplate?.updatedAt).not.toBe(mockTemplate.updatedAt);
    });
  });

  describe('duplicateTemplate', () => {
    it('should duplicate existing template with new id and name', async () => {
      mockChromeStorage.local.get.mockResolvedValue({
        'todo-templates': [mockTemplate],
      });

      const duplicatedTemplate =
        await TemplateService.duplicateTemplate('template-1');

      expect(duplicatedTemplate).toMatchObject({
        ...mockTemplate,
        id: expect.any(String),
        name: `${mockTemplate.name} (复制)`,
        createdAt: expect.any(Number),
        updatedAt: expect.any(Number),
      });

      expect(duplicatedTemplate?.id).not.toBe(mockTemplate.id);
    });

    it('should return null for non-existent template', async () => {
      mockChromeStorage.local.get.mockResolvedValue({
        'todo-templates': [mockTemplate],
      });

      const result = await TemplateService.duplicateTemplate('non-existent');

      expect(result).toBeNull();
    });

    it('should add duplicated template to storage', async () => {
      const mockTemplates = [mockTemplate];
      mockChromeStorage.local.get.mockResolvedValue({
        'todo-templates': mockTemplates,
      });

      await TemplateService.duplicateTemplate('template-1');

      // Verify that set was called with templates including the duplicated one
      expect(mockChromeStorage.local.set).toHaveBeenCalledWith(
        expect.objectContaining({
          'todo-templates': expect.arrayContaining([
            mockTemplate, // Original template
            expect.objectContaining({
              id: expect.any(String),
              name: `${mockTemplate.name} (复制)`,
              description: mockTemplate.description,
              todo: mockTemplate.todo,
              createdAt: expect.any(Number),
              updatedAt: expect.any(Number),
            }),
          ]),
        })
      );

      const setCall = mockChromeStorage.local.set.mock.calls[0][0];
      expect(setCall['todo-templates']).toHaveLength(2);
    });
  });

  describe('error handling', () => {
    it('should handle storage errors gracefully', async () => {
      mockChromeStorage.local.get.mockRejectedValue(new Error('Storage error'));

      await expect(TemplateService.getTemplates()).rejects.toThrow(
        'Storage error'
      );
    });

    it('should handle save errors gracefully', async () => {
      mockChromeStorage.local.get.mockResolvedValue({});
      mockChromeStorage.local.set.mockRejectedValue(new Error('Save error'));

      const templateData = {
        name: '测试模板',
        todo: { title: '测试' },
      };

      await expect(TemplateService.saveTemplate(templateData)).rejects.toThrow(
        'Save error'
      );
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete template lifecycle', async () => {
      // Start with empty storage
      mockChromeStorage.local.get.mockResolvedValue({});

      // Create template
      const templateData = {
        name: '完整测试模板',
        description: '用于集成测试',
        todo: {
          title: '集成测试任务',
          priority: 'high' as const,
          tags: ['test', 'integration'],
        },
      };

      const savedTemplate = await TemplateService.saveTemplate(templateData);

      // Update storage mock to include saved template
      mockChromeStorage.local.get.mockResolvedValue({
        'todo-templates': [savedTemplate],
      });

      // Create todo from template
      const todo = await TemplateService.createTodoFromTemplate(
        savedTemplate.id
      );
      expect(todo?.title).toBe(templateData.todo.title);

      // Update template
      const updateData = { name: '更新的模板名称' };
      const updatedTemplate = await TemplateService.updateTemplate(
        savedTemplate.id,
        updateData
      );
      expect(updatedTemplate?.name).toBe(updateData.name);

      // Duplicate template
      const duplicatedTemplate = await TemplateService.duplicateTemplate(
        savedTemplate.id
      );
      expect(duplicatedTemplate?.name).toBe(`${updateData.name} (复制)`);
    });
  });
});
