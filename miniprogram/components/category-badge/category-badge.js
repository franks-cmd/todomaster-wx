Component({
  properties: {
    name: { type: String, value: '' },
    color: { type: String, value: '#5A7184' },
    size: { type: String, value: 'default' }  // 'default' | 'small'
  },

  observers: {
    color(val) {
      // 生成半透明背景色
      this.setData({
        bgColor: this._hexToRgba(val, 0.12)
      })
    }
  },

  data: {
    bgColor: 'rgba(90, 113, 132, 0.12)'
  },

  methods: {
    _hexToRgba(hex, alpha) {
      if (!hex) return `rgba(90, 113, 132, ${alpha})`
      hex = hex.replace('#', '')
      const r = parseInt(hex.substring(0, 2), 16)
      const g = parseInt(hex.substring(2, 4), 16)
      const b = parseInt(hex.substring(4, 6), 16)
      return `rgba(${r}, ${g}, ${b}, ${alpha})`
    }
  }
})
