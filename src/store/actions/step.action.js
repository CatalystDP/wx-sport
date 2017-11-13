const userAction = require('./user.action');
const config = require('../../config');
const SET_CUR_STEP = 'set_cur_step';
const SET_TARGET_STEP = 'set_target_step';
module.exports = {
    SET_CUR_STEP,
    SET_TARGET_STEP,
    getWxSport(cb = () => { }) {
        return (dispatch, getState) => {
            wx.checkSession({
                success: function (res) {
                    wx.getWeRunData({
                        success(res) {
                            if (getState().user.loginStatus) {
                                wx.request({
                                    url: config.host + '/wxdecrypt/sport',
                                    data: {
                                        username:wx.getStorageSync('username'),
                                        sid: wx.getStorageSync(config.sidName),
                                        encData: res.encryptedData,
                                        iv: res.iv
                                    },
                                    method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
                                    // header: {}, // 设置请求的 header
                                    success: function (res) {
                                        // success
                                        if (!~~res.data.ret) {
                                            dispatch({
                                                type: SET_CUR_STEP,
                                                stepData: res.data.stepData
                                            });
                                            cb({
                                                ret: 0
                                            });
                                        }
                                        else if(res.data.ret==2){
                                            //登录过期
                                            cb({
                                                ret:res.data.ret
                                            })
                                        } 
                                        else {
                                            cb({
                                                ret: res.data.ret
                                            });
                                        }
                                    },
                                    fail: function () {
                                        // fail
                                        cb({
                                            ret: -1,
                                            msg: '获取步数失败'
                                        })
                                    },
                                    complete: function () {
                                        // complete
                                    }
                                })
                            }
                        },
                        fail() {
                            // relogin();
                            cb({
                                ret: -1,
                                msg: '获取步数失败'
                            })
                        }
                    });
                    // success
                },
                fail: function () {
                    // fail
                    // relogin();
                    cb({
                        ret: -1,
                        msg: '获取步数失败'
                    })
                },
                complete: function () {
                    // complete
                }
            })
        };
    }
};