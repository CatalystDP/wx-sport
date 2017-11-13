//index.js
//获取应用实例
var app = getApp()
//# npm redux/dist/redux.min.js libs redux
const wxChart = require('../../libs/wxcharts-min');
let stepAction = require('../../store/actions/step.action');
let userAction = require('../../store/actions/user.action');
const util = require('../../libs/util');
Page({
  stepChart: null,

  data: {
    lastLoginStatus: false,
    curStep: 0,
    avgStep: 0,
    allowShow: false,
    maxStatisStep: 0
  },

  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  handleTapDetail() {
    console.log('go to detail');
  },
  handleTapPerson(){
    console.log('go to person');
  },
  drawBottomCircle() {
    var cxt_arc = wx.createCanvasContext('step-bottom');
    cxt_arc.setLineWidth(5);
    cxt_arc.setStrokeStyle('#eaeaea');
    cxt_arc.setLineCap('round');
    cxt_arc.beginPath();
    cxt_arc.arc(150, 150, 100, 0, 2 * Math.PI, false);
    cxt_arc.stroke();
    cxt_arc.draw();
  },
  getAvgStep(stepList) {
    let weekSteps = this.getWeekSteps(stepList),
      len = weekSteps.length;
    if (len == 0) return 0;
    let s = 0;
    weekSteps.forEach(step => {
      s += step;
    });
    return ~~(s / len);
  },
  getWeekSteps(stepList) {
    let lastTimeStamp = stepList[stepList.length - 1].timestamp;
    let lastDay = new Date(lastTimeStamp * 1000).getDay();
    let start = lastDay || 7;//表示当前是周日
    let end = 1;//周一
    let lastIdx = stepList.length - 1;
    let steps = [];
    while (start >= end) {
      if (lastIdx < 0) break;
      steps.unshift(stepList[lastIdx].step);
      --lastIdx;
      --start;
    }
    return steps;
  },
  drawStepCircle() {
    let store = app.globalData.store;
    let stepList = store.getState().step.stepData.stepInfoList;
    if (!stepList) return;
    if (!util.lang.isArray(stepList)) return;
    this.drawStatis();
    this.setData({
      maxStatisStep: store.getState().step.maxStatisStep
    });//设置统计最大值
    if (stepList.length == 0) return;
    let curStep = stepList[stepList.length - 1].step;
    this.setData({
      curStep,
      avgStep: this.getAvgStep(stepList)
    });
    let percent = curStep / store.getState().step.targetStep;
    console.log(percent);
    if (percent == 0) return;
    var cxt_arc = wx.createCanvasContext('step-ring');
    cxt_arc.setLineWidth(6);
    cxt_arc.setStrokeStyle('#7cb5ec');
    cxt_arc.setLineCap('round');
    cxt_arc.beginPath();
    cxt_arc.arc(150, 150, 100, -Math.PI / 2, (2 * Math.PI * percent) - Math.PI / 2, false);
    cxt_arc.stroke();
    cxt_arc.draw();
  },
  onReady() {
  },
  _onStateChange() {
    let userState = app.globalData.store.getState().user;
    if (this.data.lastLoginStatus != userState.loginStatus) {
      this.data.lastLoginStatus = userState.loginStatus;
      this.showStep();
    }
  },
  showStep() {
    let userState = app.globalData.store.getState().user;
    let store = app.globalData.store;
    if (userState.loginStatus) {
      this.drawStepCircle();
    }
  },
  getWxRunData() {

    app.globalData.store.dispatch(stepAction.getWxSport(stepRes => {
      if (!~~stepRes.ret) {
        this.showStep();
      } else if (stepRes.ret == -2 || stepRes.ret == 2 || stepRes.ret == 4) {
        app.globalData.store.dispatch(userAction.getUserInfo((loginRes) => {
          if (!~~loginRes.ret) {
            this.getWxRunData();
          }
        }, { forceLogin: true }));
      } else if (stepRes.ret == 3) {
        let returnPage = encodeURIComponent('../index/index');
        wx.redirectTo({
          url: `../login/index?noauth=1&redirect=${returnPage}`
        })
      }

    }));
  },
  onShow() {
    if (!this.data.allowShow) return;
    this.drawBottomCircle();
    console.log(app.globalData.store.getState());
    this.unsubscribe = app.globalData.store.subscribe(this._onStateChange.bind(this));
    var that = this
    let store = app.globalData.store;
    //调用应用实例的方法获取全局数据
    store.dispatch(userAction.getUserInfo(res => {
      if (!~~res.ret) {
        this.getWxRunData();
        app.getUserInfo(function (userInfo) {
          //更新数据
          that.setData({
            userInfo: userInfo
          })
        });
      } else if (res.ret == 3) {
        //未授权用户，跳登陆页
        wx.redirectTo({
          url: '../login/index?noauth=1',
        })
      }
    }));
  },
  onHide() {
    try {

      this.unsubscribe();
    } catch (e) {

    }
  },
  onUnload() {
    try {

      this.unsubscribe();
    } catch (e) {

    }
  },
  onLoad: function () {
    if (!wx.getStorageSync('username')) {
      let returnPage = encodeURIComponent('../index/index');
      wx.redirectTo({
        url: `../login/index?noinit=1&redirect=${returnPage}`
      });
      return;
      //没有username缓存时，跳登陆页
    }
    this.setData({
      allowShow: true
    });
  },
  drawStatis() {
    let store = app.globalData.store;
    let stepList = store.getState().step.stepData.stepInfoList;
    if (!stepList) return;
    let weekSteps = this.getWeekSteps(stepList);
    var windowWidth = 320;
    try {
      var res = wx.getSystemInfoSync();
      windowWidth = res.windowWidth;
    } catch (e) {
    }
    let today = ~~(Date.now() / 1000) * 1000;
    let dates = [];
    for (let i = weekSteps.length - 1; i >= 0; --i) {
      let date = new Date(today);
      dates.unshift(date.getMonth() + 1 + '-' + date.getDate());
      today -= 24 * 3600 * 1000;
    }
    this.stepChart = new wxChart({
      canvasId: 'statis-canvas',
      type: 'line',
      // categories: simulationData.categories,
      categories: dates,
      animation: true,
      background: '#ffffff',
      legend: false,
      series: [{
        name: '步数',
        data: weekSteps,
        color: '#E55442'
      }],
      xAxis: {
        fontColor: '#797C84',
        // gridColor: '#ffffff',
        disableGrid: true
      },
      yAxis: {
        // disabled: true,
        min: 0,
        max: store.getState().step.maxStatisStep
      },
      width: windowWidth,
      height: 150,
      dataLabel: false,
      dataPointShape: true,
      extra: {
        lineStyle: 'straight'
      }
    });
  },
  handleStatisTouch(e) {
    console.log(e);
    if (this.stepChart) {
      this.stepChart.showToolTip(e, {
        background: '#E55442'
      });
    }
  }
})
