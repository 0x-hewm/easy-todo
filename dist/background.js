/******/ (() => { // webpackBootstrap
/******/ 	"use strict";

;// ./src/utils/i18n.ts
class I18n {
    constructor() {
        this.currentLocale = 'zh';
        this.defaultTranslations = {
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
        this.translations = this.defaultTranslations;
    }
    static getInstance() {
        if (!I18n.instance) {
            I18n.instance = new I18n();
        }
        return I18n.instance;
    }
    async init() {
        // 初始化时从 localStorage 读取上次保存的语言设置
        const savedLocale = localStorage.getItem('language');
        if (savedLocale && this.defaultTranslations[savedLocale]) {
            this.currentLocale = savedLocale;
        }
        this.translations = this.defaultTranslations;
    }
    getCurrentLocale() {
        return this.currentLocale;
    }
    setLocale(locale) {
        if (this.defaultTranslations[locale]) {
            this.currentLocale = locale;
            // 保存语言设置到 localStorage
            localStorage.setItem('language', locale);
            // 触发语言变更事件
            window.dispatchEvent(new CustomEvent('languageChange'));
        }
    }
    t(key, params) {
        var _a;
        let message = ((_a = this.translations[this.currentLocale]) === null || _a === void 0 ? void 0 : _a[key]) || key;
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                message = message.replace(`{${key}}`, value);
            });
        }
        return message;
    }
}

;// ./src/services/NotificationService.ts

