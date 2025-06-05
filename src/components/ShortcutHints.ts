import { KeyboardService } from '../services/KeyboardService';

export class ShortcutHints extends HTMLElement {
  private keyboardService: KeyboardService;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.keyboardService = KeyboardService.getInstance();
  }

  connectedCallback() {
    this.render();
  }

  private render() {
    if (!this.shadowRoot) return;

    const shortcuts = this.keyboardService.getShortcuts();
    const shortcutListHtml = Object.entries(shortcuts)
      .map(([action, shortcut]) => {
        const description = this.keyboardService.getShortcutDescription(action);
        return `<li class="shortcut-item">
          <span class="shortcut-desc">${shortcut.description}</span>
          <kbd class="shortcut-key">${description.split(' (')[0]}</kbd>
        </li>`;
      })
      .join('');

    const style = `
      <style>
        :host {
          display: block;
          margin: 8px 0;
        }
        .shortcuts-container {
          background: var(--background-color);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          padding: 8px;
        }
        .shortcuts-title {
          font-size: 14px;
          color: var(--text-color);
          margin: 0 0 8px 0;
        }
        .shortcuts-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 8px;
        }
        .shortcut-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 4px 8px;
          background: rgba(0, 0, 0, 0.03);
          border-radius: 4px;
        }
        .shortcut-desc {
          font-size: 12px;
          color: var(--text-color);
        }
        kbd {
          background: var(--background-color);
          border: 1px solid var(--border-color);
          border-radius: 3px;
          padding: 2px 4px;
          font-size: 11px;
          color: var(--text-color);
          box-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
        }
        .theme-dark kbd {
          background: rgba(255, 255, 255, 0.1);
        }
        @media (max-width: 450px) {
          .shortcuts-list {
            grid-template-columns: 1fr;
          }
        }
      </style>
    `;

    this.shadowRoot.innerHTML = `
      ${style}
      <div class="shortcuts-container">
        <h3 class="shortcuts-title">键盘快捷键</h3>
        <ul class="shortcuts-list">
          ${shortcutListHtml}
        </ul>
      </div>
    `;
  }
}

customElements.define('shortcut-hints', ShortcutHints);