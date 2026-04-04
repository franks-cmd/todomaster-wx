const { formatRelativeTime, getDueStatus } = require('../../utils/util')

Component({
  properties: {
    todo: { type: Object, value: {} },
    categoryName: { type: String, value: '' },
    categoryColor: { type: String, value: '' },
    sortMode: { type: Boolean, value: false }
  },

  observers: {
    'todo.dueDate'(dueDate) {
      if (!dueDate || this.properties.todo.completed) {
        this.setData({ dueText: '', dueStatusClass: '' })
        return
      }
      const status = getDueStatus(dueDate)
      this.setData({
        dueText: formatRelativeTime(dueDate),
        dueStatusClass: status === 'overdue' ? 'due-overdue' :
                         status === 'urgent' ? 'due-urgent' : ''
      })
    }
  },

  data: {
    dueText: '',
    dueStatusClass: '',
    offsetX: 0,
    showDelete: false,
    startX: 0,
    startY: 0,
    moving: false
  },

  methods: {
    onTap() {
      if (this.data.showDelete) {
        this.setData({ offsetX: 0, showDelete: false })
        return
      }
      this.triggerEvent('tap', { id: this.properties.todo.id })
    },

    onToggle() {
      this.triggerEvent('toggle', { id: this.properties.todo.id })
    },

    onDelete() {
      this.setData({ offsetX: 0, showDelete: false })
      this.triggerEvent('delete', { id: this.properties.todo.id })
    },

    onTouchStart(e) {
      if (this.properties.sortMode) return
      this.setData({
        startX: e.touches[0].clientX,
        startY: e.touches[0].clientY,
        moving: false
      })
    },

    onTouchMove(e) {
      if (this.properties.sortMode) return
      const deltaX = e.touches[0].clientX - this.data.startX
      const deltaY = e.touches[0].clientY - this.data.startY

      // 判断是否为水平滑动
      if (!this.data.moving) {
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
          this.data.moving = true
        } else {
          return
        }
      }

      if (deltaX < 0) {
        const offset = Math.max(deltaX, -160)
        this.setData({ offsetX: offset })
      } else if (this.data.showDelete) {
        const offset = Math.min(deltaX - 160, 0)
        this.setData({ offsetX: offset })
      }
    },

    onTouchEnd() {
      if (this.properties.sortMode) return
      if (this.data.offsetX < -80) {
        this.setData({ offsetX: -160, showDelete: true })
      } else {
        this.setData({ offsetX: 0, showDelete: false })
      }
    },

    noop() {}
  }
})
