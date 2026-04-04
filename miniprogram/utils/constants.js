// 存储键名
const STORAGE_KEYS = {
  TODOS: 'TODOMASTER_TODOS',
  CATEGORIES: 'TODOMASTER_CATEGORIES',
  SETTINGS: 'TODOMASTER_SETTINGS'
}

// 优先级定义
const PRIORITIES = {
  high: { label: '高', color: '#D94F4F', bgColor: 'rgba(217,79,79,0.1)' },
  medium: { label: '中', color: '#E09F3E', bgColor: 'rgba(224,159,62,0.1)' },
  low: { label: '低', color: '#5B8FB9', bgColor: 'rgba(91,143,185,0.1)' }
}

const PRIORITY_LIST = ['high', 'medium', 'low']

// 预设分类颜色
const PRESET_COLORS = [
  '#D94F4F', '#E09F3E', '#C17F59', '#5B8FB9',
  '#7A9E7E', '#8B6DB0', '#D4728C', '#5BBFB5',
  '#6B8EC4', '#C4956B', '#9B8EC4', '#4DAFB8',
  '#D4A574', '#7EA897', '#B07AA5', '#5A7184'
]

// 默认分类
const DEFAULT_CATEGORIES = [
  { id: 'cat_work', name: '工作', color: '#5B8FB9' },
  { id: 'cat_personal', name: '个人', color: '#7A9E7E' },
  { id: 'cat_study', name: '学习', color: '#8B6DB0' },
  { id: 'cat_life', name: '生活', color: '#C17F59' }
]

// 筛选状态
const FILTER_STATUS = {
  ALL: 'all',
  ACTIVE: 'active',
  COMPLETED: 'completed'
}

// 订阅消息模板ID（需要在微信公众平台申请后替换）
const SUBSCRIBE_TEMPLATE_ID = 'YOUR_TEMPLATE_ID'

// 提醒窗口（提前多少毫秒提醒）
const REMINDER_WINDOW = 30 * 60 * 1000 // 30分钟

module.exports = {
  STORAGE_KEYS,
  PRIORITIES,
  PRIORITY_LIST,
  PRESET_COLORS,
  DEFAULT_CATEGORIES,
  FILTER_STATUS,
  SUBSCRIBE_TEMPLATE_ID,
  REMINDER_WINDOW
}
