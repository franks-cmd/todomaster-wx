const { PRIORITIES } = require('../../utils/constants')

Component({
  properties: {
    priority: {
      type: String,
      value: 'medium'
    }
  },

  observers: {
    priority(val) {
      const p = PRIORITIES[val]
      this.setData({ label: p ? p.label : '' })
    }
  },

  data: {
    label: '中'
  }
})