class NotificationService {
    static async requestPermission() {
        if (!('Notification' in window)) {
            console.warn('此浏览器不支持通知功能');
            return false;
        }
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }
    static async showNotification(title, message, options = {}) {
        try {
            // 尝试多种通知方式，确保至少有一种通知能够显示
            // 1. 首先尝试使用chrome.notifications API (扩展环境)
            if (typeof chrome !== 'undefined' && chrome.notifications) {
                await chrome.notifications.create({
                    type: 'basic',
                    iconUrl: chrome.runtime.getURL('assets/icons/icon48.webp'), // 使用WebP格式图标
                    title: title,
                    message: message,
                    requireInteraction: options.requireInteraction || false,
                    priority: 2
                });
                return;
            }
            // 2. 如果chrome.notifications不可用，退回到Web Notifications API
            if ('Notification' in window) {
                if (Notification.permission !== 'granted') {
                    const permission = await Notification.requestPermission();
                    if (permission !== 'granted') {
                        console.warn('通知权限未获得');
                        return;
                    }
                }
                new Notification(title, {
                    body: message,
                    icon: '/assets/icons/icon48.webp', // 使用WebP格式图标
                    requireInteraction: options.requireInteraction
                });
                return;
            }
            // 3. 如果通知API都不可用，使用alert作为后备选项
            console.log(`通知: ${title} - ${message}`);
        }
        catch (error) {
            console.error('显示通知失败:', error);
            // 打印通知信息到控制台，确保开发者能看到
            console.log(`通知内容(失败): ${title} - ${message}`);
        }
    }
    static async scheduleNotification(todo) {
        // 验证提醒数据的有效性
        if (!todo.id || !todo.title || !todo.dueDate || typeof todo.reminderLeadTime !== 'number') {
            let reason = "未知原因";
            if (!todo.id)
                reason = "缺少 ID";
            else if (!todo.title)
                reason = "缺少标题";
            else if (!todo.dueDate)
                reason = "缺少截止日期";
            else if (typeof todo.reminderLeadTime !== 'number')
                reason = "提醒时间格式错误";
            console.error(`无效的提醒数据 (${reason}):`, todo);
            throw new Error(`无效的提醒数据 (${reason})`);
        }
        try {
            if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
                try {
                    // 使用可靠的消息传递方式
                    const response = await new Promise((resolve, reject) => {
                        chrome.runtime.sendMessage({
                            type: 'SCHEDULE_NOTIFICATION',
                            payload: {
                                id: todo.id,
                                title: todo.title,
                                dueDate: todo.dueDate,
                                reminderLeadTime: todo.reminderLeadTime
                            }
                        }, (response) => {
                            if (chrome.runtime.lastError) {
                                reject(new Error(chrome.runtime.lastError.message || "消息发送失败"));
                            }
                            else {
                                resolve(response);
                            }
                        });
                    });
                    if (response && response.success) {
                        console.debug(`成功安排提醒: ${todo.title}`);
                        return;
                    }
                    throw new Error((response && response.error) || '安排提醒失败');
                }
                catch (error) {
                    console.warn('使用Chrome API安排提醒失败，将使用备用方法:', error);
                }
            }
            // 后备方法: 设置本地超时
            this._setupLocalReminder(todo);
        }
        catch (error) {
            console.error('安排提醒失败:', error);
            throw error;
        }
    }
    // 添加一个辅助方法处理本地提醒备份机制
    static _setupLocalReminder(todo) {
        // 确保dueDate和reminderLeadTime都存在
        if (todo.dueDate === undefined || todo.reminderLeadTime === undefined) {
            console.warn('无法设置本地提醒: 截止日期或提醒时间未定义');
            return;
        }
        const reminderTime = todo.dueDate - (todo.reminderLeadTime * 60 * 1000);
        const now = Date.now();
        // 如果提醒时间已经过去，直接显示通知
        if (reminderTime <= now) {
            this.showTodoReminder(todo.title, this.getReminderText(todo.reminderLeadTime));
            return;
        }
        // 为将来的提醒设置超时
        const timeoutId = setTimeout(() => {
            this.showTodoReminder(todo.title, this.getReminderText(todo.reminderLeadTime || 0));
        }, reminderTime - now);
        // 保存timeout ID以便于取消
        this._reminderTimeouts = this._reminderTimeouts || new Map();
        this._reminderTimeouts.set(todo.id, timeoutId);
        console.log(`已为 "${todo.title}" 设置本地提醒，提醒时间: ${new Date(reminderTime).toLocaleString()}`);
    }
    static async cancelNotification(todoId) {
        try {
            // 1. 尝试通过Chrome扩展API取消提醒
            if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
                try {
                    await new Promise((resolve) => {
                        chrome.runtime.sendMessage({
                            type: 'CANCEL_NOTIFICATION',
                            payload: { todoId }
                        }, resolve);
                    });
                }
                catch (error) {
                    console.warn('取消Chrome通知失败:', error);
                }
            }
            // 2. 取消本地设置的timeout
            if (this._reminderTimeouts && this._reminderTimeouts.has(todoId)) {
                const timeoutId = this._reminderTimeouts.get(todoId);
                if (timeoutId) {
                    clearTimeout(timeoutId);
                    this._reminderTimeouts.delete(todoId);
                    console.log(`已取消任务 ${todoId} 的提醒`);
                }
            }
        }
        catch (error) {
            console.warn('取消提醒失败:', error);
        }
    }
    static getReminderText(minutes) {
        if (minutes === 0)
            return '现在';
        if (minutes === 60)
            return '1小时后';
        if (minutes === 1440)
            return '1天后';
        if (minutes > 60)
            return `${Math.floor(minutes / 60)}小时${minutes % 60 ? minutes % 60 + '分钟' : ''}后`;
        return `${minutes}分钟后`;
    }
    static async showTodoReminder(title, timeText) {
        await this.showNotification('待办事项提醒', `${title} 将在${timeText}到期`, { requireInteraction: true });
    }
    static async showCompletionNotification(title) {
        await this.showNotification('任务完成', `恭喜！你完成了任务：${title}`, { requireInteraction: false });
    }
}
NotificationService.i18n = I18n.getInstance();
// 存储提醒timeout的Map
NotificationService._reminderTimeouts = new Map();

