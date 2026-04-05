const { SUBSCRIBE_TEMPLATE_ID } = require('./constants')

/**
 * 请求订阅消息授权
 * 引导用户勾选"总是保持以上选择"获取长期订阅
 * 只能在用户点击事件中调用
 */
function requestSubscription() {
  return new Promise((resolve) => {
    if (!SUBSCRIBE_TEMPLATE_ID || SUBSCRIBE_TEMPLATE_ID === 'YOUR_TEMPLATE_ID') {
      console.warn('订阅消息模板ID未配置')
      resolve(false)
      return
    }

    wx.requestSubscribeMessage({
      tmplIds: [SUBSCRIBE_TEMPLATE_ID],
      success(res) {
        const accepted = res[SUBSCRIBE_TEMPLATE_ID] === 'accept'
        if (accepted) {
          console.log('用户已授权订阅消息')
        }
        resolve(accepted)
      },
      fail(err) {
        console.error('请求订阅授权失败:', err)
        resolve(false)
      }
    })
  })
}

/**
 * 检查是否已经引导过用户授权
 */
function hasPromptedSubscription() {
  return wx.getStorageSync('TODOMASTER_SUB_PROMPTED') === true
}

/**
 * 标记已引导过
 */
function markSubscriptionPrompted() {
  wx.setStorageSync('TODOMASTER_SUB_PROMPTED', true)
}

/**
 * 显示引导提示，解释长期订阅的好处
 */
function showSubscriptionGuide() {
  return new Promise((resolve) => {
    wx.showModal({
      title: '开启待办提醒',
      content: '开启后，待办事项到期时会通过微信消息提醒你。建议在弹窗中勾选"总是保持以上选择"，这样以后所有待办都能自动提醒。',
      confirmText: '开启',
      cancelText: '暂不',
      confirmColor: '#C4572A',
      success(res) {
        if (res.confirm) {
          requestSubscription().then(resolve)
        } else {
          resolve(false)
        }
        markSubscriptionPrompted()
      }
    })
  })
}

module.exports = {
  requestSubscription,
  hasPromptedSubscription,
  markSubscriptionPrompted,
  showSubscriptionGuide
}
