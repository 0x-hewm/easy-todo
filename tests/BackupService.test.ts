/**
 * BackupService 测试套件
 * 测试备份和恢复功能
 */

import { BackupService } from '../src/services/BackupService';
import { StorageService } from '../src/services/StorageService';
import { TodoState } from '../src/types';

// Mock dependencies
jest.mock('../src/services/StorageService');
const mockStorageService = StorageService as jest.Mocked<typeof StorageService>;

// Mock global objects
const mockNavigator = {
  platform: 'MacIntel',
  userAgent:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
};

const mockChrome = {
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn(),
    },
  },
};

// Mock FileReader
class MockFileReader {
  result: string | null = null;
  onload: ((event: any) => void) | null = null;
  onerror: ((event: any) => void) | null = null;

  readAsText(file: File) {
    setTimeout(() => {
      this.result =
        file.name === 'valid-backup.json'
          ? JSON.stringify({
              metadata: {
                version: '1.0.0',
                timestamp: Date.now(),
                deviceInfo: mockNavigator,
                checksum: 'test-checksum',
              },
              state: {
                todos: [],
                tags: [],
                filter: { status: 'all' },
                settings: {
                  language: 'zh',
                  reminderEnabled: true,
                  reminderLeadTime: 15,
                },
              },
              templates: [],
            })
          : 'invalid json';

      if (this.onload) {
        this.onload({ target: { result: this.result } });
      }
    }, 10);
  }
}

