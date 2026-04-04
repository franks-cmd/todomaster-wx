Component({
  properties: {
    categories: { type: Array, value: [] },
    activeStatus: { type: String, value: 'all' },
    activeCategoryId: { type: String, value: '' },
    activePriority: { type: String, value: '' }
  },

  methods: {
    onStatusChange(e) {
      const status = e.currentTarget.dataset.status
      this.triggerEvent('filterChange', {
        status,
        categoryId: this.properties.activeCategoryId,
        priority: this.properties.activePriority
      })
    },

    onCategoryChange(e) {
      const categoryId = e.currentTarget.dataset.id
      this.triggerEvent('filterChange', {
        status: this.properties.activeStatus,
        categoryId,
        priority: this.properties.activePriority
      })
    },

    onPriorityChange(e) {
      const priority = e.currentTarget.dataset.priority
      this.triggerEvent('filterChange', {
        status: this.properties.activeStatus,
        categoryId: this.properties.activeCategoryId,
        priority
      })
    }
  }
})
