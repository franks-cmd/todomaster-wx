App({
  globalData: {
    openid: null,
    storageMode: 'local', // 'local' or 'cloud'
    categories: [],
    pendingReminders: [],
    cloudEnv: 'cloud1-9gz2y4r6fe5cdcb0'
  },

  onLaunch() {
    // 读取存储模式设置
    const settings = wx.getStorageSync('TODOMASTER_SETTINGS') || {}
    this.globalData.storageMode = settings.storageMode || 'local'

    // 初始化云开发环境
    if (wx.cloud) {
      wx.cloud.init({
        env: this.globalData.cloudEnv,
        traceUser: true
      })
    }

    // 获取 openid（订阅消息需要）
    this.getOpenId()
  },

  onShow() {
    // 每次前台显示时检查到期提醒
    const reminder = require('./utils/reminder')
    reminder.checkDueTodos().then(reminders => {
      if (reminders && reminders.length > 0) {
        this.globalData.pendingReminders = reminders
      }
    })
  },

  getOpenId() {
    if (this.globalData.openid) return Promise.resolve(this.globalData.openid)

    return wx.cloud.callFunction({
      name: 'login'
    }).then(res => {
      this.globalData.openid = res.result.openid
      return res.result.openid
    }).catch(err => {
      console.error('获取 openid 失败:', err)
      return null
    })
  }
})
