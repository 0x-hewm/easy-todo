/******/ (() => { // webpackBootstrap
/******/ 	"use strict";

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

;// ./src/services/TagService.ts


class TagService {
    static async getAllTags() {
        const state = await StorageService.getState();
        return state.tags || [];
    }
    static async createTag(name, color) {
        var _a;
        const state = await StorageService.getState();
        const existingTag = (_a = state.tags) === null || _a === void 0 ? void 0 : _a.find(tag => tag.name === name);
        if (existingTag) {
            throw new Error('标签已存在');
        }
        const newTag = {
            id: crypto.randomUUID(),
            name,
            color: color || this.getNextColor(state.tags || []), // 使用传入的颜色或默认颜色
            createAt: Date.now()
        };
        state.tags = [...(state.tags || []), newTag];
        await StorageService.setState(state);
        return newTag;
    }
    static async updateTag(tagId, updates) {
        var _a, _b, _c;
        const state = await StorageService.getState();
        const tagIndex = (_b = (_a = state.tags) === null || _a === void 0 ? void 0 : _a.findIndex(tag => tag.id === tagId)) !== null && _b !== void 0 ? _b : -1;
        if (tagIndex === -1) {
            throw new Error('标签不存在');
        }
        if (updates.name && ((_c = state.tags) === null || _c === void 0 ? void 0 : _c.some(tag => tag.name === updates.name && tag.id !== tagId))) {
            throw new Error('标签名称已存在');
        }
        const updatedTag = Object.assign(Object.assign(Object.assign({}, state.tags[tagIndex]), updates), { id: tagId // 确保 ID 不被修改
         });
        state.tags[tagIndex] = updatedTag;
        await StorageService.setState(state);
        return updatedTag;
    }
    static async deleteTag(tagId) {
        var _a;
        const state = await StorageService.getState();
        // 检查标签是否被任务使用
        const taggedTodos = state.todos.filter(todo => todo.tags.includes(tagId));
        // 如果有任务使用此标签，禁止删除
        if (taggedTodos.length > 0) {
            throw new Error(`标签已被${taggedTodos.length}个待办事项使用，删除后可能导致筛选问题`);
        }
        // 从标签列表中删除
        state.tags = ((_a = state.tags) === null || _a === void 0 ? void 0 : _a.filter(tag => tag.id !== tagId)) || [];
        await StorageService.setState(state);
    }
    static async addTagToTodo(todoId, tagId) {
        var _a;
        const state = await StorageService.getState();
        const todo = state.todos.find(t => t.id === todoId);
        if (!todo) {
            throw new Error('任务不存在');
        }
        if (!((_a = state.tags) === null || _a === void 0 ? void 0 : _a.some(tag => tag.id === tagId))) {
            throw new Error('标签不存在');
        }
        if (!todo.tags.includes(tagId)) {
            todo.tags.push(tagId);
            await StorageService.updateTodo(todo);
        }
    }
    static async removeTagFromTodo(todoId, tagId) {
        const state = await StorageService.getState();
        const todo = state.todos.find(t => t.id === todoId);
        if (!todo) {
            throw new Error('任务不存在');
        }
        todo.tags = todo.tags.filter(id => id !== tagId);
        await StorageService.updateTodo(todo);
    }
    // 添加一个方法检查是否有标签
    static async hasAnyTags() {
        const tags = await this.getAllTags();
        return tags.length > 0;
    }
    // 添加一个方法检查某个标签是否被使用
    static async isTagUsed(tagId) {
        const state = await StorageService.getState();
        const taggedTodos = state.todos.filter(todo => todo.tags.includes(tagId));
        return { used: taggedTodos.length > 0, count: taggedTodos.length };
    }
    static getNextColor(existingTags) {
        const usedColors = new Set(existingTags.map(tag => tag.color));
        const availableColor = this.DEFAULT_COLORS.find(color => !usedColors.has(color));
        return availableColor || this.DEFAULT_COLORS[Math.floor(Math.random() * this.DEFAULT_COLORS.length)];
    }
}
TagService.DEFAULT_COLORS = [
    '#4a90e2', // 蓝色
    '#27ae60', // 绿色
    '#e74c3c', // 红色
    '#f1c40f', // 黄色
    '#9b59b6', // 紫色
    '#e67e22', // 橙色
    '#1abc9c', // 青色
    '#34495e' // 深灰色
];
TagService.i18n = I18n.getInstance();

;// ./src/utils/theme.ts
class ThemeManager {
    async loadTheme() {
        const savedTheme = localStorage.getItem('theme');
        const customTheme = localStorage.getItem('customTheme');
        if (customTheme) {
            this.customTheme = JSON.parse(customTheme);
            if (savedTheme === 'custom') {
                this.themes.custom.colors = this.customTheme;
            }
        }
        if (savedTheme && savedTheme in this.themes) {
            this.currentTheme = savedTheme;
        }
        else {
            this.currentTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        this.applyTheme(this.currentTheme);
    }
    constructor() {
        this.currentTheme = 'light';
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
    static getInstance() {
        if (!ThemeManager.instance) {
            ThemeManager.instance = new ThemeManager();
        }
        return ThemeManager.instance;
    }
    getThemes() {
        return Object.values(this.themes);
    }
    getCurrentTheme() {
        return this.currentTheme;
    }
    getThemeColors(themeName) {
        return this.themes[themeName].colors;
    }
    setTheme(themeName) {
        if (!(themeName in this.themes)) {
            console.error(`主题 "${themeName}" 不存在`);
            return;
        }
        this.currentTheme = themeName;
        localStorage.setItem('theme', themeName);
        this.applyTheme(themeName);
    }
    setCustomTheme(colors) {
        // 检查颜色是否有效
        const validColors = this.validateColors(Object.assign(Object.assign({}, this.themes.light.colors), colors));
        this.customTheme = Object.assign(Object.assign({}, this.themes.light.colors), validColors);
        this.themes.custom.colors = this.customTheme;
        localStorage.setItem('customTheme', JSON.stringify(this.customTheme));
        if (this.currentTheme === 'custom') {
            this.applyTheme('custom');
        }
    }
    // 验证颜色是否满足可访问性要求
    validateColors(colors) {
        // 简单验证确保颜色格式正确
        const validateColor = (color) => {
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
    applyTheme(themeName) {
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
    kebabCase(str) {
        return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
    }
}

;// ./src/components/TaskForm.ts


class TaskForm extends HTMLElement {
    constructor() {
        super();
        this.form = null;
        this.tags = [];
        this.selectedTagIds = [];
        this.currentTodoId = null;
        this.i18n = I18n.getInstance();
        this.attachShadow({ mode: 'open' });
    }
    async connectedCallback() {
        await this.loadTags();
        this.render();
        this.setupListeners();
    }
    async loadTags() {
        try {
            this.tags = await TagService.getAllTags();
        }
        catch (error) {
            console.error('加载标签失败:', error);
        }
    }
    render() {
        if (!this.shadowRoot)
            return;
        const now = new Date();
        const minDateTime = now.toISOString().slice(0, 16);
        const formTitle = this.currentTodoId ? this.i18n.t('todo.edit') : this.i18n.t('todo.add');
        const saveButtonText = this.currentTodoId ? this.i18n.t('todo.save') : this.i18n.t('todo.add');
        const style = `
      <style>
        :host {
          display: block;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.6);
          z-index: 1000;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 16px;
          box-sizing: border-box;
        }
        .task-form {
          width: 90%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
          background: var(--background-color);
          padding: 24px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          animation: slide-up 0.3s ease;
        }
        @keyframes slide-up {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .form-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 12px;
        }
        .form-title {
          font-size: 20px;
          font-weight: 600;
          color: var(--primary-color);
          margin: 0;
        }
        .input-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 8px;
        }
        label {
          font-size: 14px;
          font-weight: 500;
          color: var(--text-color);
        }
        input, textarea, select {
          padding: 10px 12px;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          font-size: 14px;
          transition: all 0.2s;
          background: var(--surface-color);
          color: var(--text-color);
        }
        textarea {
          resize: vertical;
          min-height: 100px;
        }
        input[type="datetime-local"] {
          appearance: none;
          -webkit-appearance: none;
          background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="gray" viewBox="0 0 16 16"><path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5z"/></svg>');
          background-repeat: no-repeat;
          background-position: right 10px center;
          background-size: 16px;
          padding-right: 32px;
          cursor: pointer;
          font-family: inherit;
        }
        input[type="datetime-local"]:focus {
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.15);
          outline: none;
        }
        .form-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 16px;
          border-top: 1px solid var(--border-color);
          padding-top: 16px;
        }
        button {
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s;
        }
        .submit-btn {
          background: var(--primary-color);
          color: white;
        }
        .submit-btn:hover {
          background: #1976d2;
          transform: translateY(-1px);
        }
        .cancel-btn {
          background: #f5f5f5;
          color: #666;
        }
        .cancel-btn:hover {
          background: #e0e0e0;
        }
        .tag-selector {
          margin: 8px 0;
        }
        .tag-list {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          padding: 12px;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          min-height: 50px;
        }
        .tag-item {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 20px;
          cursor: pointer;
          user-select: none;
          transition: all 0.2s ease;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .tag-item.selected {
          transform: scale(1.05);
          box-shadow: 0 0 0 2px var(--primary-color), 0 2px 4px rgba(0,0,0,0.1);
        }
        .tag-label {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }
        .selected-count {
          font-size: 12px;
          color: var(--text-secondary-color);
          background: var(--surface-color);
          padding: 2px 8px;
          border-radius: 12px;
        }
        .error-message {
          color: #f44336;
          font-size: 12px;
          margin-top: 4px;
          display: none;
        }
        .input-group.error input,
        .input-group.error textarea,
        .input-group.error select {
          border-color: #f44336;
        }
        .input-group.error .error-message {
          display: block;
        }
      </style>
    `;
        this.shadowRoot.innerHTML = `
      ${style}
      <form class="task-form" novalidate>
        <div class="form-header">
          <h2 class="form-title">${formTitle}</h2>
        </div>
        <div class="input-group">
          <label for="title">${this.i18n.t('todo.title')}</label>
          <input type="text" id="title" name="title" required placeholder="${this.i18n.t('todo.titlePlaceholder')}">
          <div class="error-message">${this.i18n.t('todo.titleRequired')}</div>
        </div>
        <div class="input-group">
          <label for="description">${this.i18n.t('todo.description')}</label>
          <textarea id="description" name="description" placeholder="${this.i18n.t('todo.descriptionPlaceholder')}"></textarea>
        </div>
        <div class="input-group">
          <label for="dueDate">${this.i18n.t('todo.dueDate')}</label>
          <input type="datetime-local" 
                 id="dueDate" 
                 name="dueDate"
                 min="${minDateTime}">
          <div class="error-message">${this.i18n.t('todo.dueDateError')}</div>
        </div>
        <div class="input-group">
          <label for="reminderTime">${this.i18n.t('todo.reminderTime')}</label>
          <select id="reminderTime" name="reminderTime">
            <option value="">${this.i18n.t('todo.noReminder')}</option>
            <option value="0">${this.i18n.t('todo.atDueTime')}</option>
            <option value="15">${this.i18n.t('todo.before15Min')}</option>
            <option value="30">${this.i18n.t('todo.before30Min')}</option>
            <option value="60" selected>${this.i18n.t('todo.before1Hour')}</option>
            <option value="120">${this.i18n.t('todo.before2Hours')}</option>
            <option value="1440">${this.i18n.t('todo.before1Day')}</option>
            <option value="custom">${this.i18n.t('todo.customTime')}</option>
          </select>
          <div id="customReminderInput" style="display: none; margin-top: 8px;">
            <input type="number" name="customMinutes" min="1" placeholder="${this.i18n.t('todo.customMinutes')}">
          </div>
        </div>
        <div class="input-group">
          <div class="tag-label">
            <label>${this.i18n.t('tags.title')}</label>
            <span class="selected-count">${this.selectedTagIds.length} ${this.i18n.t('tags.selected')}</span>
          </div>
          <div class="tag-selector">
            <div id="tagList" class="tag-list"></div>
          </div>
        </div>
        <div class="form-footer">
          <button type="button" class="cancel-btn">${this.i18n.t('todo.cancel')}</button>
          <button type="submit" class="submit-btn">${saveButtonText}</button>
        </div>
      </form>
    `;
        this.renderTags();
        this.form = this.shadowRoot.querySelector('form');
        const reminderSelect = this.shadowRoot.querySelector('#reminderTime');
        const customReminderInput = this.shadowRoot.querySelector('#customReminderInput');
        reminderSelect.addEventListener('change', () => {
            customReminderInput.style.display =
                reminderSelect.value === 'custom' ? 'block' : 'none';
        });
    }
    async renderTags() {
        const tagList = this.shadowRoot.querySelector('#tagList');
        if (!tagList)
            return;
        if (this.tags.length === 0) {
            tagList.innerHTML = '<div class="empty-message">暂无可用标签</div>';
            return;
        }
        tagList.innerHTML = this.tags.map(tag => `
      <div class="tag-item ${this.selectedTagIds.includes(tag.id) ? 'selected' : ''}"
           data-tag-id="${tag.id}"
           style="background-color: ${tag.color}; color: white;">
        ${tag.name}
      </div>
    `).join('');
        this.setupTagListeners();
    }
    setupListeners() {
        if (!this.form)
            return;
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(this.form);
            const title = formData.get('title');
            if (!title.trim()) {
                alert('标题不能为空');
                return;
            }
            const dueDate = formData.get('dueDate');
            let dueDateTimestamp = undefined;
            if (dueDate) {
                try {
                    const [datePart, timePart] = dueDate.split('T');
                    if (!datePart || !timePart) {
                        alert('日期格式无效');
                        return;
                    }
                    const [year, month, day] = datePart.split('-').map(Number);
                    const [hours, minutes] = timePart.split(':').map(Number);
                    if (!year || !month || !day || hours === undefined || minutes === undefined) {
                        alert('日期或时间格式无效');
                        return;
                    }
                    const selectedDate = new Date(year, month - 1, day, hours, minutes);
                    const now = Date.now();
                    if (selectedDate.getTime() < now) {
                        alert('截止时间不能早于当前时间');
                        return;
                    }
                    dueDateTimestamp = selectedDate.getTime();
                }
                catch (error) {
                    console.error('日期解析错误:', error);
                    alert('日期格式无效');
                    return;
                }
            }
            // 确保选中提醒时间时，截止日期也已设置
            let reminderLeadTime = this.getReminderTime(formData);
            if (reminderLeadTime !== undefined && dueDateTimestamp === undefined) {
                alert('设置提醒时必须设置截止时间');
                return;
            }
            const todo = {
                id: this.currentTodoId || undefined,
                title: title.trim(),
                description: (formData.get('description') || '').trim(),
                priority: formData.get('priority') || 'medium',
                dueDate: dueDateTimestamp,
                tags: this.selectedTagIds,
                reminderLeadTime
            };
            const event = new CustomEvent('todoSubmit', {
                detail: todo,
                bubbles: true,
                composed: true
            });
            this.dispatchEvent(event);
        });
        const cancelBtn = this.shadowRoot.querySelector('.cancel-btn');
        cancelBtn === null || cancelBtn === void 0 ? void 0 : cancelBtn.addEventListener('click', () => {
            const event = new CustomEvent('formCancel', {
                bubbles: true,
                composed: true
            });
            this.dispatchEvent(event);
        });
        this.addEventListener('requestFormData', () => {
            if (!this.form)
                return;
            const formData = new FormData(this.form);
            const todoData = {
                title: formData.get('title'),
                description: formData.get('description'),
                tags: this.selectedTagIds,
                dueDate: formData.get('dueDate'),
                reminderLeadTime: this.getReminderTime(formData)
            };
            const event = new CustomEvent('formDataResponse', {
                detail: todoData,
                bubbles: true,
                composed: true
            });
            this.dispatchEvent(event);
        });
    }
    getReminderTime(formData) {
        const reminderType = formData.get('reminderType');
        if (!reminderType || reminderType === 'none')
            return undefined;
        switch (reminderType) {
            case 'atTime': return 0;
            case '15min': return 15;
            case '30min': return 30;
            case '1hour': return 60;
            case '2hours': return 120;
            case '1day': return 1440;
            case 'custom':
                const customMinutes = formData.get('customMinutes');
                return customMinutes ? parseInt(customMinutes, 10) : undefined;
            default:
                return undefined;
        }
    }
    setupTagListeners() {
        this.shadowRoot.querySelectorAll('.tag-item').forEach(tag => {
            tag.addEventListener('click', (e) => {
                const tagId = e.currentTarget.dataset.tagId;
                if (!tagId)
                    return;
                const index = this.selectedTagIds.indexOf(tagId);
                if (index === -1) {
                    this.selectedTagIds.push(tagId);
                }
                else {
                    this.selectedTagIds.splice(index, 1);
                }
                this.renderTags();
                const event = new CustomEvent('tagsChange', {
                    detail: { selectedTags: this.selectedTagIds },
                    bubbles: true,
                    composed: true
                });
                this.dispatchEvent(event);
            });
        });
    }
    setFormData(todo) {
        var _a, _b;
        if (!this.form)
            return;
        this.currentTodoId = todo.id || null;
        const titleInput = this.form.querySelector('#title');
        titleInput.value = todo.title || '';
        const descriptionInput = this.form.querySelector('#description');
        const dueDateInput = this.form.querySelector('#dueDate');
        if (todo.description)
            descriptionInput.value = todo.description;
        // 安全地处理dueDate
        if (todo.dueDate !== undefined && todo.dueDate !== null) {
            const date = new Date(todo.dueDate);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const dateTimeStr = `${year}-${month}-${day}T${hours}:${minutes}`;
            dueDateInput.value = dateTimeStr;
        }
        else {
            dueDateInput.value = '';
        }
        if (todo.tags) {
            this.selectedTagIds = [...todo.tags];
            this.renderTags();
        }
        const reminderSelect = this.form.querySelector('#reminderTime');
        const customReminderInput = this.form.querySelector('input[name="customMinutes"]');
        if (todo.reminderLeadTime !== undefined) {
            const standardTimes = [0, 15, 30, 60, 120, 1440];
            if (standardTimes.includes(todo.reminderLeadTime)) {
                reminderSelect.value = todo.reminderLeadTime.toString();
            }
            else {
                reminderSelect.value = 'custom';
                customReminderInput.value = todo.reminderLeadTime.toString();
                (_b = (_a = this.shadowRoot) === null || _a === void 0 ? void 0 : _a.querySelector('#customReminderInput')) === null || _b === void 0 ? void 0 : _b.setAttribute('style', 'display: block');
            }
        }
        const formTitle = this.shadowRoot.querySelector('.form-title');
        const submitBtn = this.form.querySelector('.submit-btn');
        formTitle.textContent = this.currentTodoId ? this.i18n.t('todo.edit') : this.i18n.t('todo.add');
        submitBtn.textContent = this.currentTodoId ? this.i18n.t('todo.save') : this.i18n.t('todo.add');
    }
    reset() {
        if (!this.form)
            return;
        this.form.reset();
        this.selectedTagIds = [];
        this.currentTodoId = null; // 重置任务 ID
        const submitBtn = this.form.querySelector('.submit-btn');
        submitBtn.textContent = '添加';
        this.renderTags();
    }
    async refresh() {
        await this.loadTags();
        await this.renderTags();
    }
}
customElements.define('task-form', TaskForm);

;// ./src/components/TaskItem.ts


class TaskItem extends HTMLElement {
    constructor() {
        super();
        this.todo = {
            id: '',
            title: '',
            completed: false,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            priority: 'medium',
            tags: [],
            reminded: false
        };
        this.tags = [];
        this.i18n = I18n.getInstance();
        this.attachShadow({ mode: 'open' });
    }
    static get observedAttributes() {
        return ['data-todo'];
    }
    connectedCallback() {
        this.loadTags();
    }
    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'data-todo') {
            this.todo = JSON.parse(newValue);
            this.loadTags();
        }
    }
    async loadTags() {
        if (!this.todo)
            return;
        try {
            const allTags = await TagService.getAllTags();
            this.tags = allTags.filter(tag => this.todo.tags.includes(tag.id));
            this.render();
        }
        catch (error) {
            console.error('加载标签失败:', error);
        }
    }
    formatDateTime(timestamp) {
        const date = new Date(timestamp);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        return this.i18n.t('todo.dueDateTime', {
            year: year.toString(),
            month: month.toString(),
            day: day.toString()
        });
    }
    render() {
        if (!this.shadowRoot || !this.todo)
            return;
        const style = `
      <style>
        :host {
          display: block;
          margin: 8px 0;
        }
        .todo-item {
          display: flex;
          flex-direction: column;
          padding: 16px;
          background: var(--surface-color);
          border-radius: var(--border-radius-md);
          box-shadow: var(--shadow-sm);
          transition: all var(--transition-normal);
        }
        .todo-item:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }
        .todo-item.completed {
          opacity: 0.8;
          background: var(--surface-color);
          border-left: none;
        }
        .priority-high { 
          border-left: 4px solid var(--error-color); 
          background-image: linear-gradient(to right, rgba(244, 67, 54, 0.05), transparent);
        }
        .priority-medium { 
          border-left: 4px solid var(--warning-color); 
          background-image: linear-gradient(to right, rgba(255, 152, 0, 0.05), transparent);
        }
        .priority-low { 
          border-left: 4px solid var(--success-color); 
          background-image: linear-gradient(to right, rgba(76, 175, 80, 0.05), transparent);
        }
        .todo-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
        }
        .checkbox {
          margin: 0;
          width: 20px;
          height: 20px;
          accent-color: var(--primary-color);
          cursor: pointer;
        }
        .content {
          flex: 1;
        }
        .title {
          margin: 0;
          font-size: 16px;
          color: var(--text-color);
          font-weight: 500;
        }
        .completed .title {
          text-decoration: line-through;
          opacity: 0.7;
        }
        .description {
          margin: 6px 0 0;
          font-size: 14px;
          color: var(--text-secondary-color);
          line-height: 1.4;
        }
        .meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 12px;
          font-size: 12px;
          color: var(--text-secondary-color);
        }
        .tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 10px;
        }
        .tag {
          padding: 3px 8px;
          border-radius: 12px;
          font-size: 11px;
          color: white;
          font-weight: 500;
          box-shadow: var(--shadow-sm);
        }
        .actions {
          display: flex;
          gap: 8px;
        }
        button {
          padding: 6px 10px;
          border: none;
          border-radius: var(--border-radius-sm);
          cursor: pointer;
          font-size: 12px;
          font-weight: 500;
          transition: all var(--transition-fast);
        }
        .delete-btn {
          background: var(--error-color);
          color: white;
        }
        .delete-btn:hover {
          background: #d32f2f;
        }
        .edit-btn {
          background: var(--primary-color);
          color: white;
        }
        .edit-btn:hover {
          background: #1976d2;
        }
        .due-date {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-weight: 500;
        }
        .overdue {
          color: var(--error-color);
        }
      </style>
    `;
        const now = Date.now();
        const isOverdue = this.todo.dueDate !== undefined &&
            this.todo.dueDate < now &&
            !this.todo.completed;
        const tagsHtml = this.tags.map(tag => `
      <span class="tag" style="background-color: ${tag.color}">${tag.name}</span>
    `).join('');
        this.shadowRoot.innerHTML = `
      ${style}
      <div class="todo-item priority-${this.todo.priority} ${this.todo.completed ? 'completed' : ''}">
        <div class="todo-header">
          <input type="checkbox" class="checkbox" ${this.todo.completed ? 'checked' : ''}>
          <div class="content">
            <h3 class="title">${this.todo.title}</h3>
            ${this.todo.description ? `<p class="description">${this.todo.description}</p>` : ''}
          </div>
          <div class="actions">
            <button class="edit-btn">${this.i18n.t('button.edit')}</button>
            <button class="delete-btn">${this.i18n.t('button.delete')}</button>
          </div>
        </div>
        ${this.tags.length > 0 ? `<div class="tags">${tagsHtml}</div>` : ''}
        <div class="meta">
          <span>${this.i18n.t('todo.createdAt')} ${this.formatDateTime(this.todo.createdAt)}</span>
          ${this.todo.dueDate !== undefined ? `
            <span class="due-date ${isOverdue ? 'overdue' : ''}">
              ${this.i18n.t('todo.dueDate')} ${this.formatDateTime(this.todo.dueDate)}
              ${isOverdue ? ` (${this.i18n.t('todo.overdue')})` : ''}
            </span>` : ''}
        </div>
      </div>
    `;
        this.addEventListeners();
    }
    addEventListeners() {
        if (!this.shadowRoot)
            return;
        const checkbox = this.shadowRoot.querySelector('.checkbox');
        const deleteBtn = this.shadowRoot.querySelector('.delete-btn');
        const editBtn = this.shadowRoot.querySelector('.edit-btn');
        checkbox === null || checkbox === void 0 ? void 0 : checkbox.addEventListener('change', () => {
            const event = new CustomEvent('todoToggle', {
                detail: { id: this.todo.id },
                bubbles: true,
                composed: true
            });
            this.dispatchEvent(event);
        });
        deleteBtn === null || deleteBtn === void 0 ? void 0 : deleteBtn.addEventListener('click', () => {
            const event = new CustomEvent('todoDelete', {
                detail: { id: this.todo.id },
                bubbles: true,
                composed: true
            });
            this.dispatchEvent(event);
        });
        editBtn === null || editBtn === void 0 ? void 0 : editBtn.addEventListener('click', () => {
            const event = new CustomEvent('todoEdit', {
                detail: { todo: this.todo },
                bubbles: true,
                composed: true
            });
            this.dispatchEvent(event);
        });
    }
}
customElements.define('task-item', TaskItem);

;// ./src/components/TaskList.ts

class TaskList extends HTMLElement {
    constructor() {
        super();
        this.todos = [];
        this.draggedTodo = null;
        this.attachShadow({ mode: 'open' });
    }
    static get observedAttributes() {
        return ['data-todos'];
    }
    connectedCallback() {
        this.render();
    }
    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'data-todos') {
            this.todos = JSON.parse(newValue);
            this.render();
        }
    }
    render() {
        if (!this.shadowRoot)
            return;
        const style = `
      <style>
        :host {
          display: block;
          margin: 16px 0;
        }
        .empty-state {
          text-align: center;
          padding: 40px 20px;
          color: var(--text-secondary-color);
          background: var(--surface-color);
          border-radius: var(--border-radius-md);
          box-shadow: var(--shadow-sm);
          font-size: 16px;
          animation: fadeIn var(--transition-normal);
        }
        .empty-icon {
          font-size: 48px;
          margin-bottom: 16px;
          opacity: 0.6;
        }
        .task-item {
          margin: 12px 0;
          cursor: move;
          transition: transform 0.3s ease, opacity 0.3s ease;
          animation: slideIn var(--transition-normal);
        }
        .task-item.dragging {
          opacity: 0.6;
          transform: scale(0.98) rotate(1deg);
          box-shadow: var(--shadow-lg);
          z-index: 10;
        }
        .drop-target {
          border: 2px dashed var(--primary-color);
          border-radius: var(--border-radius-md);
          margin: 8px 0;
          height: 4px;
          transition: height 0.3s ease, background-color 0.3s ease;
        }
        .drop-target.active {
          height: 60px;
          background: rgba(var(--primary-rgb), 0.1);
        }
        .task-list {
          min-height: 100px;
        }
        
        @keyframes slideIn {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      </style>
    `;
        const todoElements = this.todos.map((todo, index) => `
      <div class="task-item" 
           draggable="true"
           data-todo-id="${todo.id}"
           data-index="${index}"
           style="animation-delay: ${index * 0.05}s">
        <task-item data-todo='${JSON.stringify(todo)}'></task-item>
      </div>
    `).join('');
        this.shadowRoot.innerHTML = `
      ${style}
      <div class="task-list">
        ${this.todos.length === 0
            ? `<div class="empty-state">
               <div class="empty-icon">📝</div>
               <p>暂无待办事项</p>
               <p>创建一个新的待办事项开始吧!</p>
             </div>`
            : todoElements}
      </div>
    `;
        this.setupDragAndDrop();
        this.setupEventListeners();
    }
    setupDragAndDrop() {
        const taskItems = this.shadowRoot.querySelectorAll('.task-item');
        taskItems.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                const target = e.target;
                target.classList.add('dragging');
                this.draggedTodo = this.todos[Number(target.dataset.index)];
                e.dataTransfer.effectAllowed = 'move';
            });
            item.addEventListener('dragend', (e) => {
                const target = e.target;
                target.classList.remove('dragging');
                this.draggedTodo = null;
                this.removeDragTargets();
            });
            item.addEventListener('dragover', (e) => {
                e.preventDefault();
                const target = e.currentTarget;
                if (this.draggedTodo && this.draggedTodo.id !== target.dataset.todoId) {
                    this.showDropTarget(target);
                }
            });
            item.addEventListener('drop', (e) => {
                e.preventDefault();
                const dropTarget = e.currentTarget;
                const dropIndex = Number(dropTarget.dataset.index);
                if (this.draggedTodo) {
                    const dragIndex = this.todos.findIndex(t => t.id === this.draggedTodo.id);
                    if (dragIndex !== dropIndex) {
                        this.reorderTodos(dragIndex, dropIndex);
                    }
                }
            });
        });
    }
    showDropTarget(target) {
        this.removeDragTargets();
        const dropTarget = document.createElement('div');
        dropTarget.className = 'drop-target active';
        target.parentNode.insertBefore(dropTarget, target);
    }
    removeDragTargets() {
        this.shadowRoot.querySelectorAll('.drop-target').forEach(el => el.remove());
    }
    async reorderTodos(fromIndex, toIndex) {
        const newTodos = [...this.todos];
        const [movedTodo] = newTodos.splice(fromIndex, 1);
        newTodos.splice(toIndex, 0, movedTodo);
        // 触发重排序事件
        const event = new CustomEvent('todoReorder', {
            detail: { todos: newTodos },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(event);
    }
    setupEventListeners() {
        this.shadowRoot.querySelectorAll('task-item').forEach(item => {
            item.addEventListener('todoToggle', (e) => {
                const event = new CustomEvent('todoToggle', {
                    detail: e.detail,
                    bubbles: true,
                    composed: true
                });
                this.dispatchEvent(event);
            });
            item.addEventListener('todoDelete', (e) => {
                const event = new CustomEvent('todoDelete', {
                    detail: e.detail,
                    bubbles: true,
                    composed: true
                });
                this.dispatchEvent(event);
            });
            item.addEventListener('todoEdit', (e) => {
                const event = new CustomEvent('todoEdit', {
                    detail: e.detail,
                    bubbles: true,
                    composed: true
                });
                this.dispatchEvent(event);
            });
        });
    }
}
customElements.define('task-list', TaskList);

;// ./src/components/TaskStats.ts

class TaskStats extends HTMLElement {
    constructor() {
        super();
        this.stats = {
            total: 0,
            completed: 0,
            active: 0
        };
        this.i18n = I18n.getInstance();
        this.attachShadow({ mode: 'open' });
    }
    static get observedAttributes() {
        return ['data-stats'];
    }
    connectedCallback() {
        this.render();
    }
    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'data-stats') {
            this.stats = JSON.parse(newValue);
            this.render();
        }
    }
    render() {
        if (!this.shadowRoot)
            return;
        const style = `
      <style>
        :host {
          display: block;
          padding: 12px;
          background: var(--background-color);
          border-radius: 8px;
          margin: 8px 0;
        }
        .stats {
          display: flex;
          justify-content: space-around;
          text-align: center;
        }
        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .stat-value {
          font-size: 24px;
          font-weight: bold;
          color: var(--primary-color);
          margin-bottom: 4px;
        }
        .stat-label {
          font-size: 12px;
          color: var(--text-color);
        }
        .completion-rate {
          text-align: center;
          margin-top: 12px;
          font-size: 14px;
          color: var(--text-color);
        }
        .progress-bar {
          height: 4px;
          background: var(--border-color);
          border-radius: 2px;
          margin-top: 8px;
          overflow: hidden;
        }
        .progress {
          height: 100%;
          background: var(--primary-color);
          transition: width 0.3s ease;
        }
      </style>
    `;
        const completionRate = this.stats.total > 0
            ? Math.round((this.stats.completed / this.stats.total) * 100)
            : 0;
        this.shadowRoot.innerHTML = `
      ${style}
      <div class="stats">
        <div class="stat-item">
          <div class="stat-value">${this.stats.total}</div>
          <div class="stat-label">${this.i18n.t('stats.total')}</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${this.stats.active}</div>
          <div class="stat-label">${this.i18n.t('stats.active')}</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${this.stats.completed}</div>
          <div class="stat-label">${this.i18n.t('stats.completed')}</div>
        </div>
      </div>
      <div class="completion-rate">
        ${this.i18n.t('stats.completionRate')}: ${completionRate}%
        <div class="progress-bar">
          <div class="progress" style="width: ${completionRate}%"></div>
        </div>
      </div>
    `;
    }
}
customElements.define('task-stats', TaskStats);

