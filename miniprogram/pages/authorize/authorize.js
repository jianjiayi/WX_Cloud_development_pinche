// miniprogram/pages/authorize/authorize.js
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    canIUse:wx.canIUse('button.open-type.getUserInfo'),
    active:false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let _this = this;
    //查看是否授权登录
    wx.getSetting({
      success:function (res){
        if(res.authSetting['scope.userInfo']){
          wx.getUserInfo({
            success:function(res){
              console.log(res);
              app.globalData.userInfo = res.userInfo;
              //用户已经登录
              wx.switchTab({
                url: '/pages/index/index',
              });
            }
          });
        }else{
          _this.setData({
            active:true,
          })
        }
      }
    });
  },

  //点击体验按钮
  bingGetUserInfo:function(e){
    let _this = this;
    if(e.detail.userInfo){//确定授权
      console.log(e.detail.userInfo);
      app.globalData.userInfo = e.detail.userInfo;
      wx.switchTab({
        url: '/pages/index/index',
      });
    }else{//取消授权
      wx.showModal({
        title: '警告',
        content: '您点击了拒绝授权，将无法进入小程序，请授权之后再进入!!!',
      });
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },
})