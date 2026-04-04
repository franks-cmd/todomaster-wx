Component({
  properties: {
    show: { type: Boolean, value: false },
    reminders: { type: Array, value: [] }
  },

  methods: {
    onClose() {
      this.triggerEvent('close')
    },

    onMarkDone(e) {
      const index = e.currentTarget.dataset.index
      const reminder = this.properties.reminders[index]
      if (reminder) {
        this.triggerEvent('markDone', { todoId: reminder.todo.id })
      }
    },

    onDismiss(e) {
      const index = e.currentTarget.dataset.index
      const reminder = this.properties.reminders[index]
      if (reminder) {
        this.triggerEvent('dismiss', { todoId: reminder.todo.id })
      }
    },

    noop() {}
  }
})
