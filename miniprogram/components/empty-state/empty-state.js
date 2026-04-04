Component({
  properties: {
    type: {
      type: String,
      value: 'no-todos'  // 'no-todos' | 'no-results' | 'no-categories'
    },
    actionText: { type: String, value: '' }
  },

  observers: {
    type(val) {
      const map = {
        'no-todos': { icon: '📋', message: '还没有待办事项\n点击下方按钮创建第一个' },
        'no-results': { icon: '🔍', message: '没有找到匹配的结果\n试试其他关键词' },
        'no-categories': { icon: '📁', message: '还没有分类\n创建分类来组织你的待办' }
      }
      const item = map[val] || map['no-todos']
      this.setData({ icon: item.icon, message: item.message })
    }
  },

  data: {
    icon: '📋',
    message: '还没有待办事项'
  },

  methods: {
    onAction() {
      this.triggerEvent('action')
    }
  }
})
