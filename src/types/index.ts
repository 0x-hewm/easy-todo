export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: number;
  updatedAt: number;
  dueDate?: number;
  reminderLeadTime?: number;
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  reminded: boolean; // 添加提醒状态标记
}

export interface TodoFilter {
  searchText?: string;
  status?: 'all' | 'active' | 'completed';
  priority?: 'low' | 'medium' | 'high';
  tags?: string[]; // 添加标签过滤
}

export interface TodoState {
  todos: Todo[];
  tags: TagInfo[];
  filter: {
    status: 'all' | 'active' | 'completed';
    priority?: 'high' | 'medium' | 'low';
    searchText?: string;
    tags?: string[];
  };
  settings: {
    language: 'zh' | 'en';
    reminderEnabled: boolean;
    reminderLeadTime: number;
  };
}

export interface TagInfo {
  id: string;
  name: string;
  color: string;
  createAt: number;
}

export interface MessageResponse {
  success: boolean;
  error?: string;
}