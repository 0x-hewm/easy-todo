import { Todo, TagInfo } from '../types';
import { StorageService } from './StorageService';

export interface AnalyticsData {
  completionRate: number;
  tasksByPriority: Record<string, number>;
  tasksByTag: Record<string, number>;
  averageCompletionTime: number;
  tasksByDate: Record<string, number>;
  totalTasks: number;
  completedTasks: number;
  activeTasks: number;
}

export class AnalyticsService {
  static async getAnalytics(): Promise<AnalyticsData> {
    const state = await StorageService.getState();
    const todos = state.todos;

    return {
      ...this.calculateCompletionStats(todos),
      ...this.calculatePriorityStats(todos),
      ...this.calculateTagStats(todos),
      ...this.calculateTimeStats(todos),
      ...this.calculateDateStats(todos)
    };
  }

  private static calculateCompletionStats(todos: Todo[]) {
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;
    
    return {
      totalTasks: total,
      completedTasks: completed,
      activeTasks: total - completed,
      completionRate: total > 0 ? (completed / total) * 100 : 0
    };
  }

  private static calculatePriorityStats(todos: Todo[]) {
    const tasksByPriority: Record<string, number> = {
      high: 0,
      medium: 0,
      low: 0
    };

    todos.forEach(todo => {
      tasksByPriority[todo.priority]++;
    });

    return { tasksByPriority };
  }

  private static calculateTagStats(todos: Todo[]) {
    const tasksByTag: Record<string, number> = {};

    todos.forEach(todo => {
      todo.tags.forEach(tagId => {
        tasksByTag[tagId] = (tasksByTag[tagId] || 0) + 1;
      });
    });

    return { tasksByTag };
  }

  private static calculateTimeStats(todos: Todo[]) {
    const completedTodos = todos.filter(t => t.completed);
    
    const completionTimes = completedTodos.map(todo => 
      todo.updatedAt - todo.createdAt
    );

    const averageCompletionTime = completionTimes.length > 0
      ? completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length
      : 0;

    return { averageCompletionTime };
  }

  private static calculateDateStats(todos: Todo[]) {
    const tasksByDate: Record<string, number> = {};
    
    todos.forEach(todo => {
      const date = new Date(todo.createdAt).toISOString().split('T')[0];
      tasksByDate[date] = (tasksByDate[date] || 0) + 1;
    });

    return { tasksByDate };
  }
}
