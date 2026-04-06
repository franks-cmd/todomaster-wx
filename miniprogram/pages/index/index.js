const storage = require('../../utils/storage')
const { showToast, showConfirm } = require('../../utils/util')
const sound = require('../../utils/sound')

Page({
  data: {
    todos: [],
    categories: [],
    filteredTodos: [],
    filterStatus: 'all',
    filterCategoryId: '',
    filterPriority: '',
    activeCount: 0,
    hasAnyTodos: false,
    loading: true,
    sortMode: false,
    showReminder: false,
    reminders: []
  },

  onLoad() {
    this.loadData()
  },

  onShow() {
    this.loadData()
    this.checkReminders()
  },

  onPullDownRefresh() {
    this.loadData().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  loadData() {
    return Promise.all([
      storage.getTodos(),
      storage.getCategories()
    ]).then(([todos, categories]) => {
      // 给 todo 附加分类信息
      const catMap = {}
      categories.forEach(c => { catMap[c.id || c._id] = c })

      todos.forEach(t => {
        const cat = catMap[t.categoryId]
        t._categoryName = cat ? cat.name : ''
        t._categoryColor = cat ? cat.color : ''
      })

      this.setData({
        todos,
        categories,
        hasAnyTodos: todos.length > 0,
        activeCount: todos.filter(t => !t.completed).length,
        loading: false
      })

      this.applyFilters()
    }).catch(err => {
      console.error('加载数据失败:', err)
      this.setData({ loading: false })
    })
  },

  applyFilters() {
    let result = this.data.todos

    const { filterStatus, filterCategoryId, filterPriority } = this.data

    if (filterStatus === 'active') {
      result = result.filter(t => !t.completed)
    } else if (filterStatus === 'completed') {
      result = result.filter(t => t.completed)
    }

    if (filterCategoryId) {
      result = result.filter(t => t.categoryId === filterCategoryId)
    }

    if (filterPriority) {
      result = result.filter(t => t.priority === filterPriority)
    }

    this.setData({ filteredTodos: result })
  },

  onFilterChange(e) {
    const { status, categoryId, priority } = e.detail
    this.setData({
      filterStatus: status,
      filterCategoryId: categoryId,
      filterPriority: priority
    })
    this.applyFilters()
  },

  onTodoTap(e) {
    const { id } = e.detail
    wx.navigateTo({ url: `/pages/todo-detail/todo-detail?id=${id}` })
  },

  onTodoToggle(e) {
    const { id } = e.detail
    const todo = this.data.todos.find(t => (t.id || t._id) === id)
    const wasCompleted = todo && todo.completed
    storage.toggleComplete(id).then(() => {
      wx.vibrateShort({ type: 'light' })
      if (!wasCompleted) sound.playComplete()
      this.loadData()
    })
  },

  onTodoDelete(e) {
    const { id } = e.detail
    showConfirm('确定要删除这个待办吗？').then(confirmed => {
      if (confirmed) {
        storage.deleteTodo(id).then(() => {
          showToast('已删除')
          this.loadData()
        })
      }
    })
  },

  toggleSortMode() {
    this.setData({ sortMode: !this.data.sortMode })
  },

  saveSortOrder() {
    const items = this.data.filteredTodos.map((t, i) => ({
      id: t.id || t._id,
      sortOrder: i
    }))
    storage.batchUpdateSortOrder(items).then(() => {
      this.setData({ sortMode: false })
      showToast('排序已保存')
      this.loadData()
    })
  },

  goSearch() {
    wx.navigateTo({ url: '/pages/search/search' })
  },

  goAddTodo() {
    wx.navigateTo({ url: '/pages/add-todo/add-todo' })
  },

  // 提醒相关
  checkReminders() {
    const app = getApp()
    const reminders = app.globalData.pendingReminders || []
    if (reminders.length > 0) {
      sound.playReminder()
      this.setData({
        showReminder: true,
        reminders
      })
      app.globalData.pendingReminders = []
    }
  },

  onReminderClose() {
    this.setData({ showReminder: false })
  },

  onReminderDone(e) {
    const { todoId } = e.detail
    storage.toggleComplete(todoId).then(() => {
      const reminders = this.data.reminders.filter(r => r.todo.id !== todoId)
      this.setData({
        reminders,
        showReminder: reminders.length > 0
      })
      this.loadData()
    })
  },

  onReminderDismiss(e) {
    const { todoId } = e.detail
    const reminders = this.data.reminders.filter(r => r.todo.id !== todoId)
    this.setData({
      reminders,
      showReminder: reminders.length > 0
    })
  }
})
