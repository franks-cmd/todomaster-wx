// ========================
// 云端存储实现
// ========================

function _callFunction(name, data) {
  return wx.cloud.callFunction({
    name,
    data
  }).then(res => res.result)
}

// ========================
// Todos CRUD
// ========================

function getTodos(filters = {}) {
  return _callFunction('todo-sync', {
    action: 'list',
    filters
  }).then(res => res.data || [])
}

function getTodoById(id) {
  return _callFunction('todo-sync', {
    action: 'get',
    todoId: id
  }).then(res => res.data || null)
}

function createTodo(data) {
  return _callFunction('todo-sync', {
    action: 'create',
    todo: data
  }).then(res => res.data)
}

function updateTodo(id, data) {
  return _callFunction('todo-sync', {
    action: 'update',
    todoId: id,
    todo: data
  }).then(res => res.data)
}

function deleteTodo(id) {
  return _callFunction('todo-sync', {
    action: 'delete',
    todoId: id
  })
}

function toggleComplete(id) {
  return _callFunction('todo-sync', {
    action: 'toggleComplete',
    todoId: id
  }).then(res => res.data)
}

function batchUpdateSortOrder(items) {
  return _callFunction('todo-sync', {
    action: 'batchUpdateOrder',
    items
  })
}

// ========================
// Categories CRUD
// ========================

function getCategories() {
  return _callFunction('category-sync', {
    action: 'list'
  }).then(res => res.data || [])
}

function createCategory(data) {
  return _callFunction('category-sync', {
    action: 'create',
    category: data
  }).then(res => res.data)
}

function updateCategory(id, data) {
  return _callFunction('category-sync', {
    action: 'update',
    categoryId: id,
    category: data
  }).then(res => res.data)
}

function deleteCategory(id) {
  return _callFunction('category-sync', {
    action: 'delete',
    categoryId: id
  })
}

// ========================
// 批量操作
// ========================

function getAllData() {
  return Promise.all([
    getTodos(),
    getCategories()
  ]).then(([todos, categories]) => ({ todos, categories }))
}

function importData(data) {
  return _callFunction('migrate-to-cloud', {
    todos: data.todos || [],
    categories: data.categories || []
  })
}

function clearAllData() {
  return _callFunction('todo-sync', {
    action: 'clearAll'
  })
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
