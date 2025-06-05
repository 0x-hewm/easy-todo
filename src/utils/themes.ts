export const themes = {
  light: {
    colors: {
      primary: '#4A90E2',
      background: '#FFFFFF',
      text: '#333333',
      border: '#E0E0E0',
      success: '#4CAF50',
      warning: '#FFC107',
      error: '#F44336'
    }
  },
  dark: {
    colors: {
      primary: '#64B5F6',
      background: '#1E1E1E',
      text: '#FFFFFF',
      border: '#424242',
      success: '#81C784',
      warning: '#FFD54F',
      error: '#E57373'
    }
  }
};

export type ThemeMode = 'light' | 'dark';
export type ThemeColors = typeof themes.light.colors;
