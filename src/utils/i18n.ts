export type Locale = 'zh' | 'en';
type TranslationKey = string;
type TranslationValue = string;
type LocaleTranslations = Record<TranslationKey, TranslationValue>;
type Translations = Record<Locale, LocaleTranslations>;

export class I18n {
  private static instance: I18n;
  private translations: Translations;
  private currentLocale: Locale = 'zh';

  private defaultTranslations: Translations = {
    zh: {
      'app.title': '简单待办',
      'app.addTodo': '添加',
      'app.placeholder': '添加新的待办事项...',
      'filters.all': '全部',
      'filters.active': '进行中',
      'filters.completed': '已完成',
      'filters.search': '搜索...',
      'data.export': '导出数据',
      'data.import': '导入数据',
      'stats.total': '总计',
      'stats.active': '进行中',
      'stats.completed': '已完成',
      'stats.completionRate': '完成率',
      'tag.add': '添加新标签',
      'button.add': '添加',
      'button.edit': '编辑',
      'button.delete': '删除',
      'todo.createdAt': '创建于',
      'todo.dueDate': '截止',
      'todo.dueDateTime': '{year}年{month}月{day}日',
      'date.year': '年',
      'date.month': '月',
      'date.day': '日',
      'menu.theme': '切换主题',
      'menu.settings': '设置',
      'menu.import': '导入数据',
      'menu.export': '导出数据',
      'alerts.import.success': '数据导入成功',
      'alerts.import.error': '导入失败，请重试',
      'alerts.export.error': '导出失败，请重试',
      'todo.add': '添加任务',
      'todo.edit': '编辑任务',
      'todo.save': '保存',
      'todo.cancel': '取消',
      'todo.title': '标题',
      'todo.description': '描述（可选）',
      'todo.titlePlaceholder': '输入待办事项标题',
      'todo.descriptionPlaceholder': '添加详细描述...',
      'todo.titleRequired': '请输入任务标题',
      'todo.dueDateError': '截止日期不能早于当前时间',
      'todo.reminderTime': '提醒时间（可选）',
      'todo.noReminder': '不提醒',
      'todo.atDueTime': '截止时间时提醒',
      'todo.before15Min': '提前15分钟',
      'todo.before30Min': '提前30分钟',
      'todo.before1Hour': '提前1小时',
      'todo.before2Hours': '提前2小时',
      'todo.before1Day': '提前1天',
      'todo.customTime': '自定义...',
      'todo.customMinutes': '提前多少分钟提醒',
      'todo.saveError': '保存任务失败，请重试',
      'tags.title': '标签',
      'tags.selected': '个已选',
      'todo.overdue': '已逾期',
      'notifications.reminder': '待办事项提醒',
      'notifications.reminderMessage': '待办事项 "{title}" 即将到期',
      'notifications.completion': '任务完成',
      'notifications.completionMessage': '恭喜！你完成了任务：{title}',
      'tag.deleteError': '无法删除标签：正被待办事项使用',
      'tag.noTags': '暂无标签可选',
    },
    en: {
      'app.title': 'Easy Todo',
      'app.addTodo': 'Add',
      'app.placeholder': 'Add new todo...',
      'filters.all': 'All',
      'filters.active': 'Active',
      'filters.completed': 'Completed',
      'filters.search': 'Search...',
      'data.export': 'Export Data',
      'data.import': 'Import Data',
      'stats.total': 'Total',
      'stats.active': 'Active',
      'stats.completed': 'Completed',
      'stats.completionRate': 'Completion Rate',
      'tag.add': 'Add New Tag',
      'button.add': 'Add',
      'button.edit': 'Edit',
      'button.delete': 'Delete',
      'todo.createdAt': 'Created at',
      'todo.dueDate': 'Due',
      'todo.dueDateTime': '{month}/{day}/{year}',
      'date.year': 'Y',
      'date.month': 'M',
      'date.day': 'D',
      'menu.theme': 'Switch Theme',
      'menu.settings': 'Settings',
      'menu.import': 'Import Data',
      'menu.export': 'Export Data',
      'alerts.import.success': 'Data imported successfully',
      'alerts.import.error': 'Import failed, please try again',
      'alerts.export.error': 'Export failed, please try again',
      'todo.add': 'Add Task',
      'todo.edit': 'Edit Task',
      'todo.save': 'Save',
      'todo.cancel': 'Cancel',
      'todo.title': 'Title',
      'todo.description': 'Description (optional)',
      'todo.titlePlaceholder': 'Enter todo title',
      'todo.descriptionPlaceholder': 'Add details...',
      'todo.titleRequired': 'Please enter a title',
      'todo.dueDateError': 'Due date cannot be earlier than current time',
      'todo.reminderTime': 'Reminder Time (optional)',
      'todo.noReminder': 'No reminder',
      'todo.atDueTime': 'At due time',
      'todo.before15Min': '15 minutes before',
      'todo.before30Min': '30 minutes before',
      'todo.before1Hour': '1 hour before',
      'todo.before2Hours': '2 hours before',
      'todo.before1Day': '1 day before',
      'todo.customTime': 'Custom...',
      'todo.customMinutes': 'Minutes before due time',
      'todo.saveError': 'Failed to save task, please try again',
      'tags.title': 'Tags',
      'tags.selected': 'selected',
      'todo.overdue': 'Overdue',
      'notifications.reminder': 'Todo Reminder',
      'notifications.reminderMessage': 'Todo "{title}" is about to expire',
      'notifications.completion': 'Task Completed',
      'notifications.completionMessage': 'Congratulations! You completed: {title}',
      'tag.deleteError': 'Cannot delete tag: it is being used by todo items',
      'tag.noTags': 'No tags available',
    }
  };

  private constructor() {
    this.translations = this.defaultTranslations;
  }

  public static getInstance(): I18n {
    if (!I18n.instance) {
      I18n.instance = new I18n();
    }
    return I18n.instance;
  }

  async init(): Promise<void> {
    // 初始化时从 localStorage 读取上次保存的语言设置
    const savedLocale = localStorage.getItem('language') as Locale;
    if (savedLocale && this.defaultTranslations[savedLocale]) {
      this.currentLocale = savedLocale;
    }
    this.translations = this.defaultTranslations;
  }

  getCurrentLocale(): Locale {
    return this.currentLocale;
  }

  setLocale(locale: Locale): void {
    if (this.defaultTranslations[locale]) {
      this.currentLocale = locale;
      // 保存语言设置到 localStorage
      localStorage.setItem('language', locale);
      // 触发语言变更事件
      window.dispatchEvent(new CustomEvent('languageChange'));
    }
  }

  t(key: TranslationKey, params?: Record<string, string>): string {
    let message = this.translations[this.currentLocale]?.[key] || key;
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        message = message.replace(`{${key}}`, value);
      });
    }
    
    return message;
  }
}