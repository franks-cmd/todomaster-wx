const { PRESET_COLORS } = require('../../utils/constants')

Component({
  properties: {
    value: { type: String, value: '' },
    colors: { type: Array, value: PRESET_COLORS }
  },

  methods: {
    onSelect(e) {
      const color = e.currentTarget.dataset.color
      this.triggerEvent('change', { color })
    }
  }
})
