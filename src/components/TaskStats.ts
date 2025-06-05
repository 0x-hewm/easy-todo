import { I18n } from '../utils/i18n';

export class TaskStats extends HTMLElement {
  private stats: { total: number; completed: number; active: number } = {
    total: 0,
    completed: 0,
    active: 0
  };
  private i18n = I18n.getInstance();

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  static get observedAttributes() {
    return ['data-stats'];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (name === 'data-stats') {
      this.stats = JSON.parse(newValue);
      this.render();
    }
  }

  private render() {
    if (!this.shadowRoot) return;

    const style = `
      <style>
        :host {
          display: block;
          padding: 12px;
          background: var(--background-color);
          border-radius: 8px;
          margin: 8px 0;
        }
        .stats {
          display: flex;
          justify-content: space-around;
          text-align: center;
        }
        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .stat-value {
          font-size: 24px;
          font-weight: bold;
          color: var(--primary-color);
          margin-bottom: 4px;
        }
        .stat-label {
          font-size: 12px;
          color: var(--text-color);
        }
        .completion-rate {
          text-align: center;
          margin-top: 12px;
          font-size: 14px;
          color: var(--text-color);
        }
        .progress-bar {
          height: 4px;
          background: var(--border-color);
          border-radius: 2px;
          margin-top: 8px;
          overflow: hidden;
        }
        .progress {
          height: 100%;
          background: var(--primary-color);
          transition: width 0.3s ease;
        }
      </style>
    `;

    const completionRate = this.stats.total > 0
      ? Math.round((this.stats.completed / this.stats.total) * 100)
      : 0;

    this.shadowRoot.innerHTML = `
      ${style}
      <div class="stats">
        <div class="stat-item">
          <div class="stat-value">${this.stats.total}</div>
          <div class="stat-label">${this.i18n.t('stats.total')}</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${this.stats.active}</div>
          <div class="stat-label">${this.i18n.t('stats.active')}</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${this.stats.completed}</div>
          <div class="stat-label">${this.i18n.t('stats.completed')}</div>
        </div>
      </div>
      <div class="completion-rate">
        ${this.i18n.t('stats.completionRate')}: ${completionRate}%
        <div class="progress-bar">
          <div class="progress" style="width: ${completionRate}%"></div>
        </div>
      </div>
    `;
  }
}

customElements.define('task-stats', TaskStats);