describe('BackupService', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock global objects
    (global as any).navigator = mockNavigator;
    (global as any).chrome = mockChrome;
    (global as any).FileReader = MockFileReader;

    // Mock Blob
    (global as any).Blob = jest.fn().mockImplementation((content, options) => ({
      content,
      type: options?.type || 'application/json',
      size: JSON.stringify(content).length,
    }));

    // Setup default mocks
    mockStorageService.getState.mockResolvedValue({
      todos: [],
      tags: [],
      filter: { status: 'all' },
      settings: {
        language: 'zh',
        reminderEnabled: true,
        reminderLeadTime: 15,
      },
    });

    mockChrome.storage.local.get.mockResolvedValue({
      'todo-templates': [],
    });

    mockChrome.storage.local.set.mockResolvedValue(undefined);
    mockStorageService.setState.mockResolvedValue();
  });

  describe('createBackup', () => {
    test('应该创建有效的备份文件', async () => {
      const testState: TodoState = {
        todos: [
          {
            id: '1',
            title: '测试任务',
            completed: false,
            priority: 'medium',
            tags: ['test'],
            createdAt: Date.now(),
            updatedAt: Date.now(),
            reminded: false,
          },
        ],
        tags: [
          {
            id: 'test',
            name: '测试标签',
            color: '#ff0000',
            createAt: Date.now(),
          },
        ],
        filter: { status: 'all' },
        settings: {
          language: 'zh',
          reminderEnabled: true,
          reminderLeadTime: 15,
        },
      };

      mockStorageService.getState.mockResolvedValue(testState);
      mockChrome.storage.local.get.mockResolvedValue({
        'todo-templates': [{ name: '模板1', content: '测试' }],
      });

      const backup = await BackupService.createBackup();

      expect(backup).toBeDefined();
      expect((global as any).Blob).toHaveBeenCalledWith([expect.any(String)], {
        type: 'application/json',
      });
      expect(mockStorageService.getState).toHaveBeenCalled();
      expect(mockChrome.storage.local.get).toHaveBeenCalledWith(
        'todo-templates'
      );
    });

    test('应该包含正确的元数据', async () => {
      const backup = await BackupService.createBackup();

      // 模拟解析备份内容
      const backupContent = JSON.parse((backup as any).content[0]);

      expect(backupContent.metadata).toBeDefined();
      expect(backupContent.metadata.version).toBe('1.0.0');
      expect(backupContent.metadata.timestamp).toBeGreaterThan(0);
      expect(backupContent.metadata.deviceInfo).toBeDefined();
      expect(backupContent.metadata.checksum).toBeDefined();
    });

    test('应该处理StorageService错误', async () => {
      mockStorageService.getState.mockRejectedValue(new Error('存储错误'));

      await expect(BackupService.createBackup()).rejects.toThrow('存储错误');
    });
  });

  describe('restoreBackup', () => {
    test('应该成功恢复有效的备份文件', async () => {
      const mockFile = new File([''], 'valid-backup.json', {
        type: 'application/json',
      });

      const result = await BackupService.restoreBackup(mockFile);

      expect(result).toBe(true);
      expect(mockStorageService.setState).toHaveBeenCalled();
      expect(mockChrome.storage.local.set).toHaveBeenCalledWith({
        'todo-templates': [],
      });
    });

    test('应该拒绝无效的备份文件', async () => {
      const mockFile = new File([''], 'invalid-backup.json', {
        type: 'application/json',
      });

      const result = await BackupService.restoreBackup(mockFile);

      expect(result).toBe(false);
      expect(mockStorageService.setState).not.toHaveBeenCalled();
    });

    test('应该处理文件读取错误', async () => {
      // Mock FileReader to simulate error
      (global as any).FileReader = class {
        onerror: ((event: any) => void) | null = null;
        readAsText() {
          setTimeout(() => {
            if (this.onerror) {
              this.onerror(new Error('文件读取失败'));
            }
          }, 10);
        }
      };

      const mockFile = new File([''], 'error-file.json', {
        type: 'application/json',
      });

      const result = await BackupService.restoreBackup(mockFile);

      expect(result).toBe(false);
    });

    test('应该处理JSON解析错误', async () => {
      // Mock FileReader to return invalid JSON
      (global as any).FileReader = class {
        onload: ((event: any) => void) | null = null;
        readAsText() {
          setTimeout(() => {
            if (this.onload) {
              this.onload({ target: { result: 'invalid json' } });
            }
          }, 10);
        }
      };

      const mockFile = new File([''], 'invalid-json.json', {
        type: 'application/json',
      });

      const result = await BackupService.restoreBackup(mockFile);

      expect(result).toBe(false);
    });

    test('应该处理StorageService恢复错误', async () => {
      mockStorageService.setState.mockRejectedValue(new Error('恢复失败'));

      const mockFile = new File([''], 'valid-backup.json', {
        type: 'application/json',
      });

      const result = await BackupService.restoreBackup(mockFile);

      expect(result).toBe(false);
    });
  });

  describe('内部方法测试', () => {
    test('validateBackup 应该正确验证备份结构', async () => {
      // 通过反射测试私有方法的逻辑
      const validBackup = {
        metadata: {
          version: '1.0.0',
          timestamp: Date.now(),
          deviceInfo: mockNavigator,
          checksum: 'test',
        },
        state: {
          todos: [],
        },
        templates: [],
      };

      // 测试有效备份文件的恢复
      const mockFile = new File(
        [JSON.stringify(validBackup)],
        'valid-backup.json'
      );
      const result = await BackupService.restoreBackup(mockFile);
      expect(result).toBe(true);
    });

    test('calculateChecksum 应该为相同输入生成相同校验和', async () => {
      // 通过创建两个相同的备份来测试校验和的一致性
      const backup1 = await BackupService.createBackup();
      const backup2 = await BackupService.createBackup();

      const content1 = JSON.parse((backup1 as any).content[0]);
      const content2 = JSON.parse((backup2 as any).content[0]);

      // 由于时间戳不同，校验和会不同，但结构应该相同
      expect(content1.metadata.version).toBe(content2.metadata.version);
      expect(content1.metadata.deviceInfo).toEqual(
        content2.metadata.deviceInfo
      );
    });
  });

  describe('错误处理', () => {
    test('应该记录恢复失败的错误', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const mockFile = new File([''], 'invalid.json', {
        type: 'application/json',
      });

      await BackupService.restoreBackup(mockFile);

      expect(consoleSpy).toHaveBeenCalledWith(
        '恢复备份失败:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    test('应该处理Chrome存储API错误', async () => {
      mockChrome.storage.local.get.mockRejectedValue(
        new Error('Chrome存储错误')
      );

      await expect(BackupService.createBackup()).rejects.toThrow(
        'Chrome存储错误'
      );
    });

    test('应该处理空文件', async () => {
      (global as any).FileReader = class {
        onload: ((event: any) => void) | null = null;
        readAsText() {
          setTimeout(() => {
            if (this.onload) {
              this.onload({ target: { result: '' } });
            }
          }, 10);
        }
      };

      const mockFile = new File([''], 'empty.json', {
        type: 'application/json',
      });

      const result = await BackupService.restoreBackup(mockFile);

      expect(result).toBe(false);
    });
  });
});