;// ./src/services/StorageService.ts
class StorageService {
    static async getState() {
        const result = await chrome.storage.local.get(this.STORAGE_KEY);
        return result[this.STORAGE_KEY] || {
            todos: [],
            tags: [], // 添加空标签数组作为默认值
            filter: { status: 'all' },
            settings: {
                language: 'zh',
                reminderEnabled: true,
                reminderLeadTime: 60 // 默认提前60分钟提醒
            }
        };
    }
    static async setState(state) {
        await chrome.storage.local.set({ [this.STORAGE_KEY]: state });
    }
    static async addTodo(todo) {
        const state = await this.getState();
        state.todos.push(todo);
        await this.setState(state);
    }
    static async updateTodo(todo) {
        const state = await this.getState();
        const index = state.todos.findIndex(t => t.id === todo.id);
        if (index !== -1) {
            state.todos[index] = todo;
            await this.setState(state);
        }
    }
    static async deleteTodo(todoId) {
        const state = await this.getState();
        state.todos = state.todos.filter(todo => todo.id !== todoId);
        await this.setState(state);
    }
    static async updateFilter(filter) {
        const state = await this.getState();
        state.filter = Object.assign(Object.assign({}, state.filter), filter);
        await this.setState(state);
    }
    static async updateSettings(settings) {
        const state = await this.getState();
        const defaultSettings = {
            language: 'zh',
            reminderEnabled: true,
            reminderLeadTime: 60
        };
        state.settings = Object.assign(Object.assign(Object.assign({}, defaultSettings), state.settings), settings);
        await this.setState(state);
    }
    // 导出数据
    static async exportData() {
        const state = await this.getState();
        const exportData = {
            version: '1.0',
            timestamp: Date.now(),
            data: state
        };
        return JSON.stringify(exportData, null, 2);
    }
    // 导入数据
    static async importData(jsonData) {
        try {
            const importedData = JSON.parse(jsonData);
            // 验证数据...
            await this.setState(importedData.data);
            // 在 Service Worker 中，直接返回成功
            return true;
        }
        catch (error) {
            console.error('Data import failed:', error);
            return false;
        }
    }
    // 清除所有数据
    static async clearAllData() {
        await chrome.storage.local.remove(this.STORAGE_KEY);
    }
}
StorageService.STORAGE_KEY = 'easy-todo-state';

;// ./src/services/TodoService.ts


