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
        'no-todos': {
          graphicType: 'notebook',
          title: '还没有待办事项',
          subtitle: '点击下方按钮创建第一个'
        },
        'no-results': {
          graphicType: 'search',
          title: '没有找到匹配的结果',
          subtitle: '试试其他关键词'
        },
        'no-categories': {
          graphicType: 'circle',
          title: '还没有分类',
          subtitle: '创建分类来组织你的待办'
        }
      }
      const item = map[val] || map['no-todos']
      this.setData(item)
    }
  },

  data: {
    graphicType: 'notebook',
    title: '还没有待办事项',
    subtitle: ''
  },

  methods: {
    onAction() {
      this.triggerEvent('action')
    }
  }
})
