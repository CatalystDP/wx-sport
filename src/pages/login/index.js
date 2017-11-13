const app = getApp();

let userAction = require('../../store/actions/user.action');
Page({
    returnPage:'',
    data: {
        userName:''
    },
    handleNameInput(e){
        this.setData({
            userName:e.detail.value
        });
    },
    login(){
        if(!this.data.userName){
            wx.showModal({
                content:'请输入正确的英文ID',
                showCancel:false
            })
            return;
        }
        try{
            wx.setStorageSync('username',this.data.userName);
        }catch(e){}
        let returnPage=decodeURIComponent(this.returnPage);
        wx.redirectTo({
            url: returnPage
        })
    },
    onLoad(query){
        console.log('onload ',query);
        this.returnPage=query.redirect;
    },
    onShow(options) {
    }
});