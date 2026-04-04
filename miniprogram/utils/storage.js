const { STORAGE_KEYS } = require('./constants')
const localStore = require('./storage-local')
const cloudStore = require('./storage-cloud')

/**
 * 获取当前存储模式
 */
function getStorageMode() {
  const settings = wx.getStorageSync(STORAGE_KEYS.SETTINGS) || {}
  return settings.storageMode || 'local'
}

/**
 * 设置存储模式
 */
function setStorageMode(mode) {
  const settings = wx.getStorageSync(STORAGE_KEYS.SETTINGS) || {}
  settings.storageMode = mode
  wx.setStorageSync(STORAGE_KEYS.SETTINGS, settings)
  getApp().globalData.storageMode = mode
}

/**
 * 获取当前存储实现
 */
function _getStore() {
  return getStorageMode() === 'cloud' ? cloudStore : localStore
}

// 统一导出所有方法，自动路由到对应实现
module.exports = {
  getStorageMode,
  setStorageMode,

  // Todos
  getTodos: (filters) => _getStore().getTodos(filters),
  getTodoById: (id) => _getStore().getTodoById(id),
  createTodo: (data) => _getStore().createTodo(data),
  updateTodo: (id, data) => _getStore().updateTodo(id, data),
  deleteTodo: (id) => _getStore().deleteTodo(id),
  toggleComplete: (id) => _getStore().toggleComplete(id),
  batchUpdateSortOrder: (items) => _getStore().batchUpdateSortOrder(items),

  // Categories
  getCategories: () => _getStore().getCategories(),
  createCategory: (data) => _getStore().createCategory(data),
  updateCategory: (id, data) => _getStore().updateCategory(id, data),
  deleteCategory: (id) => _getStore().deleteCategory(id),

  // Bulk
  getAllData: () => _getStore().getAllData(),
  importData: (data) => _getStore().importData(data),
  clearAllData: () => _getStore().clearAllData(),

  // 直接访问特定存储（迁移用）
  localStore,
  cloudStore
}
