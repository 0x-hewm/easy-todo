export class ThemeSelector {
    private container: HTMLElement;
    private currentTheme: string;
    private themes = [
        { id: 'light', name: '浅色' },
        { id: 'dark', name: '深色' },
        { id: 'sepia', name: '护眼' },
        { id: 'ocean', name: '海洋' },
        { id: 'forest', name: '森林' }
    ];

    constructor(container: HTMLElement) {
        this.container = container;
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.init();
        this.applyTheme(this.currentTheme);
    }

    private init(): void {
        const select = document.createElement('select');
        select.className = 'theme-selector';
        select.setAttribute('aria-label', '选择主题');

        this.themes.forEach(theme => {
            const option = document.createElement('option');
            option.value = theme.id;
            option.textContent = theme.name;
            option.selected = theme.id === this.currentTheme;
            select.appendChild(option);
        });

        select.addEventListener('change', (e) => {
            const target = e.target as HTMLSelectElement;
            this.applyTheme(target.value);
        });

        const label = document.createElement('label');
        label.textContent = '主题：';
        label.appendChild(select);

        this.container.appendChild(label);
    }

    private applyTheme(themeId: string): void {
        document.documentElement.setAttribute('data-theme', themeId);
        localStorage.setItem('theme', themeId);
        this.currentTheme = themeId;

        // 触发主题变更事件
        const event = new CustomEvent('themeChanged', { 
            detail: { theme: themeId } 
        });
        document.dispatchEvent(event);
    }

    public getCurrentTheme(): string {
        return this.currentTheme;
    }
}