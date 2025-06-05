import { AnalyticsService, AnalyticsData } from '../services/AnalyticsService';
import { NotificationService } from '../services/NotificationService';

export class AnalyticsView extends HTMLElement {
  private data: AnalyticsData | null = null;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.loadData();
  }

  private async loadData() {
    try {
      this.data = await AnalyticsService.getAnalytics();
      this.render();
    } catch (error) {
      console.error('加载统计数据失败:', error);
      NotificationService.showNotification(
        '错误',
        '加载统计数据失败',
        { requireInteraction: false }
      );
    }
  }

  private render() {
    if (!this.data) return;

    const style = `
      <style>
        :host {
          display: block;
          padding: 16px;
          background: var(--surface-color);
          border-radius: 8px;
          box-shadow: var(--shadow-md);
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }
        .stat-card {
          padding: 16px;
          background: var(--background-color);
          border-radius: 4px;
          text-align: center;
        }
        .stat-value {
          font-size: 24px;
          font-weight: bold;
          color: var(--primary-color);
        }
        .stat-label {
          font-size: 14px;
          color: var(--text-secondary-color);
        }
        .chart-container {
          margin-top: 16px;
          height: 200px;
        }
      </style>
    `;

    const stats = [
      {
        label: '总任务数',
        value: this.data.totalTasks
      },
      {
        label: '完成率',
        value: `${Math.round(this.data.completionRate)}%`
      },
      {
        label: '进行中',
        value: this.data.activeTasks
      },
      {
        label: '已完成',
        value: this.data.completedTasks
      }
    ];

    const statsHtml = stats.map(stat => `
      <div class="stat-card">
        <div class="stat-value">${stat.value}</div>
        <div class="stat-label">${stat.label}</div>
      </div>
    `).join('');

    this.shadowRoot!.innerHTML = `
      ${style}
      <div class="stats-grid">
        ${statsHtml}
      </div>
      <div class="chart-container">
        <!-- 这里可以添加图表库来展示更详细的数据 -->
      </div>
      <button onclick="this.getRootNode().host.refresh()">
        刷新数据
      </button>
    `;
  }

  refresh() {
    this.loadData();
  }
}

customElements.define('analytics-view', AnalyticsView);