class TodoService {
    static async createTodo(title, description, dueDate, tags = [], priority = 'medium', reminderLeadTime) {
        if (!title.trim()) {
            throw new Error('标题不能为空');
        }
        const todo = {
            id: crypto.randomUUID(),
            title: title.trim(),
            description: description === null || description === void 0 ? void 0 : description.trim(),
            dueDate,
            completed: false,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            priority,
            tags: tags || [],
            reminderLeadTime,
            reminded: false
        };
        // 验证截止日期
        if (todo.dueDate !== undefined && todo.dueDate < Date.now()) {
            throw new Error('截止日期不能早于当前时间');
        }
        // 创建提醒的逻辑优化
        if (todo.dueDate !== undefined && todo.reminderLeadTime !== undefined) {
            const reminderTime = todo.dueDate - (todo.reminderLeadTime * 60 * 1000);
            if (reminderTime < Date.now()) {
                throw new Error('提醒时间不能早于当前时间');
            }
            try {
                await NotificationService.scheduleNotification({
                    id: todo.id,
                    title: todo.title,
                    dueDate: todo.dueDate,
                    reminderLeadTime: todo.reminderLeadTime
                });
            }
            catch (error) {
                if (error instanceof Error) {
                    throw new Error(`设置提醒失败: ${error.message}`);
                }
                throw error;
            }
        }
        const state = await StorageService.getState();
        state.todos = [...state.todos, todo];
        await StorageService.setState(state);
        return todo;
    }
    static async getTodos(filter) {
        const state = await StorageService.getState();
        return state.todos.filter(todo => {
            var _a;
            // 状态过滤
            if (filter.status && filter.status !== 'all') {
                if (filter.status === 'active' && todo.completed)
                    return false;
                if (filter.status === 'completed' && !todo.completed)
                    return false;
            }
            // 优先级过滤
            if (filter.priority && todo.priority !== filter.priority)
                return false;
            // 标签过滤
            if (filter.tags && filter.tags.length > 0) {
                if (!filter.tags.some(tagId => todo.tags.includes(tagId)))
                    return false;
            }
            // 文本搜索
            if (filter.searchText) {
                const searchLower = filter.searchText.toLowerCase();
                const titleMatch = todo.title.toLowerCase().includes(searchLower);
                const descMatch = (_a = todo.description) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(searchLower);
                if (!titleMatch && !descMatch)
                    return false;
            }
            return true;
        });
    }
    static async getTodo(id) {
        const state = await StorageService.getState();
        return state.todos.find(todo => todo.id === id);
    }
    static async updateTodo(todoId, updates) {
        try {
            const state = await StorageService.getState();
            const todoIndex = state.todos.findIndex(t => t.id === todoId);
            if (todoIndex === -1) {
                throw new Error('任务不存在');
            }
            const updatedTodo = Object.assign(Object.assign(Object.assign({}, state.todos[todoIndex]), updates), { updatedAt: Date.now() });
            state.todos[todoIndex] = updatedTodo;
            await StorageService.setState(state);
            // 更新提醒
            if (updates.dueDate !== undefined || updates.reminderLeadTime !== undefined) {
                try {
                    await NotificationService.cancelNotification(todoId);
                    // 只有当dueDate和reminderLeadTime都存在时才设置提醒
                    if (updatedTodo.dueDate !== undefined &&
                        typeof updatedTodo.reminderLeadTime === 'number' &&
                        updatedTodo.reminderLeadTime >= 0) {
                        await NotificationService.scheduleNotification({
                            id: todoId,
                            title: updatedTodo.title,
                            dueDate: updatedTodo.dueDate,
                            reminderLeadTime: updatedTodo.reminderLeadTime
                        });
                    }
                    else {
                        console.debug(`未为任务 ${todoId} 设置提醒: 截止日期或提醒时间无效`);
                    }
                }
                catch (error) {
                    console.error(`更新任务 ${todoId} 的提醒失败:`, error);
                }
            }
        }
        catch (error) {
            console.error('更新任务失败:', error);
            throw error;
        }
    }
    static async deleteTodo(todoId) {
        await NotificationService.cancelNotification(todoId);
        const state = await StorageService.getState();
        state.todos = state.todos.filter(todo => todo.id !== todoId);
        await StorageService.setState(state);
    }
    static async toggleTodoStatus(todoId) {
        const state = await StorageService.getState();
        const todo = state.todos.find(t => t.id === todoId);
        if (!todo) {
            throw new Error('任务不存在');
        }
        todo.completed = !todo.completed;
        todo.updatedAt = Date.now();
        await StorageService.updateTodo(todo);
    }
    static async getStatistics() {
        const state = await StorageService.getState();
        const total = state.todos.length;
        const completed = state.todos.filter(todo => todo.completed).length;
        return {
            total,
            completed,
            active: total - completed
        };
    }
    static async getTodosByTag(tagId) {
        const state = await StorageService.getState();
        return state.todos.filter(todo => todo.tags.includes(tagId));
    }
    static async updateTodoTags(todoId, tags) {
        const state = await StorageService.getState();
        const todo = state.todos.find(t => t.id === todoId);
        if (!todo) {
            throw new Error('任务不存在');
        }
        todo.tags = tags;
        todo.updatedAt = Date.now();
        await StorageService.updateTodo(todo);
    }
    static async updateTodosOrder(todos) {
        const state = await StorageService.getState();
        state.todos = todos;
        await StorageService.setState(state);
    }
}