;// ./src/components/TagManager.ts


class TagManager extends HTMLElement {
    constructor() {
        super();
        this.tags = [];
        this.selectedTags = [];
        this.i18n = I18n.getInstance();
        this.attachShadow({ mode: 'open' });
    }
    static get observedAttributes() {
        return ['data-selected-tags'];
    }
    connectedCallback() {
        this.loadTags();
    }
    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'data-selected-tags') {
            this.selectedTags = JSON.parse(newValue || '[]');
            this.render();
        }
    }
    async loadTags() {
        try {
            this.tags = await TagService.getAllTags();
            this.render();
        }
        catch (error) {
            console.error('加载标签失败:', error);
        }
    }
    async createTag(name, color) {
        try {
            await TagService.createTag(name, color);
            await this.loadTags();
            this.dispatchEvent(new CustomEvent('tagsChange'));
        }
        catch (error) {
            console.error('创建标签失败:', error);
            alert(error instanceof Error ? error.message : '创建标签失败');
        }
    }
    renderErrorMessage(message) {
        var _a, _b;
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        errorElement.style.cssText = `
      color: var(--error-color);
      padding: 8px 12px;
      margin: 8px 0;
      background: rgba(244, 67, 54, 0.1);
      border-left: 3px solid var(--error-color);
      border-radius: var(--border-radius-sm);
    `;
        // 添加到DOM
        const container = (_a = this.shadowRoot) === null || _a === void 0 ? void 0 : _a.querySelector('.tag-container');
        if (container) {
            // 先删除任何现有错误消息
            const existingError = (_b = this.shadowRoot) === null || _b === void 0 ? void 0 : _b.querySelector('.error-message');
            if (existingError) {
                existingError.remove();
            }
            container.insertAdjacentElement('afterend', errorElement);
            // 设置定时器自动移除错误消息
            setTimeout(() => {
                errorElement.style.opacity = '0';
                errorElement.style.transition = 'opacity 0.5s ease';
                setTimeout(() => errorElement.remove(), 500);
            }, 5000);
        }
    }
    async deleteTag(tagId) {
        try {
            // 先检查标签是否被使用
            const tagInfo = await TagService.isTagUsed(tagId);
            if (tagInfo.used) {
                const message = `无法删除标签：此标签正被${tagInfo.count}个待办事项使用，删除后可能导致筛选问题`;
                this.renderErrorMessage(message);
                return;
            }
            if (!confirm('确定要删除这个标签吗？'))
                return;
            await TagService.deleteTag(tagId);
            await this.loadTags();
            this.dispatchEvent(new CustomEvent('tagsChange'));
        }
        catch (error) {
            console.error('删除标签失败:', error);
            const message = error instanceof Error ? error.message : '删除标签失败';
            this.renderErrorMessage(message);
        }
    }
    handleTagClick(tagId) {
        const event = new CustomEvent('tagSelect', {
            detail: { tagId },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(event);
    }
    render() {
        if (!this.shadowRoot)
            return;
        const style = `
      <style>
        :host {
          display: block;
          margin: 8px 0;
        }
        .tag-container {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 8px;
        }
        .tag {
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          user-select: none;
          transition: opacity 0.2s;
        }
        .tag:hover {
          opacity: 0.8;
        }
        .tag.selected {
          outline: 2px solid var(--primary-color);
        }
        .delete-btn {
          border: none;
          background: none;
          color: inherit;
          padding: 0;
          font: inherit;
          cursor: pointer;
          opacity: 0.6;
        }
        .delete-btn:hover {
          opacity: 1;
        }
        .add-tag {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 8px;
        }
        .input-row {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        .color-picker {
          width: 40px;
          height: 30px;
          padding: 0;
          border: 1px solid var(--border-color);
          border-radius: 4px;
        }
        .add-tag input {
          flex: 1;
          padding: 4px 8px;
          border: 1px solid var(--border-color);
          border-radius: 4px;
        }
        .add-tag button {
          padding: 4px 12px;
          background: var(--primary-color);
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .error-message {
          color: var(--error-color);
          padding: 8px 12px;
          margin: 8px 0;
          background: rgba(244, 67, 54, 0.1);
          border-left: 3px solid var(--error-color);
          border-radius: 4px;
          font-size: 13px;
        }
      </style>
    `;
        this.shadowRoot.innerHTML = `
      ${style}
      <div class="tag-container">
        ${this.tags.map(tag => `
          <div class="tag ${this.selectedTags.includes(tag.id) ? 'selected' : ''}"
               style="background-color: ${tag.color}; color: white;"
               data-tag-id="${tag.id}">
            ${tag.name}
            <button class="delete-btn" data-tag-id="${tag.id}">×</button>
          </div>
        `).join('')}
      </div>
      <div class="add-tag">
        <div class="input-row">
          <input type="text" id="newTagInput" placeholder="${this.i18n.t('tag.add')}">
          <input type="color" id="tagColor" class="color-picker" 
                 value="${this.getDefaultColor()}"
                 title="选择标签颜色">
          <button id="addTagBtn">${this.i18n.t('button.add')}</button>
        </div>
      </div>
    `;
        this.setupEventListeners();
    }
    setupEventListeners() {
        const container = this.shadowRoot.querySelector('.tag-container');
        const addBtn = this.shadowRoot.querySelector('#addTagBtn');
        const input = this.shadowRoot.querySelector('#newTagInput');
        const colorInput = this.shadowRoot.querySelector('#tagColor');
        // 标签点击事件
        container === null || container === void 0 ? void 0 : container.addEventListener('click', (e) => {
            const target = e.target;
            const tagElement = target.closest('.tag');
            if (tagElement) {
                const tagId = tagElement.dataset.tagId;
                if (tagId) {
                    if (target.classList.contains('delete-btn')) {
                        this.deleteTag(tagId);
                    }
                    else {
                        this.handleTagClick(tagId);
                    }
                }
            }
        });
        // 添加标签事件
        const handleAdd = () => {
            const name = input.value.trim();
            const color = colorInput.value;
            if (name) {
                this.createTag(name, color);
                input.value = '';
            }
        };
        addBtn === null || addBtn === void 0 ? void 0 : addBtn.addEventListener('click', handleAdd);
        input === null || input === void 0 ? void 0 : input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleAdd();
            }
        });
    }
    getDefaultColor() {
        const defaultColors = [
            '#4a90e2', '#27ae60', '#e74c3c', '#f1c40f',
            '#9b59b6', '#e67e22', '#1abc9c', '#34495e'
        ];
        return defaultColors[this.tags.length % defaultColors.length];
    }
}
customElements.define('tag-manager', TagManager);

