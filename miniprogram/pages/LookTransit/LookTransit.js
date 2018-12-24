// miniprogram/pages/LookTransit/LookTransit.js
const app = getApp()
const db = wx.cloud.database();
const _ = db.command;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    showIcon: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  bindLookTransit:function(e){
    let id = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '我与三人行',
      content: '该功能暂未开放，敬请期待',
    });
    return false;

    if(id==0){
      wx.navigateTo({
        url: '/pages/webViewPage/webViewPage?url=http://wap.coobus.cn/v2/#/favorite?code=constant',
      });
    }
    else{
      wx.navigateTo({
        url: '/pages/webViewPage/webViewPage?url=https://web.chelaile.net.cn/ch5/index.html?showFav=1&utm_source=weixinmp&wxckey=CK1298484483775&src=webapp_weixin_mp',
      });
    }
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})