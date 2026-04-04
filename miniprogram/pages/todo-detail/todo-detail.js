const storage = require('../../utils/storage')
const { formatDateTime, formatRelativeTime, getDueStatus, showToast, showConfirm } = require('../../utils/util')

Page({
  data: {
    todo: null,
    categoryName: '',
    categoryColor: '',
    dueDisplayText: '',
    dueStatusClass: '',
    createdText: ''
  },

  onLoad(options) {
    if (options.id) {
      this.todoId = options.id
    }
  },

  onShow() {
    if (this.todoId) {
      this.loadTodo(this.todoId)
    }
  },

  loadTodo(id) {
    Promise.all([
      storage.getTodoById(id),
      storage.getCategories()
    ]).then(([todo, categories]) => {
      if (!todo) {
        showToast('待办不存在')
        wx.navigateBack()
        return
      }

      let categoryName = ''
      let categoryColor = ''
      if (todo.categoryId) {
        const cat = categories.find(c => (c.id || c._id) === todo.categoryId)
        if (cat) {
          categoryName = cat.name
          categoryColor = cat.color
        }
      }

      const dueStatus = getDueStatus(todo.dueDate)

      this.setData({
        todo,
        categoryName,
        categoryColor,
        dueDisplayText: todo.dueDate
          ? `${formatDateTime(todo.dueDate)}（${formatRelativeTime(todo.dueDate)}）`
          : '',
        dueStatusClass: dueStatus === 'overdue' ? 'due-overdue' :
                         dueStatus === 'urgent' ? 'due-urgent' : '',
        createdText: formatDateTime(todo.createdAt)
      })
    })
  },

  onToggle() {
    storage.toggleComplete(this.todoId).then(() => {
      wx.vibrateShort({ type: 'light' })
      this.loadTodo(this.todoId)
    })
  },

  onEdit() {
    wx.navigateTo({ url: `/pages/add-todo/add-todo?id=${this.todoId}` })
  },

  onDelete() {
    showConfirm('确定要删除这个待办吗？').then(confirmed => {
      if (confirmed) {
        storage.deleteTodo(this.todoId).then(() => {
          showToast('已删除')
          setTimeout(() => wx.navigateBack(), 500)
        })
      }
    })
  }
})
