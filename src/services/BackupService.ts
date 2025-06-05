import { TodoState } from '../types';
import { StorageService } from './StorageService';

export interface BackupMetadata {
  version: string;
  timestamp: number;
  deviceInfo: {
    platform: string;
    userAgent: string;
  };
  checksum: string;
}

export class BackupService {
  private static readonly VERSION = '1.0.0';

  static async createBackup(): Promise<Blob> {
    const state = await StorageService.getState();
    const templates = await chrome.storage.local.get('todo-templates');
    
    const backup = {
      metadata: this.createMetadata(),
      state: state,
      templates: templates['todo-templates'] || []
    };

    const json = JSON.stringify(backup, null, 2);
    return new Blob([json], { type: 'application/json' });
  }

  static async restoreBackup(file: File): Promise<boolean> {
    try {
      const content = await this.readFile(file);
      const backup = JSON.parse(content);

      // 验证备份文件
      if (!this.validateBackup(backup)) {
        throw new Error('无效的备份文件');
      }

      // 恢复数据
      await StorageService.setState(backup.state);
      await chrome.storage.local.set({
        'todo-templates': backup.templates
      });

      return true;
    } catch (error) {
      console.error('恢复备份失败:', error);
      return false;
    }
  }

  private static createMetadata(): BackupMetadata {
    const data = {
      version: this.VERSION,
      timestamp: Date.now(),
      deviceInfo: {
        platform: navigator.platform,
        userAgent: navigator.userAgent
      },
      checksum: '' // 将在转换为字符串后计算
    };
    
    // 计算校验和
    data.checksum = this.calculateChecksum(JSON.stringify(data));
    
    return data;
  }

  private static calculateChecksum(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(16);
  }

  private static validateBackup(backup: any): boolean {
    return (
      backup &&
      backup.metadata &&
      backup.metadata.version &&
      backup.state &&
      backup.state.todos &&
      Array.isArray(backup.state.todos)
    );
  }

  private static readFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  }
}
