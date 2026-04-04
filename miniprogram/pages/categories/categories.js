const storage = require('../../utils/storage')
const { PRESET_COLORS } = require('../../utils/constants')
const { showToast, showConfirm } = require('../../utils/util')

Page({
  data: {
    categories: [],
    showModal: false,
    modalName: '',
    modalColor: PRESET_COLORS[0],
    editIndex: -1
  },

  onShow() {
    this.loadCategories()
  },

  loadCategories() {
    Promise.all([
      storage.getCategories(),
      storage.getTodos()
    ]).then(([categories, todos]) => {
      // 统计每个分类的待办数量
      categories.forEach(cat => {
        const catId = cat.id || cat._id
        cat._todoCount = todos.filter(t => t.categoryId === catId).length
      })
      this.setData({ categories })
    })
  },

  showAddModal() {
    this.setData({
      showModal: true,
      modalName: '',
      modalColor: PRESET_COLORS[0],
      editIndex: -1
    })
  },

  hideModal() {
    this.setData({ showModal: false })
  },

  onEditCategory(e) {
    const index = e.currentTarget.dataset.index
    const cat = this.data.categories[index]
    this.setData({
      showModal: true,
      modalName: cat.name,
      modalColor: cat.color,
      editIndex: index
    })
  },

  onModalNameInput(e) {
    this.setData({ modalName: e.detail.value })
  },

  onModalColorChange(e) {
    this.setData({ modalColor: e.detail.color })
  },

  onSaveCategory() {
    const { modalName, modalColor, editIndex, categories } = this.data

    if (!modalName.trim()) {
      showToast('请输入分类名称')
      return
    }

    if (editIndex >= 0) {
      // 编辑
      const cat = categories[editIndex]
      storage.updateCategory(cat.id || cat._id, {
        name: modalName.trim(),
        color: modalColor
      }).then(() => {
        showToast('已更新')
        this.hideModal()
        this.loadCategories()
      })
    } else {
      // 新建
      storage.createCategory({
        name: modalName.trim(),
        color: modalColor
      }).then(() => {
        showToast('已创建')
        this.hideModal()
        this.loadCategories()
      })
    }
  },

  onDeleteCategory(e) {
    const index = e.currentTarget.dataset.index
    const cat = this.data.categories[index]
    const count = cat._todoCount || 0
    const msg = count > 0
      ? `删除"${cat.name}"后，${count} 个待办将失去分类，确定吗？`
      : `确定要删除"${cat.name}"吗？`

    showConfirm(msg).then(confirmed => {
      if (confirmed) {
        storage.deleteCategory(cat.id || cat._id).then(() => {
          showToast('已删除')
          this.loadCategories()
        })
      }
    })
  },

  noop() {}
})
