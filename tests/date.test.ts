/**
 * DateUtils 测试套件
 * 测试日期工具类的各种功能
 */

import { DateUtils } from '../src/utils/date';

describe('DateUtils', () => {
  beforeEach(() => {
    // 固定时间以确保测试的一致性
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2023-06-15T10:30:00Z')); // 固定为2023年6月15日
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('formatDate', () => {
    test('应该正确格式化时间戳为中文日期格式', () => {
      const timestamp = new Date('2023-06-15T14:30:00').getTime();
      const formatted = DateUtils.formatDate(timestamp);

      // 检查是否包含主要的日期组件
      expect(formatted).toContain('2023');
      expect(formatted).toContain('6');
      expect(formatted).toContain('15');
    });

    test('应该处理不同的时间戳', () => {
      const timestamp1 = new Date('2023-01-01T00:00:00').getTime();
      const timestamp2 = new Date('2023-12-31T23:59:59').getTime();

      const formatted1 = DateUtils.formatDate(timestamp1);
      const formatted2 = DateUtils.formatDate(timestamp2);

      expect(formatted1).toContain('2023');
      expect(formatted1).toContain('1');
      expect(formatted2).toContain('2023');
      expect(formatted2).toContain('12');
    });

    test('应该处理历史时间戳', () => {
      const timestamp = new Date('2020-03-15T12:00:00').getTime();
      const formatted = DateUtils.formatDate(timestamp);

      expect(formatted).toContain('2020');
      expect(formatted).toContain('3');
      expect(formatted).toContain('15');
    });

    test('应该返回非空字符串', () => {
      const timestamp = new Date('2025-09-20T16:45:00').getTime();
      const formatted = DateUtils.formatDate(timestamp);

      expect(formatted).toBeTruthy();
      expect(typeof formatted).toBe('string');
    });
  });

  describe('isToday', () => {
    test('应该正确识别今天的时间戳', () => {
      // 使用当前日期的不同时间
      const now = new Date();
      const todayMorning = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        6,
        0,
        0
      ).getTime();
      const todayNoon = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        12,
        0,
        0
      ).getTime();
      const todayEvening = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        20,
        0,
        0
      ).getTime();

      expect(DateUtils.isToday(todayMorning)).toBe(true);
      expect(DateUtils.isToday(todayNoon)).toBe(true);
      expect(DateUtils.isToday(todayEvening)).toBe(true);
    });

    test('应该正确识别不是今天的时间戳', () => {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      expect(DateUtils.isToday(yesterday.getTime())).toBe(false);
      expect(DateUtils.isToday(tomorrow.getTime())).toBe(false);
    });

    test('应该处理边界情况', () => {
      // 今天开始时刻
      const now = new Date();
      const startOfToday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        0,
        0,
        0
      ).getTime();
      // 今天结束时刻
      const endOfToday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        23,
        59,
        59
      ).getTime();

      expect(DateUtils.isToday(startOfToday)).toBe(true);
      expect(DateUtils.isToday(endOfToday)).toBe(true);
    });
  });

  describe('getDaysUntil', () => {
    test('应该计算到未来日期的天数', () => {
      const tomorrow = new Date('2023-06-16T10:30:00Z').getTime();
      const nextWeek = new Date('2023-06-22T10:30:00Z').getTime();
      const nextMonth = new Date('2023-07-15T10:30:00Z').getTime();

      expect(DateUtils.getDaysUntil(tomorrow)).toBe(1);
      expect(DateUtils.getDaysUntil(nextWeek)).toBe(7);
      expect(DateUtils.getDaysUntil(nextMonth)).toBe(30);
    });

    test('应该为过去的日期返回负数', () => {
      const yesterday = new Date('2023-06-14T10:30:00Z').getTime();
      const lastWeek = new Date('2023-06-08T10:30:00Z').getTime();
      const lastMonth = new Date('2023-05-15T10:30:00Z').getTime();

      expect(DateUtils.getDaysUntil(yesterday)).toBe(-1);
      expect(DateUtils.getDaysUntil(lastWeek)).toBe(-7);
      expect(DateUtils.getDaysUntil(lastMonth)).toBe(-31);
    });

    test('应该为今天返回0或1', () => {
      const now = new Date('2023-06-15T10:30:00Z').getTime();
      const laterToday = new Date('2023-06-15T20:00:00Z').getTime();
      const earlierToday = new Date('2023-06-15T06:00:00Z').getTime();

      // 由于使用了Math.ceil，同一天的时间可能返回0或1
      const daysUntilNow = DateUtils.getDaysUntil(now);
      const daysUntilLater = DateUtils.getDaysUntil(laterToday);
      const daysUntilEarlier = DateUtils.getDaysUntil(earlierToday);

      expect(daysUntilNow).toBeGreaterThanOrEqual(0);
      expect(daysUntilNow).toBeLessThanOrEqual(1);
      expect(daysUntilLater).toBeGreaterThanOrEqual(0);
      expect(daysUntilLater).toBeLessThanOrEqual(1);
      expect(daysUntilEarlier).toBeGreaterThanOrEqual(-1);
      expect(daysUntilEarlier).toBeLessThanOrEqual(1);
    });

    test('应该处理精确的24小时差', () => {
      const exactly24HoursLater = new Date('2023-06-16T10:30:00Z').getTime();
      const exactly48HoursLater = new Date('2023-06-17T10:30:00Z').getTime();

      expect(DateUtils.getDaysUntil(exactly24HoursLater)).toBe(1);
      expect(DateUtils.getDaysUntil(exactly48HoursLater)).toBe(2);
    });

    test('应该处理跨月份的计算', () => {
      // 从6月15日到7月1日
      const nextMonth = new Date('2023-07-01T10:30:00Z').getTime();
      expect(DateUtils.getDaysUntil(nextMonth)).toBe(16);

      // 从6月15日到5月1日（过去）
      const lastMonth = new Date('2023-05-01T10:30:00Z').getTime();
      expect(DateUtils.getDaysUntil(lastMonth)).toBe(-45);
    });

    test('应该处理跨年份的计算', () => {
      // 从2023年6月15日到2024年6月15日
      const nextYear = new Date('2024-06-15T10:30:00Z').getTime();
      expect(DateUtils.getDaysUntil(nextYear)).toBe(366); // 2024是闰年

      // 从2023年6月15日到2022年6月15日（过去）
      const lastYear = new Date('2022-06-15T10:30:00Z').getTime();
      expect(DateUtils.getDaysUntil(lastYear)).toBe(-365);
    });
  });

  describe('边界条件和错误处理', () => {
    test('应该处理无效的时间戳', () => {
      // 注意：JavaScript的Date构造函数对大多数数值都会产生有效的日期
      // 这里测试一些极端情况
      const veryLargeTimestamp = Number.MAX_SAFE_INTEGER;
      const verySmallTimestamp = 0;

      expect(() => DateUtils.formatDate(veryLargeTimestamp)).not.toThrow();
      expect(() => DateUtils.formatDate(verySmallTimestamp)).not.toThrow();
      expect(() => DateUtils.isToday(veryLargeTimestamp)).not.toThrow();
      expect(() => DateUtils.isToday(verySmallTimestamp)).not.toThrow();
      expect(() => DateUtils.getDaysUntil(veryLargeTimestamp)).not.toThrow();
      expect(() => DateUtils.getDaysUntil(verySmallTimestamp)).not.toThrow();
    });

    test('应该处理负时间戳', () => {
      const negativeTimestamp = -1000000000000; // 负时间戳

      expect(() => DateUtils.formatDate(negativeTimestamp)).not.toThrow();
      expect(() => DateUtils.isToday(negativeTimestamp)).not.toThrow();
      expect(() => DateUtils.getDaysUntil(negativeTimestamp)).not.toThrow();

      expect(DateUtils.isToday(negativeTimestamp)).toBe(false);
      expect(DateUtils.getDaysUntil(negativeTimestamp)).toBeLessThan(0);
    });
  });
});
