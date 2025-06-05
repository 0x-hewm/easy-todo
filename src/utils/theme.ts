export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  warning: string;
  error: string;
}

export interface Theme {
  name: string;
  label: string;
  colors: ThemeColors;
}

export type ThemeName = 'light' | 'dark' | 'sepia' | 'ocean' | 'forest' | 'custom';

export class ThemeManager {
  private static instance: ThemeManager;
  private currentTheme: ThemeName = 'light';
  private customTheme: ThemeColors;
  private themes: Record<ThemeName, Theme>;

  public async loadTheme(): Promise<void> {
    const savedTheme = localStorage.getItem('theme');
    const customTheme = localStorage.getItem('customTheme');
    
    if (customTheme) {
      this.customTheme = JSON.parse(customTheme);
      if (savedTheme === 'custom') {
        this.themes.custom.colors = this.customTheme;
      }
    }

    if (savedTheme && savedTheme in this.themes) {
      this.currentTheme = savedTheme as ThemeName;
    } else {
      this.currentTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    this.applyTheme(this.currentTheme);
  }

  private constructor() {
    this.themes = {
      light: {
        name: 'light',
        label: '浅色',
        colors: {
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
        }
      },
      dark: {
        name: 'dark',
        label: '深色',
        colors: {
          primary: '#90caf9',
          secondary: '#82b1ff',
          background: '#121212',
          surface: '#1e1e1e',
          text: '#ffffff',
          textSecondary: '#b0bec5',
          border: '#424242',
          success: '#81c784',
          warning: '#ffb74d',
          error: '#e57373'
        }
      },
      sepia: {
        name: 'sepia',
        label: '护眼',
        colors: {
          primary: '#795548',
          secondary: '#8d6e63',
          background: '#f4ecd8',
          surface: '#e8dcca',
          text: '#3e2723',
          textSecondary: '#5d4037',
          border: '#d7ccc8',
          success: '#558b2f',
          warning: '#ef6c00',
          error: '#c62828'
        }
      },
      ocean: {
        name: 'ocean',
        label: '海洋',
        colors: {
          primary: '#006064',
          secondary: '#00838f',
          background: '#e0f7fa',
          surface: '#b2ebf2',
          text: '#004d40',
          textSecondary: '#00695c',
          border: '#80deea',
          success: '#00897b',
          warning: '#fb8c00',
          error: '#d32f2f'
        }
      },
      forest: {
        name: 'forest',
        label: '森林',
        colors: {
          primary: '#2e7d32',
          secondary: '#388e3c',
          background: '#e8f5e9',
          surface: '#c8e6c9',
          text: '#1b5e20',
          textSecondary: '#2e7d32',
          border: '#a5d6a7',
          success: '#43a047',
          warning: '#f57c00',
          error: '#c62828'
        }
      },
      custom: {
        name: 'custom',
        label: '自定义',
        colors: {
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
        }
      }
    };

    this.customTheme = this.themes.light.colors;
  }

  public static getInstance(): ThemeManager {
    if (!ThemeManager.instance) {
      ThemeManager.instance = new ThemeManager();
    }
    return ThemeManager.instance;
  }

  public getThemes(): Theme[] {
    return Object.values(this.themes);
  }

  public getCurrentTheme(): ThemeName {
    return this.currentTheme;
  }

  public getThemeColors(themeName: ThemeName): ThemeColors {
    return this.themes[themeName].colors;
  }

  public setTheme(themeName: ThemeName): void {
    if (!(themeName in this.themes)) {
      console.error(`主题 "${themeName}" 不存在`);
      return;
    }

    this.currentTheme = themeName;
    localStorage.setItem('theme', themeName);
    this.applyTheme(themeName);
  }

  public setCustomTheme(colors: Partial<ThemeColors>): void {
    // 检查颜色是否有效
    const validColors = this.validateColors({...this.themes.light.colors, ...colors});
    
    this.customTheme = { ...this.themes.light.colors, ...validColors };
    this.themes.custom.colors = this.customTheme;
    localStorage.setItem('customTheme', JSON.stringify(this.customTheme));
    
    if (this.currentTheme === 'custom') {
      this.applyTheme('custom');
    }
  }
  
  // 验证颜色是否满足可访问性要求
  private validateColors(colors: ThemeColors): ThemeColors {
    // 简单验证确保颜色格式正确
    const validateColor = (color: string) => {
      return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color) ? color : '#000000';
    };
    
    return {
      primary: validateColor(colors.primary),
      secondary: validateColor(colors.secondary),
      background: validateColor(colors.background),
      surface: validateColor(colors.surface),
      text: validateColor(colors.text),
      textSecondary: validateColor(colors.textSecondary),
      border: validateColor(colors.border),
      success: validateColor(colors.success),
      warning: validateColor(colors.warning),
      error: validateColor(colors.error)
    };
  }

  private applyTheme(themeName: ThemeName): void {
    const colors = this.themes[themeName].colors;
    const root = document.documentElement;

    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--${this.kebabCase(key)}-color`, value);
    });

    // 更新 meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', colors.primary);
    }

    // 设置数据属性用于样式选择器
    root.setAttribute('data-theme', themeName);
  }

  private kebabCase(str: string): string {
    return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
  }
}