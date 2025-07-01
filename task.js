import * as storage from './storage.js';

/**
 * Custom Error class for storage-related issues.
 */
class StorageError extends Error {
    constructor(message, originalError = null) {
        super(message);
        this.name = 'StorageError';
        this.originalError = originalError;
    }
}

/**
 * Custom Error class for invalid input issues.
 */
class InvalidInputError extends Error {
    constructor(message) {
        super(message);
        this.name = 'InvalidInputError';
    }
}

/**
 * Manages tasks and subtasks using chrome.storage.local.
 * Provides CRUD operations and helper functions for task management.
 */
class TaskManager {
    constructor() {
        this.STORAGE_KEY = 'tasks';
    }

    /**
     * Initializes the TaskManager.
     * This method can be expanded for any initial setup logic for tasks.
     * It helps prevent global `init` function conflicts by being a method of the manager.
     * @returns {void}
     */
    init() {
        console.log('TaskManager initialized.');
        // No specific initialization logic needed beyond logging for now,
        // as _getTasks handles default empty state.
    }

    /**
     * Retrieves tasks from chrome.storage.local using the centralized storage module.
     * @private
     * @returns {Promise<Array<object>>} A promise that resolves with an array of task objects.
     * @throws {StorageError} If there's an error retrieving tasks from storage.
     */
    async _getTasks() {
        try {
            // Refactored to use storage.js's getAllTasks function
            const tasks = await storage.getAllTasks();
            return tasks; // storage.getAllTasks already handles returning an empty array if no tasks are found
        } catch (error) {
            console.error('Error retrieving tasks from storage:', error);
            throw new StorageError('Failed to retrieve tasks due to storage error.', error);
        }
    }

    /**
     * Saves the provided array of tasks to chrome.storage.local using the centralized storage module.
     * @private
     * @param {Array<object>} tasks - The array of task objects to save.
     * @returns {Promise<void>} A promise that resolves when tasks are successfully saved.
     * @throws {StorageError} If there's an error saving tasks to storage.
     */
    async _saveTasks(tasks) {
        try {
            // Refactored to use storage.js's saveAllTasks function
            await storage.saveAllTasks(tasks);
        } catch (error) {
            console.error('Error saving tasks to storage:', error);
            throw new StorageError('Failed to save tasks due to storage error.', error);
        }
    }

