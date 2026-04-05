const storage = require('../../utils/storage')
const { showToast, showConfirm } = require('../../utils/util')
const { requestSubscription, showSubscriptionGuide } = require('../../utils/subscription')

Page({
  data: {
    storageMode: 'local'
  },

  onShow() {
    this.setData({
      storageMode: storage.getStorageMode()
    })
  },

  switchStorage(e) {
    const newMode = e.currentTarget.dataset.mode
    const currentMode = this.data.storageMode

    if (newMode === currentMode) return

    if (newMode === 'cloud') {
      // 本地 → 云端
      wx.showModal({
        title: '切换到云端存储',
        content: '是否将本地数据迁移到云端？',
        confirmText: '迁移',
        cancelText: '不迁移',
        confirmColor: '#C4572A',
        success: (res) => {
          if (res.confirm) {
            // 迁移数据
            wx.showLoading({ title: '迁移中...' })
            storage.localStore.getAllData().then(data => {
              return storage.cloudStore.importData(data)
            }).then(() => {
              storage.setStorageMode('cloud')
              this.setData({ storageMode: 'cloud' })
              wx.hideLoading()
              showToast('迁移成功')
            }).catch(err => {
              wx.hideLoading()
              console.error('迁移失败:', err)
              showToast('迁移失败，请检查网络')
            })
          } else if (res.cancel) {
            // 不迁移，直接切换
            storage.setStorageMode('cloud')
            this.setData({ storageMode: 'cloud' })
            showToast('已切换到云端')
          }
        }
      })
    } else {
      // 云端 → 本地
      wx.showModal({
        title: '切换到本地存储',
        content: '是否将云端数据下载到本地？云端数据不会被删除。',
        confirmText: '下载',
        cancelText: '不下载',
        confirmColor: '#C4572A',
        success: (res) => {
          if (res.confirm) {
            wx.showLoading({ title: '下载中...' })
            storage.cloudStore.getAllData().then(data => {
              return storage.localStore.importData(data)
            }).then(() => {
              storage.setStorageMode('local')
              this.setData({ storageMode: 'local' })
              wx.hideLoading()
              showToast('下载成功')
            }).catch(err => {
              wx.hideLoading()
              console.error('下载失败:', err)
              showToast('下载失败，请检查网络')
            })
          } else if (res.cancel) {
            storage.setStorageMode('local')
            this.setData({ storageMode: 'local' })
            showToast('已切换到本地')
          }
        }
      })
    }
  },

  onSubscribe() {
    showSubscriptionGuide()
  },

  exportData() {
    storage.getAllData().then(data => {
      const json = JSON.stringify(data, null, 2)
      // 写到剪贴板
      wx.setClipboardData({
        data: json,
        success() {
          showToast('已复制到剪贴板')
        }
      })
    })
  },

  clearData() {
    showConfirm('确定要清除所有数据吗？此操作不可撤销！').then(confirmed => {
      if (confirmed) {
        storage.clearAllData().then(() => {
          showToast('已清除')
        })
      }
    })
  }
})
