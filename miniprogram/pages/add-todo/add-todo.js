const storage = require('../../utils/storage')
const { showToast, parseDateTime } = require('../../utils/util')
const { requestSubscription, hasPromptedSubscription, showSubscriptionGuide } = require('../../utils/subscription')
const sound = require('../../utils/sound')

Page({
  data: {
    isEdit: false,
    todoId: '',
    title: '',
    description: '',
    priority: 'medium',
    categoryId: '',
    dueDate: '',
    dueTime: '',
    categoryOptions: [{ name: '无分类', color: '', id: '' }],
    categoryIndex: 0,
    titleFocus: false
  },

  onLoad(options) {
    this.loadCategories()

    if (options.id) {
      this.setData({ isEdit: true, todoId: options.id })
      wx.setNavigationBarTitle({ title: '编辑待办' })
      this.loadTodo(options.id)
    }
  },

  loadCategories() {
    storage.getCategories().then(categories => {
      const opts = [{ name: '无分类', color: '', id: '' }, ...categories]
      this.setData({ categoryOptions: opts })

      // 编辑模式下，设置当前分类索引
      if (this.data.categoryId) {
        const idx = opts.findIndex(c => (c.id || c._id) === this.data.categoryId)
        if (idx > 0) this.setData({ categoryIndex: idx })
      }
    })
  },

  loadTodo(id) {
    storage.getTodoById(id).then(todo => {
      if (!todo) {
        showToast('待办不存在')
        wx.navigateBack()
        return
      }

      const data = {
        title: todo.title,
        description: todo.description || '',
        priority: todo.priority,
        categoryId: todo.categoryId || ''
      }

      if (todo.dueDate) {
        const d = new Date(todo.dueDate)
        data.dueDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
        data.dueTime = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
      }

      this.setData(data)

      // 设置分类索引
      if (todo.categoryId) {
        const idx = this.data.categoryOptions.findIndex(
          c => (c.id || c._id) === todo.categoryId
        )
        if (idx > 0) this.setData({ categoryIndex: idx })
      }
    })
  },

  onTitleInput(e) {
    this.setData({ title: e.detail.value })
  },

  onTitleFocus() {
    this.setData({ titleFocus: true })
  },

  onTitleBlur() {
    this.setData({ titleFocus: false })
  },

  onDescInput(e) {
    this.setData({ description: e.detail.value })
  },

  setPriority(e) {
    this.setData({ priority: e.currentTarget.dataset.p })
  },

  onCategoryChange(e) {
    const index = Number(e.detail.value)
    const cat = this.data.categoryOptions[index]
    this.setData({
      categoryIndex: index,
      categoryId: cat.id || cat._id || ''
    })
  },

  onDateChange(e) {
    this.setData({ dueDate: e.detail.value })
    if (!this.data.dueTime) {
      this.setData({ dueTime: '23:59' })
    }
  },

  onTimeChange(e) {
    this.setData({ dueTime: e.detail.value })
  },

  clearDate() {
    this.setData({ dueDate: '', dueTime: '' })
  },

  onSave() {
    const { title, description, priority, categoryId, dueDate, dueTime, isEdit, todoId } = this.data

    if (!title.trim()) {
      showToast('请输入标题')
      return
    }

    const todoData = {
      title: title.trim(),
      description: description.trim(),
      priority,
      categoryId: categoryId || null,
      dueDate: parseDateTime(dueDate, dueTime)
    }

    const savePromise = isEdit
      ? storage.updateTodo(todoId, todoData)
      : storage.createTodo(todoData)

    savePromise.then(() => {
      if (!isEdit) sound.playCreate()
      showToast(isEdit ? '已更新' : '已创建')

      // 如果设了截止日期，请求订阅授权
      if (todoData.dueDate) {
        this.promptSubscription()
      }

      setTimeout(() => wx.navigateBack(), 500)
    }).catch(err => {
      console.error('保存失败:', err)
      showToast('保存失败')
    })
  },

  promptSubscription() {
    if (!hasPromptedSubscription()) {
      showSubscriptionGuide()
    } else {
      // 已引导过，静默请求（用户如果选了"总是保持"，不会弹窗）
      requestSubscription()
    }
  }
})
