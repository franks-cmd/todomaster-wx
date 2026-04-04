const { STORAGE_KEYS, DEFAULT_CATEGORIES } = require('./constants')
const { generateId } = require('./util')

// ========================
// 内部辅助
// ========================

function _getTodos() {
  return wx.getStorageSync(STORAGE_KEYS.TODOS) || []
}

function _saveTodos(todos) {
  wx.setStorageSync(STORAGE_KEYS.TODOS, todos)
}

function _getCategories() {
  let cats = wx.getStorageSync(STORAGE_KEYS.CATEGORIES)
  if (!cats || cats.length === 0) {
    cats = DEFAULT_CATEGORIES.map(c => ({
      ...c,
      createdAt: Date.now()
    }))
    wx.setStorageSync(STORAGE_KEYS.CATEGORIES, cats)
  }
  return cats
}

function _saveCategories(categories) {
  wx.setStorageSync(STORAGE_KEYS.CATEGORIES, categories)
}

// ========================
// Todos CRUD
// ========================

function getTodos(filters = {}) {
  let todos = _getTodos()

  // 筛选
  if (filters.completed === true) {
    todos = todos.filter(t => t.completed)
  } else if (filters.completed === false) {
    todos = todos.filter(t => !t.completed)
  }

  if (filters.categoryId) {
    todos = todos.filter(t => t.categoryId === filters.categoryId)
  }

  if (filters.priority) {
    todos = todos.filter(t => t.priority === filters.priority)
  }

  if (filters.keyword) {
    const kw = filters.keyword.toLowerCase()
    todos = todos.filter(t =>
      t.title.toLowerCase().includes(kw) ||
      (t.description && t.description.toLowerCase().includes(kw))
    )
  }

  // 排序
  todos.sort((a, b) => a.sortOrder - b.sortOrder)

  return Promise.resolve(todos)
}

function getTodoById(id) {
  const todos = _getTodos()
  return Promise.resolve(todos.find(t => t.id === id) || null)
}

function createTodo(data) {
  const todos = _getTodos()
  const maxOrder = todos.length > 0
    ? Math.max(...todos.map(t => t.sortOrder || 0))
    : 0

  const todo = {
    id: generateId(),
    title: data.title,
    description: data.description || '',
    completed: false,
    priority: data.priority || 'medium',
    dueDate: data.dueDate || null,
    categoryId: data.categoryId || null,
    sortOrder: maxOrder + 1,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }

  todos.push(todo)
  _saveTodos(todos)
  return Promise.resolve(todo)
}

function updateTodo(id, data) {
  const todos = _getTodos()
  const index = todos.findIndex(t => t.id === id)
  if (index === -1) return Promise.reject(new Error('待办不存在'))

  const updated = {
    ...todos[index],
    ...data,
    id: todos[index].id,
    createdAt: todos[index].createdAt,
    updatedAt: Date.now()
  }
  todos[index] = updated
  _saveTodos(todos)
  return Promise.resolve(updated)
}

function deleteTodo(id) {
  const todos = _getTodos()
  const filtered = todos.filter(t => t.id !== id)
  _saveTodos(filtered)
  return Promise.resolve()
}

function toggleComplete(id) {
  const todos = _getTodos()
  const todo = todos.find(t => t.id === id)
  if (!todo) return Promise.reject(new Error('待办不存在'))

  todo.completed = !todo.completed
  todo.updatedAt = Date.now()
  _saveTodos(todos)
  return Promise.resolve(todo)
}

function batchUpdateSortOrder(items) {
  const todos = _getTodos()
  items.forEach(({ id, sortOrder }) => {
    const todo = todos.find(t => t.id === id)
    if (todo) {
      todo.sortOrder = sortOrder
      todo.updatedAt = Date.now()
    }
  })
  _saveTodos(todos)
  return Promise.resolve()
}

// ========================
// Categories CRUD
// ========================

function getCategories() {
  return Promise.resolve(_getCategories())
}

function createCategory(data) {
  const categories = _getCategories()
  const category = {
    id: generateId(),
    name: data.name,
    color: data.color,
    createdAt: Date.now()
  }
  categories.push(category)
  _saveCategories(categories)
  return Promise.resolve(category)
}

function updateCategory(id, data) {
  const categories = _getCategories()
  const index = categories.findIndex(c => c.id === id)
  if (index === -1) return Promise.reject(new Error('分类不存在'))

  categories[index] = { ...categories[index], ...data }
  _saveCategories(categories)
  return Promise.resolve(categories[index])
}

function deleteCategory(id) {
  const categories = _getCategories()
  _saveCategories(categories.filter(c => c.id !== id))

  // 将关联待办的 categoryId 置空
  const todos = _getTodos()
  let changed = false
  todos.forEach(t => {
    if (t.categoryId === id) {
      t.categoryId = null
      changed = true
    }
  })
  if (changed) _saveTodos(todos)

  return Promise.resolve()
}

// ========================
// 批量操作
// ========================

function getAllData() {
  return Promise.resolve({
    todos: _getTodos(),
    categories: _getCategories()
  })
}

function importData(data) {
  if (data.todos) _saveTodos(data.todos)
  if (data.categories) _saveCategories(data.categories)
  return Promise.resolve()
}

function clearAllData() {
  wx.removeStorageSync(STORAGE_KEYS.TODOS)
  wx.removeStorageSync(STORAGE_KEYS.CATEGORIES)
  return Promise.resolve()
}

module.exports = {
  getTodos,
  getTodoById,
  createTodo,
  updateTodo,
  deleteTodo,
  toggleComplete,
  batchUpdateSortOrder,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getAllData,
  importData,
  clearAllData
}