;// ./src/services/KeyboardService.ts
class KeyboardService {
    constructor() {
        this.shortcuts = {
            'newTodo': { key: 'n', ctrl: true, description: '新建任务' },
            'search': { key: 'f', ctrl: true, description: '搜索' },
            'save': { key: 's', ctrl: true, description: '保存' },
            'toggleTheme': { key: 't', ctrl: true, shift: true, description: '切换主题' },
            'toggleFilter': { key: 'f', ctrl: true, shift: true, description: '切换过滤器' },
            'exportData': { key: 'e', ctrl: true, shift: true, description: '导出数据' },
            'importData': { key: 'i', ctrl: true, shift: true, description: '导入数据' },
        };
        this.handlers = {};
        this.initializeKeyboardListener();
    }
    static getInstance() {
        if (!KeyboardService.instance) {
            KeyboardService.instance = new KeyboardService();
        }
        return KeyboardService.instance;
    }
    initializeKeyboardListener() {
        document.addEventListener('keydown', (event) => {
            var _a, _b;
            const matchedAction = this.findMatchingShortcut(event);
            if (matchedAction) {
                event.preventDefault();
                (_b = (_a = this.handlers)[matchedAction]) === null || _b === void 0 ? void 0 : _b.call(_a);
            }
        });
    }
    findMatchingShortcut(event) {
        const pressedKey = event.key.toLowerCase();
        const hasCtrl = event.ctrlKey || event.metaKey; // macOS 上使用 Command 键
        const hasAlt = event.altKey;
        const hasShift = event.shiftKey;
        for (const [action, shortcut] of Object.entries(this.shortcuts)) {
            if (pressedKey === shortcut.key.toLowerCase() &&
                (!shortcut.ctrl || hasCtrl) &&
                (!shortcut.alt || hasAlt) &&
                (!shortcut.shift || hasShift)) {
                return action;
            }
        }
        return null;
    }
    registerShortcut(action, handler) {
        if (this.shortcuts[action]) {
            this.handlers[action] = handler;
        }
        else {
            console.warn(`未知的快捷键操作: ${action}`);
        }
    }
    unregisterShortcut(action) {
        delete this.handlers[action];
    }
    getShortcuts() {
        return Object.assign({}, this.shortcuts);
    }
    getShortcutDescription(action) {
        const shortcut = this.shortcuts[action];
        if (!shortcut)
            return '';
        const parts = [];
        if (shortcut.ctrl)
            parts.push('Ctrl');
        if (shortcut.alt)
            parts.push('Alt');
        if (shortcut.shift)
            parts.push('Shift');
        parts.push(shortcut.key.toUpperCase());
        return `${parts.join('+')} (${shortcut.description})`;
    }
    // 添加新的快捷键
    addShortcut(action, shortcut) {
        this.shortcuts[action] = shortcut;
    }
    // 移除快捷键
    removeShortcut(action) {
        delete this.shortcuts[action];
        delete this.handlers[action];
    }
}

