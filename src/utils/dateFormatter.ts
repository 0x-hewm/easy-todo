import { I18n } from './i18n';

export class DateFormatter {
  private static i18n = I18n.getInstance();

  static formatDate(timestamp: number): string {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    if (this.i18n.getCurrentLocale() === 'zh') {
      return this.i18n.t('todo.dueDateTime', {
        year: year.toString(),
        month: month.toString(),
        day: day.toString()
      });
    }
    
    return `${year}/${month}/${day}`;
  }
}
