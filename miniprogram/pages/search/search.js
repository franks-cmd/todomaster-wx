const storage = require('../../utils/storage')
const { debounce } = require('../../utils/util')

Page({
  data: {
    keyword: '',
    results: [],
    searched: false,
    categories: [],
    categoryOptions: [{ name: '所有分类', id: '' }],
    categoryIndex: 0,
    priorityOptions: [
      { label: '所有优先级', value: '' },
      { label: '高', value: 'high' },
      { label: '中', value: 'medium' },
      { label: '低', value: 'low' }
    ],
    priorityIndex: 0,
    statusOptions: [
      { label: '全部状态', value: '' },
      { label: '进行中', value: 'active' },
      { label: '已完成', value: 'completed' }
    ],
    statusIndex: 0
  },

  onLoad() {
    this._debouncedSearch = debounce(this.doSearch.bind(this), 300)

    storage.getCategories().then(categories => {
      const opts = [{ name: '所有分类', id: '' }, ...categories]
      this.setData({ categories, categoryOptions: opts })
    })
  },

  onKeywordInput(e) {
    this.setData({ keyword: e.detail.value })
    this._debouncedSearch()
  },

  clearKeyword() {
    this.setData({ keyword: '', results: [], searched: false })
  },

  onCategoryFilter(e) {
    this.setData({ categoryIndex: Number(e.detail.value) })
    this.doSearch()
  },

  onPriorityFilter(e) {
    this.setData({ priorityIndex: Number(e.detail.value) })
    this.doSearch()
  },

  onStatusFilter(e) {
    this.setData({ statusIndex: Number(e.detail.value) })
    this.doSearch()
  },

  doSearch() {
    const { keyword, categoryOptions, categoryIndex, priorityOptions, priorityIndex, statusOptions, statusIndex } = this.data

    const filters = {}

    if (keyword.trim()) {
      filters.keyword = keyword.trim()
    }

    const catId = categoryOptions[categoryIndex].id || categoryOptions[categoryIndex]._id
    if (catId) filters.categoryId = catId

    const priority = priorityOptions[priorityIndex].value
    if (priority) filters.priority = priority

    const status = statusOptions[statusIndex].value
    if (status === 'active') filters.completed = false
    else if (status === 'completed') filters.completed = true

    // 至少需要一个搜索条件
    if (!filters.keyword && !filters.categoryId && !filters.priority && filters.completed === undefined) {
      this.setData({ results: [], searched: false })
      return
    }

    storage.getTodos(filters).then(todos => {
      // 附加分类信息
      const catMap = {}
      this.data.categories.forEach(c => { catMap[c.id || c._id] = c })

      todos.forEach(t => {
        const cat = catMap[t.categoryId]
        t._categoryName = cat ? cat.name : ''
        t._categoryColor = cat ? cat.color : ''
      })

      this.setData({ results: todos, searched: true })
    })
  },

  onTodoTap(e) {
    wx.navigateTo({ url: `/pages/todo-detail/todo-detail?id=${e.detail.id}` })
  },

  onTodoToggle(e) {
    storage.toggleComplete(e.detail.id).then(() => {
      this.doSearch()
    })
  }
})
