import { DateFormatter } from '../src/utils/dateFormatter';
import { I18n } from '../src/utils/i18n';

// Mock I18n
jest.mock('../src/utils/i18n');

describe('DateFormatter', () => {
  let mockI18n: jest.Mocked<Pick<I18n, 'getCurrentLocale' | 't'>>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock instance with only the methods we need
    mockI18n = {
      getCurrentLocale: jest.fn(),
      t: jest.fn(),
    };

    // Mock I18n.getInstance to return our mock
    (I18n.getInstance as jest.Mock).mockReturnValue(mockI18n);

    // Reset the static i18n field in DateFormatter
    (DateFormatter as any).i18n = mockI18n;
  });

  describe('formatDate', () => {
    it('should format date in Chinese locale using i18n translation', () => {
      mockI18n.getCurrentLocale.mockReturnValue('zh');
      mockI18n.t.mockReturnValue('2023年12月25日');

      const timestamp = new Date('2023-12-25').getTime();
      const result = DateFormatter.formatDate(timestamp);

      expect(mockI18n.getCurrentLocale).toHaveBeenCalled();
      expect(mockI18n.t).toHaveBeenCalledWith('todo.dueDateTime', {
        year: '2023',
        month: '12',
        day: '25',
      });
      expect(result).toBe('2023年12月25日');
    });

    it('should format date in non-Chinese locale with simple format', () => {
      mockI18n.getCurrentLocale.mockReturnValue('en');

      const timestamp = new Date('2023-12-25').getTime();
      const result = DateFormatter.formatDate(timestamp);

      expect(mockI18n.getCurrentLocale).toHaveBeenCalled();
      expect(mockI18n.t).not.toHaveBeenCalled();
      expect(result).toBe('2023/12/25');
    });

    it('should handle edge case dates correctly', () => {
      mockI18n.getCurrentLocale.mockReturnValue('en');

      // Test January 1st
      const jan1 = new Date('2023-01-01').getTime();
      expect(DateFormatter.formatDate(jan1)).toBe('2023/1/1');

      // Test December 31st
      const dec31 = new Date('2023-12-31').getTime();
      expect(DateFormatter.formatDate(dec31)).toBe('2023/12/31');

      // Test leap year February 29th
      const feb29 = new Date('2024-02-29').getTime();
      expect(DateFormatter.formatDate(feb29)).toBe('2024/2/29');
    });

    it('should handle single digit months and days', () => {
      mockI18n.getCurrentLocale.mockReturnValue('en');

      const timestamp = new Date('2023-01-05').getTime();
      const result = DateFormatter.formatDate(timestamp);

      expect(result).toBe('2023/1/5');
    });

    it('should handle double digit months and days', () => {
      mockI18n.getCurrentLocale.mockReturnValue('en');

      const timestamp = new Date('2023-11-15').getTime();
      const result = DateFormatter.formatDate(timestamp);

      expect(result).toBe('2023/11/15');
    });

    it('should format Chinese locale with correct translation parameters', () => {
      mockI18n.getCurrentLocale.mockReturnValue('zh');
      mockI18n.t.mockReturnValue('2023年1月5日');

      const timestamp = new Date('2023-01-05').getTime();
      const result = DateFormatter.formatDate(timestamp);

      expect(mockI18n.t).toHaveBeenCalledWith('todo.dueDateTime', {
        year: '2023',
        month: '1',
        day: '5',
      });
      expect(result).toBe('2023年1月5日');
    });

    it('should handle different years correctly', () => {
      mockI18n.getCurrentLocale.mockReturnValue('en');

      // Test different years
      const year2020 = new Date('2020-06-15').getTime();
      expect(DateFormatter.formatDate(year2020)).toBe('2020/6/15');

      const year2025 = new Date('2025-06-15').getTime();
      expect(DateFormatter.formatDate(year2025)).toBe('2025/6/15');
    });

    it('should handle timezone considerations', () => {
      mockI18n.getCurrentLocale.mockReturnValue('en');

      // Use a specific UTC timestamp
      const utcTimestamp = Date.UTC(2023, 11, 25, 12, 0, 0); // December 25, 2023 12:00 UTC
      const result = DateFormatter.formatDate(utcTimestamp);

      // The result will depend on the local timezone, but should be consistent
      expect(result).toMatch(/^\d{4}\/\d{1,2}\/\d{1,2}$/);
    });

    it('should handle invalid dates gracefully', () => {
      mockI18n.getCurrentLocale.mockReturnValue('en');

      // Test with NaN timestamp
      const result = DateFormatter.formatDate(NaN);

      expect(result).toMatch(/NaN/);
    });

    it('should call i18n methods correctly for Chinese locale', () => {
      mockI18n.getCurrentLocale.mockReturnValue('zh');
      mockI18n.t.mockReturnValue('测试日期');

      const timestamp = new Date('2023-06-15').getTime();
      DateFormatter.formatDate(timestamp);

      expect(mockI18n.getCurrentLocale).toHaveBeenCalledTimes(1);
      expect(mockI18n.t).toHaveBeenCalledTimes(1);
      expect(mockI18n.t).toHaveBeenCalledWith('todo.dueDateTime', {
        year: '2023',
        month: '6',
        day: '15',
      });
    });

    it('should not call i18n.t for non-Chinese locales', () => {
      mockI18n.getCurrentLocale.mockReturnValue('en'); // Valid locale

      const timestamp = new Date('2023-06-15').getTime();
      const result = DateFormatter.formatDate(timestamp);

      expect(mockI18n.getCurrentLocale).toHaveBeenCalledTimes(1);
      expect(mockI18n.t).not.toHaveBeenCalled();
      expect(result).toBe('2023/6/15');
    });

    it('should handle locale switching scenarios', () => {
      // First call with Chinese locale
      mockI18n.getCurrentLocale.mockReturnValueOnce('zh');
      mockI18n.t.mockReturnValueOnce('2023年6月15日');

      const timestamp = new Date('2023-06-15').getTime();
      const result1 = DateFormatter.formatDate(timestamp);

      expect(result1).toBe('2023年6月15日');

      // Second call with English locale
      mockI18n.getCurrentLocale.mockReturnValueOnce('en');

      const result2 = DateFormatter.formatDate(timestamp);

      expect(result2).toBe('2023/6/15');
    });
  });

  describe('static initialization', () => {
    it('should use i18n instance for formatting', () => {
      mockI18n.getCurrentLocale.mockReturnValue('en');

      const result = DateFormatter.formatDate(Date.now());

      // Verify that our mock was used
      expect(mockI18n.getCurrentLocale).toHaveBeenCalled();
      expect(result).toMatch(/^\d{4}\/\d{1,2}\/\d{1,2}$/);
    });
  });
});
