const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const _ = db.command

// 订阅消息模板ID（需替换为实际申请的模板ID）
const TEMPLATE_ID = '-ZzYeykHOkj15FUon2XsT7SI-a0J8HjI0YHXOaNTbek'

// 提醒窗口：提前30分钟提醒
const REMINDER_WINDOW_MS = 30 * 60 * 1000

exports.main = async () => {
  const now = Date.now()

  console.log(`[check-reminders] 开始扫描, 当前时间: ${new Date(now).toISOString()}`)

  try {
    // 1. 查询所有未完成且有截止日期、且即将到期或已过期的待办
    const dueTodos = await db.collection('todos')
      .where({
        completed: false,
        dueDate: _.neq(null).and(_.lte(now + REMINDER_WINDOW_MS))
      })
      .limit(1000)
      .get()

    console.log(`[check-reminders] 找到 ${dueTodos.data.length} 个到期待办`)

    if (dueTodos.data.length === 0) return { sent: 0 }

    let sentCount = 0
    let failCount = 0

    for (const todo of dueTodos.data) {
      try {
        // 2. 检查是否已发送过提醒（防止重复）
        const logExists = await db.collection('reminder_logs')
          .where({
            todoId: todo._id,
            _openid: todo._openid
          })
          .limit(1)
          .get()

        if (logExists.data.length > 0) {
          continue // 已发送过，跳过
        }

        // 3. 判断提醒类型
        const isOverdue = todo.dueDate < now
        const reminderType = isOverdue ? 'overdue' : 'upcoming'
        const reminderNote = isOverdue
          ? '您的待办事项已过期，请尽快处理'
          : '您的待办事项即将到期'

        // 4. 发送订阅消息
        const dueDate = new Date(todo.dueDate)
        const dueDateStr = `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, '0')}-${String(dueDate.getDate()).padStart(2, '0')} ${String(dueDate.getHours()).padStart(2, '0')}:${String(dueDate.getMinutes()).padStart(2, '0')}`

        const priorityMap = { high: '高', medium: '中', low: '低' }

        await cloud.openapi.subscribeMessage.send({
          touser: todo._openid,
          templateId: TEMPLATE_ID,
          page: `pages/todo-detail/todo-detail?id=${todo._id}`,
          data: {
            thing1: { value: todo.title.substring(0, 20) },       // 事项主题
            thing2: { value: (todo.description || '无').substring(0, 20) }, // 事项描述
            phrase3: { value: priorityMap[todo.priority] || '中' }, // 紧急度
            time4: { value: dueDateStr },                          // 截止时间
            thing5: { value: reminderNote }                        // 备注消息
          }
        })

        // 5. 记录发送日志
        await db.collection('reminder_logs').add({
          data: {
            _openid: todo._openid,
            todoId: todo._id,
            sentAt: now,
            type: reminderType,
            success: true
          }
        })

        sentCount++
        console.log(`[check-reminders] 已提醒: "${todo.title}" -> ${todo._openid}`)

      } catch (err) {
        failCount++
        console.error(`[check-reminders] 发送失败 (${todo._id}):`, err.errCode, err.errMsg || err.message)

        // 记录失败日志（43101=用户未授权, 47003=模板不存在）
        if (err.errCode === 43101 || err.errCode === 47003) {
          await db.collection('reminder_logs').add({
            data: {
              _openid: todo._openid,
              todoId: todo._id,
              sentAt: now,
              type: todo.dueDate < now ? 'overdue' : 'upcoming',
              success: false
            }
          })
        }
      }
    }

    console.log(`[check-reminders] 完成. 发送成功: ${sentCount}, 失败: ${failCount}`)
    return { sent: sentCount, failed: failCount }

  } catch (err) {
    console.error('[check-reminders] 执行错误:', err)
    return { error: err.message }
  }
}
