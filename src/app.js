//app.js
let store = require('./store/index');
let userAction = require('./store/actions/user.action');
let stepAction = require('./store/actions/step.action');
App({
  onLaunch: function () {
    //调用API从本地缓存中获取数据
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    //读取目标步数，没有就默认设置10000步
    let targetStep = null;
    try {
      targetStep = wx.getStorageSync('targetStep');
    } catch (e) {

    }
    if (!targetStep) {
      targetStep = 10000;
      wx.setStorageSync('targetStep', targetStep);
    }
    store.dispatch({
      type: stepAction.SET_TARGET_STEP,
      targetStep
    });
  },
  onShow() {
  },
  getUserInfo: function (cb) {
    var that = this
    if (this.globalData.userInfo) {
      typeof cb == "function" && cb(this.globalData.userInfo)
    } else {
      //调用登录接口
      wx.getUserInfo({
        success: function (res) {
          that.globalData.userInfo = res.userInfo
          typeof cb == "function" && cb(that.globalData.userInfo)
        }
      })
    }
  },
  globalData: {
    userInfo: null,
    store
  }
})