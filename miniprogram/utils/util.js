/**
 * 生成唯一 ID
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

/**
 * 格式化日期为 YYYY-MM-DD
 */
function formatDate(timestamp) {
  if (!timestamp) return ''
  const d = new Date(timestamp)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/**
 * 格式化时间为 HH:mm
 */
function formatTime(timestamp) {
  if (!timestamp) return ''
  const d = new Date(timestamp)
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${h}:${min}`
}

/**
 * 格式化日期时间为 YYYY-MM-DD HH:mm
 */
function formatDateTime(timestamp) {
  if (!timestamp) return ''
  return `${formatDate(timestamp)} ${formatTime(timestamp)}`
}

/**
 * 格式化为相对时间
 */
function formatRelativeTime(timestamp) {
  if (!timestamp) return ''
  const now = Date.now()
  const diff = timestamp - now

  if (diff < 0) {
    // 已过期
    const absDiff = Math.abs(diff)
    if (absDiff < 60 * 1000) return '刚刚过期'
    if (absDiff < 60 * 60 * 1000) return `已过期 ${Math.floor(absDiff / 60000)} 分钟`
    if (absDiff < 24 * 60 * 60 * 1000) return `已过期 ${Math.floor(absDiff / 3600000)} 小时`
    return `已过期 ${Math.floor(absDiff / 86400000)} 天`
  }

  if (diff < 60 * 1000) return '即将到期'
  if (diff < 60 * 60 * 1000) return `${Math.floor(diff / 60000)} 分钟后`
  if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / 3600000)} 小时后`
  if (diff < 7 * 24 * 60 * 60 * 1000) return `${Math.floor(diff / 86400000)} 天后`
  return formatDate(timestamp)
}

/**
 * 获取截止日期的状态类型
 */
function getDueStatus(timestamp) {
  if (!timestamp) return 'none'
  const now = Date.now()
  const diff = timestamp - now
  if (diff < 0) return 'overdue'
  if (diff < 24 * 60 * 60 * 1000) return 'urgent'
  if (diff < 3 * 24 * 60 * 60 * 1000) return 'soon'
  return 'normal'
}

/**
 * 解析日期字符串 + 时间字符串为时间戳
 */
function parseDateTime(dateStr, timeStr) {
  if (!dateStr) return null
  const time = timeStr || '23:59'
  return new Date(`${dateStr}T${time}:00`).getTime()
}

/**
 * 防抖函数
 */
function debounce(fn, delay) {
  let timer = null
  return function (...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
      timer = null
    }, delay)
  }
}

/**
 * 显示提示
 */
function showToast(title, icon = 'none') {
  wx.showToast({ title, icon, duration: 2000 })
}

/**
 * 显示确认弹窗
 */
function showConfirm(content, title = '提示') {
  return new Promise((resolve) => {
    wx.showModal({
      title,
      content,
      confirmText: '确定',
      cancelText: '取消',
      confirmColor: '#C4572A',
      success: (res) => resolve(res.confirm)
    })
  })
}

module.exports = {
  generateId,
  formatDate,
  formatTime,
  formatDateTime,
  formatRelativeTime,
  getDueStatus,
  parseDateTime,
  debounce,
  showToast,
  showConfirm
}
