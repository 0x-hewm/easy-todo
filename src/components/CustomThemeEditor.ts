export class CustomThemeEditor extends HTMLElement {
  private colors: Record<string, string> = {};

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.colors = {
      primary: '#2196f3',
      secondary: '#03a9f4',
      background: '#ffffff',
      surface: '#f5f5f5',
      text: '#212121',
      textSecondary: '#757575',
      border: '#e0e0e0',
      success: '#4caf50',
      warning: '#ff9800',
      error: '#f44336'
    };
    this.render();
  }

  private render() {
    const style = `
      <style>
        :host {
          display: block;
          padding: 16px;
        }
        .color-inputs {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 12px;
        }
        .color-input {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        label {
          flex: 1;
          font-size: 14px;
          color: var(--text-color);
        }
        input[type="color"] {
          width: 50px;
          height: 30px;
          padding: 0;
          border: 1px solid var(--border-color);
          border-radius: 4px;
        }
        .actions {
          margin-top: 16px;
          text-align: right;
        }
        button {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          background: var(--primary-color);
          color: white;
        }
      </style>
    `;

    const colorInputs = Object.entries(this.colors)
      .map(([key, value]) => `
        <div class="color-input">
          <label>${this.formatLabel(key)}</label>
          <input type="color" 
                 value="${value}"
                 data-key="${key}"
                 title="${this.formatLabel(key)}">
        </div>
      `).join('');

    this.shadowRoot!.innerHTML = `
      ${style}
      <div class="color-inputs">
        ${colorInputs}
      </div>
      <div class="actions">
        <button id="saveTheme">保存主题</button>
      </div>
    `;

    this.setupListeners();
  }

  private setupListeners() {
    const inputs = this.shadowRoot!.querySelectorAll('input[type="color"]');
    inputs.forEach(input => {
      input.addEventListener('change', (e) => {
        const target = e.target as HTMLInputElement;
        const key = target.dataset.key as string;
        this.colors[key] = target.value;
      });
    });

    const saveButton = this.shadowRoot!.querySelector('#saveTheme');
    saveButton?.addEventListener('click', () => {
      const event = new CustomEvent('themeChange', {
        detail: { colors: this.colors },
        bubbles: true,
        composed: true
      });
      this.dispatchEvent(event);
    });
  }

  private formatLabel(key: string): string {
    return key.replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase());
  }

  public setColors(colors: Record<string, string>) {
    this.colors = { ...this.colors, ...colors };
    this.render();
  }
}

customElements.define('custom-theme-editor', CustomThemeEditor);