;// ./src/background.ts




// 检查待办事项到期提醒的时间间隔（1分钟）
const CHECK_INTERVAL = 60 * 1000;
// 检查待办事项是否需要提醒
async function checkTodoReminders() {
    var _a, _b, _c;
    const state = await StorageService.getState();
    const now = Date.now();
    for (const todo of state.todos) {
        if (!todo.completed && todo.dueDate && !todo.reminded) {
            const reminderLeadTime = (_c = (_a = todo.reminderLeadTime) !== null && _a !== void 0 ? _a : (_b = state.settings) === null || _b === void 0 ? void 0 : _b.reminderLeadTime) !== null && _c !== void 0 ? _c : 60;
            if (reminderLeadTime === undefined)
                continue;
            const reminderTime = todo.dueDate - (reminderLeadTime * 60 * 1000);
            // 如果到了提醒时间（允许1分钟的误差）
            if (Math.abs(now - reminderTime) <= CHECK_INTERVAL) {
                const reminderText = NotificationService.getReminderText(reminderLeadTime);
                NotificationService.showTodoReminder(todo.title, reminderText);
                // 标记为已提醒
                await TodoService.updateTodo(todo.id, Object.assign(Object.assign({}, todo), { reminded: true }));
            }
        }
    }
}
// 监听扩展安装事件
chrome.runtime.onInstalled.addListener(async () => {
    console.log('Easy Todo 扩展已安装');
    // 使用 Promise 包装通知权限检查
    const checkNotificationPermission = () => {
        return new Promise((resolve) => {
            chrome.notifications.getPermissionLevel(resolve);
        });
    };
    // 检查通知权限
    const permissionLevel = await checkNotificationPermission();
    console.log('通知权限状态:', permissionLevel);
});
// 设置图标点击事件
chrome.action.onClicked.addListener((tab) => {
    console.log('扩展图标被点击');
});
// 修改 StorageService 导入数据事件处理
if ('storage' in chrome) {
    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'local' && changes[StorageService.STORAGE_KEY]) {
            const newState = changes[StorageService.STORAGE_KEY].newValue;
            const oldState = changes[StorageService.STORAGE_KEY].oldValue;
            // 检查新完成的任务
            if ((newState === null || newState === void 0 ? void 0 : newState.todos) && (oldState === null || oldState === void 0 ? void 0 : oldState.todos)) {
                newState.todos.forEach((newTodo) => {
                    const oldTodo = oldState.todos.find(t => t.id === newTodo.id);
                    if (oldTodo && !oldTodo.completed && newTodo.completed) {
                        NotificationService.showCompletionNotification(newTodo.title);
                    }
                });
            }
        }
    });
}
// 改进 API 检查和初始化
let alarmsInitialized = false;
let initializationAttempts = 0;
const MAX_INIT_ATTEMPTS = 3;
const INIT_RETRY_DELAY = 1000; // 1秒
// 初始化 Alarms API
const initializeAlarms = async () => {
    if (alarmsInitialized)
        return true;
    if (initializationAttempts >= MAX_INIT_ATTEMPTS) {
        console.error('Alarms API 初始化失败次数过多');
        return false;
    }
    initializationAttempts++;
    console.debug(`尝试初始化 Alarms API (第 ${initializationAttempts} 次)...`);
    try {
        // 确保Chrome APIs已完全加载
        if (!(chrome === null || chrome === void 0 ? void 0 : chrome.alarms)) {
            throw new Error('Chrome Alarms API 不可用');
        }
        // 清理现有提醒
        const alarms = await chrome.alarms.getAll();
        console.debug('现有提醒数量:', alarms.length);
        await Promise.all(alarms
            .filter(alarm => alarm.name.startsWith('todo-'))
            .map(alarm => chrome.alarms.clear(alarm.name)));
        // 重新创建所有待办事项的提醒
        const state = await StorageService.getState();
        const now = Date.now();
        const activeReminders = state.todos.filter(todo => !todo.completed &&
            todo.dueDate !== undefined &&
            todo.reminderLeadTime !== undefined &&
            todo.dueDate > now);
        console.debug(`需要设置提醒的待办事项数量: ${activeReminders.length}`);
        for (const todo of activeReminders) {
            // 由于我们已经在filter中确保了dueDate和reminderLeadTime不是undefined
            // TypeScript仍然可能警告，所以这里使用非空断言
            const reminderTime = todo.dueDate - (todo.reminderLeadTime * 60 * 1000);
            if (reminderTime > now) {
                await chrome.alarms.create(`todo-${todo.id}`, {
                    when: reminderTime
                });
                console.debug(`已为待办事项 "${todo.title}" 创建提醒，时间: ${new Date(reminderTime).toLocaleString()}`);
            }
        }
        alarmsInitialized = true;
        console.debug('Alarms API 初始化成功');
        return true;
    }
    catch (error) {
        console.error('初始化 Alarms API 失败:', error);
        // 延迟后重试
        if (initializationAttempts < MAX_INIT_ATTEMPTS) {
            return new Promise(resolve => {
                setTimeout(() => {
                    initializeAlarms().then(resolve);
                }, INIT_RETRY_DELAY);
            });
        }
        return false;
    }
};
// 监听来自 popup 的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    (async () => {
        try {
            console.debug('收到消息:', message.type);
            // 确保 Alarms API 已初始化
            if (!alarmsInitialized) {
                const success = await initializeAlarms();
                if (!success) {
                    throw new Error('Alarms API 初始化失败');
                }
            }
            switch (message.type) {
                case 'SCHEDULE_NOTIFICATION': {
                    const { id, title, dueDate, reminderLeadTime } = message.payload;
                    console.debug('安排提醒:', { id, title, dueDate, reminderLeadTime });
                    if (!id || !dueDate || typeof reminderLeadTime !== 'number') {
                        throw new Error('无效的提醒数据');
                    }
                    await chrome.alarms.create(`todo-${id}`, {
                        when: dueDate - (reminderLeadTime * 60 * 1000)
                    });
                    sendResponse({ success: true });
                    break;
                }
                case 'CANCEL_NOTIFICATION': {
                    const { todoId } = message.payload;
                    if (!todoId) {
                        throw new Error('无效的待办事项 ID');
                    }
                    await chrome.alarms.clear(`todo-${todoId}`);
                    sendResponse({ success: true });
                    break;
                }
                default:
                    throw new Error('未知的消息类型');
            }
        }
        catch (error) {
            console.error('操作失败:', error);
            sendResponse({
                success: false,
                error: error instanceof Error ? error.message : '未知错误'
            });
        }
    })();
    return true; // 保持消息通道开放，允许异步响应
});
// 确保自动初始化
initializeAlarms().catch(error => {
    console.error('自动初始化 Alarms API 失败:', error);
});
// 添加 alarms 监听器
chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (!alarm.name.startsWith('todo-'))
        return;
    const todoId = alarm.name.replace('todo-', '');
    const todo = await TodoService.getTodo(todoId);
    if (!todo) {
        console.warn(`找不到ID为 ${todoId} 的待办事项，无法显示提醒`);
        return;
    }
    const i18n = I18n.getInstance();
    await NotificationService.showNotification(i18n.t('notifications.reminder') || '待办事项提醒', i18n.t('notifications.reminderMessage', { title: todo.title }) || `待办事项 "${todo.title}" 即将到期`, { requireInteraction: true });
    // 标记为已提醒
    await TodoService.updateTodo(todoId, { reminded: true });
});
// 定期检查提醒（作为备份机制）
setInterval(checkTodoReminders, CHECK_INTERVAL);
// 启动时立即检查一次
checkTodoReminders();

/******/ })()
;