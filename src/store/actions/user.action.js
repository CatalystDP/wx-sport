const config = require('../../config');
const SET_USER_INFO = 'set_user_info';
module.exports = {
    SET_USER_INFO,
    login(cb = () => { }) {

    },
    getUserInfo(cb = () => { }, option = {
        forceLogin: false
    }) {
        return function (dispatch, getState) {
            function setLoginStatus(status) {
                dispatch({
                    type: SET_USER_INFO,
                    userInfo: {
                        loginStatus: status
                    }
                })
            }
            new Promise((resolve, reject) => {
                if (option.forceLogin) {
                    setTimeout(() => {
                        resolve(true);
                    }, 0);
                    return;
                }
                wx.checkSession({
                    success: function () {
                        let session = wx.getStorageSync(config.sidName);
                        if (session) {
                            let checkStatus = {
                                ret: -1
                            };
                            // return wx.request({
                            //     url: config.host + '/wxdecrypt/login',
                            //     data: {
                            //         username: 'taddeng',
                            //         sid: session
                            //     },
                            //     method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
                            //     // header: {}, // 设置请求的 header
                            //     success: function (res) {
                            //         // success
                            //         if (!~~res.data.ret) {

                            //             checkStatus = {
                            //                 ret: 0,
                            //                 sid: session
                            //             };
                            //         } else {
                            //             checkStatus = {
                            //                 ret: res.data.ret
                            //             };
                            //         }
                            //     },
                            //     fail: function () {
                            //         // fail
                            //         checkStatus = { ret: -1 };
                            //     },
                            //     complete: function () {
                            //         // complete
                            //         cb(checkStatus);
                            //         resolve(!~~checkStatus.ret ? false : true);
                            //     }
                            // })
                            return resolve(false);
                        }
                        resolve(true);
                    },
                    fail: function () {
                        resolve(true);
                    }
                });
            }).then((needLogin) => {
                if(!needLogin){
                    cb({
                        ret:0
                    })
                    setLoginStatus(true);
                    return;
                }
                setLoginStatus(false);
                wx.login({
                    success: function (res) {
                        // success
                        let code = res.code;
                        wx.request({
                            url: config.host + '/wxdecrypt/login',
                            data: {
                                username:wx.getStorageSync('username'),
                                code: code
                            },
                            method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
                            // header: {}, // 设置请求的 header
                            success: function (res) {
                                // success
                                if (!~~res.data.ret) {
                                    if (res.data.session) {
                                        wx.setStorageSync(res.data.session.sidName, res.data.session.sidValue);
                                        setLoginStatus(true);
                                        return cb({
                                            ret: 0,
                                            sid: res.data.session.sidValue
                                        });
                                    }
                                }
                                setLoginStatus(false);
                                cb({
                                    ret: -1,
                                    msg: '登陆失败'
                                })
                            },
                            fail: function () {
                                // fail
                                setLoginStatus(false);
                                cb({ ret: -1, msg: '登陆失败' });
                            },
                            complete: function () {
                                // complete
                            }
                        })
                    },
                    fail: function () {
                        // fail
                        setLoginStatus(false);
                        reject();
                        cb({
                            ret: -1,
                            msg: '登录失败'
                        })
                    },
                    complete: function () {
                        // complete
                    }
                })
            });
        };
    },
    checkUserInfo(cb = () => { }) { }
};