;// ./src/components/ShortcutHints.ts

class ShortcutHints extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.keyboardService = KeyboardService.getInstance();
    }
    connectedCallback() {
        this.render();
    }
    render() {
        if (!this.shadowRoot)
            return;
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

;// ./src/popup.ts











class PopupManager {
    constructor() {
        var _a;
        this.selectedTags = [];
        this.selectedQuickTags = [];
        this.themeManager = ThemeManager.getInstance();
        this.i18n = I18n.getInstance();
        // 使用箭头函数保留this上下文
        this.handleTagsChange = async () => {
            await this.renderQuickTags();
            await this.refreshTodoList();
        };
        // 初始化 DOM 元素
        this.todoList = document.getElementById('todoList');
        this.taskStats = document.getElementById('taskStats');
        this.todoForm = document.getElementById('todoForm');
        this.themeToggle = document.getElementById('themeToggle');
        this.languageSelect = document.getElementById('languageSelect');
        this.addTodoBtn = document.getElementById('addTodoBtn');
        this.newTodoInput = document.getElementById('newTodoInput');
        this.statusFilter = document.getElementById('statusFilter');
        this.searchInput = document.getElementById('searchInput');
        this.exportBtn = document.getElementById('exportBtn');
        this.importBtn = document.getElementById('importBtn');
        this.importFile = document.getElementById('importFile');
        this.tagManager = document.getElementById('tagManager');
        this.settingsBtn = document.getElementById('settingsBtn');
        // 修改设置按钮点击事件
        const dropdownMenu = document.querySelector('.dropdown-menu');
        (_a = this.settingsBtn) === null || _a === void 0 ? void 0 : _a.addEventListener('click', (e) => {
            e.stopPropagation();
            this.settingsBtn.classList.toggle('active');
        });
        // 点击外部关闭下拉菜单
        document.addEventListener('click', (e) => {
            var _a;
            // 修改条件，使其更直接地检查是否点击在settingsBtn之外
            if (e.target !== this.settingsBtn && !this.settingsBtn.contains(e.target)) {
                (_a = this.settingsBtn) === null || _a === void 0 ? void 0 : _a.classList.remove('active');
            }
        });
        // ESC 键关闭下拉菜单
        document.addEventListener('keydown', (e) => {
            var _a;
            if (e.key === 'Escape') {
                (_a = this.settingsBtn) === null || _a === void 0 ? void 0 : _a.classList.remove('active');
            }
        });
        // 添加语言变更监听
        window.addEventListener('languageChange', () => {
            this.updateAllTranslations();
        });
        this.initializeEventListeners();
        this.initializeComponents().catch(error => {
            console.error('初始化失败:', error);
        });
        // 添加全局状态变化监听
        window.addEventListener('todoStateChange', async () => {
            await this.refreshTodoList();
            await this.renderQuickTags();
        });
    }
    async initializeComponents() {
        try {
            // 显示加载状态
            this.showLoadingState();
            await this.themeManager.loadTheme();
            await this.i18n.init();
            await this.refreshTodoList();
            this.updateTranslations();
            // 初始化模板管理器
            const templateManager = document.querySelector('template-manager');
            if (templateManager) {
                templateManager.addEventListener('useTemplate', (e) => {
                    const { todo } = e.detail;
                    const todoForm = document.querySelector('task-form');
                    if (todoForm) {
                        todoForm.setFormData(todo);
                        todoForm.style.display = 'block';
                    }
                });
            }
            // 初始化数据分析视图
            const analyticsView = document.querySelector('analytics-view');
            if (analyticsView) {
                // 当任务状态改变时刷新统计数据
                document.addEventListener('todoStateChange', () => {
                    analyticsView.refresh();
                });
            }
            // 设置标签变化监听器
            this.setupTagChangeListener();
            // 必须在这里调用renderQuickTags，确保DOM已经初始化
            await this.renderQuickTags();
            // 初始检查是否有标签，决定是否显示标签选择器
            const hasAnyTags = await TagService.hasAnyTags();
            const tagSelectorContainer = document.querySelector('.tags-selector');
            if (tagSelectorContainer) {
                tagSelectorContainer.style.display = hasAnyTags ? 'block' : 'none';
            }
            // 设置通知权限
            await this.requestNotificationPermission();
            // 隐藏加载状态
            this.hideLoadingState();
        }
        catch (error) {
            console.error('组件初始化失败:', error);
            this.showErrorState('组件初始化失败，请刷新重试');
            throw error;
        }
    }
    async requestNotificationPermission() {
        try {
            // 请求通知权限
            if ('Notification' in window) {
                const permission = await Notification.requestPermission();
                console.log('通知权限状态:', permission);
            }
        }
        catch (error) {
            console.warn('无法初始化通知系统:', error);
        }
    }
    showLoadingState() {
        const loadingEl = document.createElement('div');
        loadingEl.id = 'app-loading';
        loadingEl.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: var(--background-color);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 9999;
      ">
        <div style="
          width: 40px;
          height: 40px;
          border: 3px solid var(--border-color);
          border-top-color: var(--primary-color);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        "></div>
        <p style="margin-top: 16px; color: var(--text-color);">正在加载...</p>
      </div>
      <style>
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      </style>
    `;
        document.body.appendChild(loadingEl);
    }
    hideLoadingState() {
        const loadingEl = document.getElementById('app-loading');
        if (loadingEl) {
            loadingEl.style.opacity = '0';
            loadingEl.style.transition = 'opacity 0.5s';
            setTimeout(() => {
                loadingEl.remove();
            }, 500);
        }
    }
    showErrorState(message) {
        var _a;
        const errorEl = document.createElement('div');
        errorEl.innerHTML = `
      <div style="
        padding: 16px;
        margin: 16px;
        background: rgba(244, 67, 54, 0.1);
        border-left: 4px solid var(--error-color);
        color: var(--text-color);
        border-radius: 4px;
      ">
        <h3 style="margin: 0 0 8px 0; color: var(--error-color);">错误</h3>
        <p style="margin: 0;">${message}</p>
        <button id="retry-btn" style="
          margin-top: 12px;
          padding: 8px 16px;
          background: var(--primary-color);
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        ">重试</button>
      </div>
    `;
        document.body.appendChild(errorEl);
        (_a = document.getElementById('retry-btn')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => {
            window.location.reload();
        });
    }
    // 使用箭头函数保留this上下文
    setupTagChangeListener() {
        // 先移除可能存在的旧监听器
        this.tagManager.removeEventListener('tagsChange', this.handleTagsChange);
        // 使用实例方法保持一致的引用，便于后续移除
        this.tagManager.addEventListener('tagsChange', this.handleTagsChange);
    }
    async renderQuickTags() {
        var _a;
        const container = document.getElementById('quickTagSelector');
        const tagSelectorContainer = document.querySelector('.tags-selector');
        if (!container || !tagSelectorContainer)
            return;
        try {
            const tags = await TagService.getAllTags();
            if (tags.length === 0) {
                tagSelectorContainer.style.display = 'none';
                return;
            }
            tagSelectorContainer.style.display = 'block';
            container.innerHTML = tags.map(tag => `
        <label class="tag-checkbox" style="background-color: ${tag.color}; color: white;">
          <input type="checkbox" value="${tag.id}" ${this.selectedTags.includes(tag.id) ? 'checked' : ''}>
          <span>${tag.name}</span>
        </label>
      `).join('');
            const newContainer = container.cloneNode(true);
            (_a = container.parentNode) === null || _a === void 0 ? void 0 : _a.replaceChild(newContainer, container);
            newContainer.addEventListener('change', (e) => {
                const checkbox = e.target;
                if (checkbox.type === 'checkbox') {
                    if (checkbox.checked) {
                        this.selectedTags.push(checkbox.value);
                    }
                    else {
                        this.selectedTags = this.selectedTags.filter(id => id !== checkbox.value);
                    }
                }
            });
        }
        catch (error) {
            console.error('加载标签失败:', error);
            tagSelectorContainer.style.display = 'none';
        }
    }
    async refreshTodoList() {
        const filter = {
            status: this.statusFilter.value,
            searchText: this.searchInput.value,
            tags: this.selectedTags.length > 0 ? this.selectedTags : undefined
        };
        const todos = await TodoService.getTodos(filter);
        const stats = await TodoService.getStatistics();
        this.todoList.setAttribute('data-todos', JSON.stringify(todos));
        this.taskStats.setAttribute('data-stats', JSON.stringify(stats));
    }
    initializeEventListeners() {
        this.themeToggle.addEventListener('click', async () => {
            const currentTheme = this.themeManager.getCurrentTheme();
            await this.themeManager.setTheme(currentTheme === 'light' ? 'dark' : 'light');
        });
        this.languageSelect.addEventListener('change', (e) => {
            e.stopPropagation();
            const locale = this.languageSelect.value;
            this.i18n.setLocale(locale);
        });
        this.languageSelect.addEventListener('click', (e) => {
            e.stopPropagation();
        });
        this.addTodoBtn.addEventListener('click', () => this.handleAddTodo());
        this.newTodoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleAddTodo();
            }
        });
        this.statusFilter.addEventListener('change', () => this.refreshTodoList());
        this.searchInput.addEventListener('input', () => this.refreshTodoList());
        this.todoList.addEventListener('todoToggle', (e) => {
            const { id } = e.detail;
            this.handleToggleTodo(id);
        });
        this.todoList.addEventListener('todoDelete', (e) => {
            const { id } = e.detail;
            this.handleDeleteTodo(id);
        });
        this.todoList.addEventListener('todoEdit', (e) => {
            const { todo } = e.detail;
            const todoForm = document.querySelector('task-form');
            if (todoForm) {
                todoForm.setFormData(todo);
                todoForm.style.display = 'block';
            }
        });
        this.todoForm.addEventListener('todoSubmit', (e) => {
            const todoData = e.detail;
            this.handleTodoSubmit(todoData);
        });
        this.todoForm.addEventListener('formCancel', () => {
            this.handleFormCancel();
        });
        this.exportBtn.addEventListener('click', async () => {
            try {
                const data = await StorageService.exportData();
                const blob = new Blob([data], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `easy-todo-backup-${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }
            catch (error) {
                console.error('Export failed:', error);
                alert('导出失败，请重试');
            }
        });
        this.importBtn.addEventListener('click', () => {
            this.importFile.click();
        });
        this.importFile.addEventListener('change', async (e) => {
            var _a;
            const file = (_a = e.target.files) === null || _a === void 0 ? void 0 : _a[0];
            if (!file)
                return;
            const reader = new FileReader();
            reader.onload = async (event) => {
                var _a;
                try {
                    const jsonData = (_a = event.target) === null || _a === void 0 ? void 0 : _a.result;
                    const success = await StorageService.importData(jsonData);
                    if (success) {
                        alert(this.i18n.t('alerts.import.success'));
                        await this.refreshTodoList();
                        await this.renderQuickTags();
                        const tagManager = document.querySelector('tag-manager');
                        if (tagManager) {
                            await tagManager.loadTags();
                        }
                        const taskStats = document.querySelector('task-stats');
                        if (taskStats) {
                            const stats = await TodoService.getStatistics();
                            taskStats.setAttribute('data-stats', JSON.stringify(stats));
                        }
                    }
                    else {
                        alert(this.i18n.t('alerts.import.error'));
                    }
                }
                catch (error) {
                    console.error('Import failed:', error);
                    alert(this.i18n.t('alerts.import.error'));
                }
                this.importFile.value = '';
            };
            reader.readAsText(file);
        });
        this.tagManager.addEventListener('tagSelect', (e) => {
            const { tagId } = e.detail;
            this.toggleTagFilter(tagId);
        });
        this.tagManager.addEventListener('tagsChange', () => {
            this.refreshTodoList();
        });
        this.tagManager.addEventListener('tagsChange', () => {
            const todoForm = document.querySelector('task-form');
            if (todoForm) {
                todoForm.refresh();
            }
        });
        this.todoList.addEventListener('todoReorder', async (e) => {
            const { todos } = e.detail;
            await TodoService.updateTodosOrder(todos);
            await this.refreshTodoList();
        });
    }
    async handleAddTodo() {
        const title = this.newTodoInput.value.trim();
        if (!title)
            return;
        try {
            await TodoService.createTodo(title, undefined, undefined, this.selectedTags);
            this.newTodoInput.value = '';
            this.selectedTags = [];
            this.resetTagCheckboxes();
            await this.renderQuickTags();
            await this.refreshTodoList();
        }
        catch (error) {
            console.error('创建任务失败:', error);
            alert('创建任务失败，请重试');
        }
    }
    resetTagCheckboxes() {
        const checkboxes = document.querySelectorAll('#quickTagSelector input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
    }
    async handleToggleTodo(todoId) {
        await TodoService.toggleTodoStatus(todoId);
        await this.refreshTodoList();
    }
    async handleDeleteTodo(todoId) {
        await TodoService.deleteTodo(todoId);
        await this.refreshTodoList();
    }
    async handleTodoSubmit(todoData) {
        try {
            if (todoData.id) {
                await TodoService.updateTodo(todoData.id, Object.assign(Object.assign({}, todoData), { updatedAt: Date.now() }));
            }
            else {
                await TodoService.createTodo(todoData.title, todoData.description, todoData.dueDate, todoData.tags || [], 'medium', todoData.reminderLeadTime);
            }
            await this.refreshTodoList();
            const todoForm = document.querySelector('task-form');
            if (todoForm) {
                todoForm.style.display = 'none';
                setTimeout(() => {
                    todoForm.reset();
                }, 100);
            }
        }
        catch (error) {
            console.error('保存任务失败:', error);
            alert(this.i18n.t('todo.saveError'));
        }
    }
    handleFormCancel() {
        const todoForm = document.getElementById('todoForm');
        if (todoForm) {
            todoForm.style.display = 'none';
            setTimeout(() => {
                todoForm.reset();
            }, 100);
        }
    }
    async toggleTagFilter(tagId) {
        const index = this.selectedTags.indexOf(tagId);
        if (index === -1) {
            this.selectedTags.push(tagId);
        }
        else {
            this.selectedTags.splice(index, 1);
        }
        this.tagManager.setAttribute('data-selected-tags', JSON.stringify(this.selectedTags));
        await this.refreshTodoList();
    }
    async updateAllTranslations() {
        this.updateTranslations();
        await this.refreshTodoList();
        const tagManager = document.querySelector('tag-manager');
        if (tagManager) {
            await tagManager.loadTags();
        }
        this.exportBtn.title = this.i18n.t('data.export');
        this.importBtn.title = this.i18n.t('data.import');
        document.querySelector('#themeToggle .text').textContent = this.i18n.t('menu.theme');
        document.querySelector('#exportBtn .text').textContent = this.i18n.t('menu.export');
        document.querySelector('#importBtn .text').textContent = this.i18n.t('menu.import');
    }
    updateTranslations() {
        document.querySelector('h1').textContent = this.i18n.t('app.title');
        this.addTodoBtn.textContent = this.i18n.t('app.addTodo');
        this.newTodoInput.placeholder = this.i18n.t('app.placeholder');
        this.updateSelectOptions(this.statusFilter, [
            { value: 'all', label: this.i18n.t('filters.all') },
            { value: 'active', label: this.i18n.t('filters.active') },
            { value: 'completed', label: this.i18n.t('filters.completed') }
        ]);
        this.searchInput.placeholder = this.i18n.t('filters.search');
        this.exportBtn.title = this.i18n.t('data.export');
        this.importBtn.title = this.i18n.t('data.import');
        document.querySelector('#themeToggle .text').textContent = this.i18n.t('menu.theme');
        document.querySelector('#exportBtn .text').textContent = this.i18n.t('menu.export');
        document.querySelector('#importBtn .text').textContent = this.i18n.t('menu.import');
        this.settingsBtn.title = this.i18n.t('menu.settings');
    }
    updateSelectOptions(select, options) {
        const currentValue = select.value;
        select.innerHTML = options
            .map(opt => `<option value="${opt.value}">${opt.label}</option>`)
            .join('');
        select.value = currentValue;
    }
}
document.addEventListener('DOMContentLoaded', () => {
    new PopupManager();
});

/******/ })()
;