    /**
     * Generates a unique identifier string using crypto.randomUUID().
     * This ID is used for both tasks and subtasks to ensure uniqueness, addressing review feedback for robustness.
     * @private
     * @returns {string} A unique ID string (UUID v4).
     */
    _generateUniqueId() {
        // Use cryptographically secure pseudo-random number generator for high uniqueness.
        // crypto.randomUUID() is widely supported in modern browser environments like Chrome.
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            return crypto.randomUUID();
        }
        // Fallback for older or non-standard environments, though unlikely for a Chrome extension.
        console.warn('crypto.randomUUID not available, falling back to less robust ID generation.');
        return `_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Creates a new task and adds it to the storage.
     * @param {object} taskData - An object containing properties for the new task.
     *                          Expected properties: `title`, `description` (optional), `dueDate` (optional).
     * @returns {Promise<object>} A promise that resolves with the newly created task object.
     * @throws {InvalidInputError} If `taskData` is invalid.
     * @throws {StorageError} If there's an error saving tasks to storage.
     */
    async createTask(taskData) {
        if (!taskData || typeof taskData !== 'object' || !taskData.title) {
            throw new InvalidInputError('Invalid task data. A "title" is required to create a task.');
        }

        const tasks = await this._getTasks();
        const now = Date.now();

        const newTask = {
            id: this._generateUniqueId(),
            title: taskData.title,
            description: taskData.description || '',
            dueDate: taskData.dueDate || null, // Can be a string (e.g., 'YYYY-MM-DD') or timestamp
            isComplete: false,
            createdAt: now,
            updatedAt: now,
            subtasks: [] // Initialize with an empty array for subtasks
        };

        tasks.push(newTask);
        await this._saveTasks(tasks);
        console.log('Task created:', newTask.id, newTask.title);
        return newTask;
    }

    /**
     * Retrieves a single task by its unique ID.
     * @param {string} id - The unique ID of the task to retrieve.
     * @returns {Promise<object|null>} A promise that resolves with the task object if found, otherwise null.
     * @throws {InvalidInputError} If `id` is not provided.
     * @throws {StorageError} If there's an error retrieving tasks from storage.
     */
    async getTaskById(id) {
        if (!id) {
            throw new InvalidInputError('Task ID must be provided to retrieve a task.');
        }
        const tasks = await this._getTasks();
        return tasks.find(task => task.id === id) || null;
    }

    /**
     * Retrieves all tasks currently stored.
     * @returns {Promise<Array<object>>} A promise that resolves with an array of all task objects.
     * @throws {StorageError} If there's an error retrieving tasks from storage.
     */
    async getAllTasks() {
        // Removed redundant await as per review feedback
        return this._getTasks();
    }

    /**
     * Updates an existing task with new data.
     * Merges `newData` into the existing task, preserving the original `id` and `subtasks` array
     * unless explicitly overridden by `newData`.
     * @param {string} id - The unique ID of the task to update.
     * @param {object} newData - An object containing the properties to update.
     * @returns {Promise<object|null>} A promise that resolves with the updated task object, or null if the task was not found.
     * @throws {InvalidInputError} If `id` or `newData` are invalid.
     * @throws {StorageError} If there's an error saving tasks to storage.
     */
    async updateTask(id, newData) {
        if (!id || typeof newData !== 'object' || newData === null) {
            throw new InvalidInputError('Task ID and valid new data object are required to update a task.');
        }

        const tasks = await this._getTasks();
        const taskIndex = tasks.findIndex(task => task.id === id);

        if (taskIndex === -1) {
            console.warn(`Task with ID ${id} not found for update.`);
            return null; // Task not found
        }

        // Merge new data while explicitly preserving ID and subtasks structure,
        // unless subtasks are directly managed via addSubtask/deleteSubtask.
        // `id` is always preserved from the original task.
        const updatedTask = {
            ...tasks[taskIndex],
            ...newData,
            id: tasks[taskIndex].id, // Ensure ID is immutable through updateTask
            subtasks: tasks[taskIndex].subtasks, // Ensure subtasks array reference is maintained
            updatedAt: Date.now() // Update timestamp
        };

        tasks[taskIndex] = updatedTask;
        await this._saveTasks(tasks);
        console.log('Task updated:', updatedTask.id, updatedTask.title);
        return updatedTask;
    }

    /**
     * Deletes a task by its unique ID.
     * @param {string} id - The unique ID of the task to delete.
     * @returns {Promise<boolean>} A promise that resolves with true if the task was deleted, false if not found.
     * @throws {InvalidInputError} If `id` is not provided.
     * @throws {StorageError} If there's an error saving tasks to storage.
     */
    async deleteTask(id) {
        if (!id) {
            throw new InvalidInputError('Task ID must be provided to delete a task.');
        }

        const tasks = await this._getTasks();
        const initialLength = tasks.length;
        const filteredTasks = tasks.filter(task => task.id !== id);

        if (filteredTasks.length === initialLength) {
            console.warn(`Task with ID ${id} not found for deletion.`);
            return false; // Task not found
        }

        await this._saveTasks(filteredTasks);
        console.log('Task deleted:', id);
        return true;
    }

    /**
     * Marks a task as complete or incomplete.
     * This is a specialized update function.
     * @param {string} id - The unique ID of the task to update.
     * @param {boolean} isComplete - The new completion status (true for complete, false for incomplete).
     * @returns {Promise<object|null>} A promise that resolves with the updated task object, or null if the task was not found.
     * @throws {InvalidInputError} If `id` is invalid or `isComplete` is not a boolean.
     * @throws {StorageError} If there's an error saving tasks to storage.
     */
    async markTaskStatus(id, isComplete) {
        if (!id || typeof isComplete !== 'boolean') {
            throw new InvalidInputError('Task ID and a boolean status (isComplete) are required to mark task status.');
        }
        return this.updateTask(id, { isComplete });
    }

    /**
     * Adds a subtask to an existing task.
     * @param {string} taskId - The unique ID of the parent task.
     * @param {object} subtaskData - An object containing properties for the new subtask.
     *                             Expected property: `title`.
     * @returns {Promise<object|null>} A promise that resolves with the newly created subtask object, or null if the parent task was not found.
     * @throws {InvalidInputError} If `taskId` or `subtaskData` are invalid.
     * @throws {StorageError} If there's an error saving tasks to storage.
     */
    async addSubtask(taskId, subtaskData) {
        if (!taskId || !subtaskData || typeof subtaskData !== 'object' || !subtaskData.title) {
            throw new InvalidInputError('Parent Task ID and valid subtask data with a "title" are required to add a subtask.');
        }

        const tasks = await this._getTasks();
        const taskIndex = tasks.findIndex(task => task.id === taskId);

        if (taskIndex === -1) {
            console.warn(`Parent task with ID ${taskId} not found for adding subtask.`);
            return null; // Parent task not found
        }

        const now = Date.now();
        const newSubtask = {
            id: this._generateUniqueId(),
            title: subtaskData.title,
            isComplete: false, // Subtasks are incomplete by default
            createdAt: now,
            updatedAt: now
        };

        tasks[taskIndex].subtasks.push(newSubtask);
        tasks[taskIndex].updatedAt = now; // Update parent task's timestamp
        await this._saveTasks(tasks);
        console.log('Subtask added to task:', taskId, newSubtask.id, newSubtask.title);
        return newSubtask;
    }

    /**
     * Deletes a specific subtask from a parent task.
     * @param {string} taskId - The unique ID of the parent task.
     * @param {string} subtaskId - The unique ID of the subtask to delete.
     * @returns {Promise<boolean>} A promise that resolves with true if the subtask was deleted, false if either task or subtask was not found.
     * @throws {InvalidInputError} If `taskId` or `subtaskId` are not provided.
     * @throws {StorageError} If there's an error saving tasks to storage.
     */
    async deleteSubtask(taskId, subtaskId) {
        if (!taskId || !subtaskId) {
            throw new InvalidInputError('Parent Task ID and Subtask ID must be provided to delete a subtask.');
        }

        const tasks = await this._getTasks();
        const taskIndex = tasks.findIndex(task => task.id === taskId);

        if (taskIndex === -1) {
            console.warn(`Parent task with ID ${taskId} not found for subtask deletion.`);
            return false; // Parent task not found
        }

        const task = tasks[taskIndex];
        const initialSubtaskCount = task.subtasks.length;
        task.subtasks = task.subtasks.filter(subtask => subtask.id !== subtaskId);

        if (task.subtasks.length === initialSubtaskCount) {
            console.warn(`Subtask with ID ${subtaskId} not found within task ${taskId} for deletion.`);
            return false; // Subtask not found within the parent task
        }

        tasks[taskIndex].updatedAt = Date.now(); // Update parent task's timestamp
        await this._saveTasks(tasks);
        console.log('Subtask deleted from task:', taskId, subtaskId);
        return true;
    }

    /**
     * Marks a subtask as complete or incomplete within its parent task.
     * @param {string} taskId - The unique ID of the parent task.
     * @param {string} subtaskId - The unique ID of the subtask to update.
     * @param {boolean} isComplete - The new completion status (true for complete, false for incomplete).
     * @returns {Promise<object|null>} A promise that resolves with the updated subtask object, or null if parent task or subtask not found.
     * @throws {InvalidInputError} If `taskId`, `subtaskId`, or `isComplete` are invalid.
     * @throws {StorageError} If there's an error saving tasks to storage.
     */
    async markSubtaskStatus(taskId, subtaskId, isComplete) {
        if (!taskId || !subtaskId || typeof isComplete !== 'boolean') {
            throw new InvalidInputError('Parent Task ID, Subtask ID, and a boolean status (isComplete) are required to mark subtask status.');
        }

        const tasks = await this._getTasks();
        const taskIndex = tasks.findIndex(task => task.id === taskId);

        if (taskIndex === -1) {
            console.warn(`Parent task with ID ${taskId} not found for marking subtask status.`);
            return null; // Parent task not found
        }

        const task = tasks[taskIndex];
        const subtaskIndex = task.subtasks.findIndex(sub => sub.id === subtaskId);

        if (subtaskIndex === -1) {
            console.warn(`Subtask with ID ${subtaskId} not found within task ${taskId} for marking status.`);
            return null; // Subtask not found
        }

        task.subtasks[subtaskIndex].isComplete = isComplete;
        task.subtasks[subtaskIndex].updatedAt = Date.now(); // Update subtask's timestamp
        tasks[taskIndex].updatedAt = Date.now(); // Update parent task's timestamp
        
        await this._saveTasks(tasks);
        console.log('Subtask status updated:', taskId, subtaskId, isComplete);
        return task.subtasks[subtaskIndex];
    }
}

// Export an instance of TaskManager for easy access throughout the extension.
// This allows other modules to import and use task management functions directly.
const taskManager = new TaskManager();

// Initialize the task manager on script load.
// This call is now encapsulated within the taskManager object, avoiding global conflicts.
taskManager.init();

export default taskManager;