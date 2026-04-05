// 存储键名
const STORAGE_KEYS = {
  TODOS: 'TODOMASTER_TODOS',
  CATEGORIES: 'TODOMASTER_CATEGORIES',
  SETTINGS: 'TODOMASTER_SETTINGS'
}

// 优先级定义
const PRIORITIES = {
  high: { label: '高', color: '#C4572A', bgColor: 'rgba(196,87,42,0.08)' },
  medium: { label: '中', color: '#D4943A', bgColor: 'rgba(212,148,58,0.08)' },
  low: { label: '低', color: '#6B8FAD', bgColor: 'rgba(107,143,173,0.08)' }
}

const PRIORITY_LIST = ['high', 'medium', 'low']

// 预设分类颜色
const PRESET_COLORS = [
  '#C4572A', '#D4943A', '#4A7C59', '#6B8FAD',
  '#8B6DB0', '#D4728C', '#5BBFB5', '#C4956B',
  '#7EA897', '#B07AA5', '#4DAFB8', '#9B8EC4',
  '#D4A574', '#5A7184', '#A0522D', '#708090'
]

// 默认分类
const DEFAULT_CATEGORIES = [
  { id: 'cat_work', name: '工作', color: '#6B8FAD' },
  { id: 'cat_personal', name: '个人', color: '#4A7C59' },
  { id: 'cat_study', name: '学习', color: '#8B6DB0' },
  { id: 'cat_life', name: '生活', color: '#D4943A' }
]

// 筛选状态
const FILTER_STATUS = {
  ALL: 'all',
  ACTIVE: 'active',
  COMPLETED: 'completed'
}

// 订阅消息模板ID（需要在微信公众平台申请后替换）
const SUBSCRIBE_TEMPLATE_ID = '-ZzYeykHOkj15FUon2XsT7SI-a0J8HjI0YHXOaNTbek'

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
