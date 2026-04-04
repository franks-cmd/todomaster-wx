const storage = require('./storage')
const { REMINDER_WINDOW } = require('./constants')
const { formatRelativeTime } = require('./util')

/**
 * 检查到期和即将到期的待办
 * 在 app.onShow 和 index.onShow 时调用
 */
function checkDueTodos() {
  return storage.getTodos({ completed: false }).then(todos => {
    const now = Date.now()
    const reminders = []

    todos.forEach(todo => {
      if (!todo.dueDate) return

      const diff = todo.dueDate - now

      if (diff < 0) {
        // 已过期
        reminders.push({
          todo,
          type: 'overdue',
          message: `"${todo.title}" ${formatRelativeTime(todo.dueDate)}`
        })
      } else if (diff <= REMINDER_WINDOW) {
        // 即将到期（30分钟内）
        reminders.push({
          todo,
          type: 'upcoming',
          message: `"${todo.title}" 将在 ${formatRelativeTime(todo.dueDate)} 到期`
        })
      }
    })

    // 按紧急程度排序：过期的排前面，然后按到期时间升序
    reminders.sort((a, b) => {
      if (a.type === 'overdue' && b.type !== 'overdue') return -1
      if (a.type !== 'overdue' && b.type === 'overdue') return 1
      return a.todo.dueDate - b.todo.dueDate
    })

    return reminders
  }).catch(err => {
    console.error('检查提醒失败:', err)
    return []
  })
}

module.exports = {
  checkDueTodos
}
