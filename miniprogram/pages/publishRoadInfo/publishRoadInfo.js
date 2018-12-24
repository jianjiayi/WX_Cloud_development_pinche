// miniprogram/pages/publishRoadInfo/publishRoadInfo.js
const app = getApp()
const db = wx.cloud.database();

// 引入SDK核心类
var QQMapWX = require('../../utils/qqmap-wx-jssdk.min.js');

// 实例化API核心类
var qqmapsdk = new QQMapWX({
  key: 'PELBZ-ACHRK-JHUJL-A553S-2WYMF-VYBQO' // 必填
});

Page({

  /**
   * 页面的初始数据
   */
  data: {
    showIcon: true,

    title:'',//标题
    contText:'',//内容
    imgArray:[],//图片数组
    location:{
      address:'',
      name:'',
      latitude:'',
      longitude:''
    },//地理位置
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let _this = this;
    _this.onGetLocation();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  //获取地理位置授权
  onGetLocation:function(){
    let _this = this;
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        if (res && res.longitude) {
          console.log(res);
          // 将坐标转换成位置
          qqmapsdk.reverseGeocoder({
            location: {
              latitude: res.latitude,
              longitude: res.longitude
            },
            success: function (json) {
              console.log(json);
              _this.data.location.latitude = json.result.location.lat;
              _this.data.location.longitude = json.result.location.lng;
              _this.data.location.address = json.result.address;
              _this.data.location.name = json.result.formatted_addresses.recommend;
              _this.setData({
                location : _this.data.location
              })
            }
          });
        }
      },
    });
  },
  //上传图片
  doUploadImg: function () {
    console.log(11111);
    let _this = this;
    // 选择图片
    wx.chooseImage({
      count: 1,//最多一次上传9张
      sizeType: ['compressed'],//original原图，compressed压缩图
      sourceType: ['album', 'camera'],//相册和相机
      success: function (res) {
        wx.showLoading({
          title: '上传中',
        })

        const filePath = res.tempFilePaths[0]
        let strTime = new Date().getTime();
        // 上传图片
        const cloudPath = 'uploadImage/road_' + app.globalData.openid + strTime + filePath.match(/\.[^.]+?$/)[0]
        wx.cloud.uploadFile({
          cloudPath,
          filePath,
          success: res => {
            console.log(res);
            console.log(22222);
            _this.data.imgArray.push(res.fileID);
            console.log(3333)
            _this.setData({
              imgArray: _this.data.imgArray
            });
            console.log(_this.data.imgArray)
          },
          fail: e => {
            console.error('[上传文件] 失败：', e)
            wx.showToast({
              icon: 'none',
              title: '上传失败',
            })
          },
          complete: () => {
            wx.hideLoading()
          }
        })
      },
      fail: e => {
        console.error(e)
      }
    })
  },
  //预览图片
  previewImage:function(e){
    let _this = this;
    let current = e.currentTarget.dataset.src;
    wx.previewImage({
      current: current, // 当前显示图片的http链接
      urls: _this.data.imgArray// 需要预览的图片http链接列表
    })
  },
  //选择地理位置
  doChoseLocation:function(){
    let _this = this;
    wx.chooseLocation({
      success: function (res) {
        console.log(res);
        _this.setData({
          location: res
        });
        wx.hideLoading();
      },
    })
  },
  //监听输入框  实现双向数据绑定
  inputedit: function (e) {
    let _this = this;
    //input 和 info 双向数据绑定
    let dataset = e.currentTarget.dataset;
    //data-开头的是自定义属性，可以通过dataset获取到，dataset是一个json对象，
    let value = e.detail.value;
    let name = dataset.name;
    _this.data[name] = value;
    _this.setData({
      name: _this.data[name]
    });
  },
  //错误提示信息
  showModal(error) {
    wx.showModal({
      content: error,
      showCancel: false,
    })
  },
  //发布
  submitTap:function(){
    let _this = this;
    if (_this.data.title == '') {
      _this.showModal('请输入标题');
      return false;
    }
    console.log(_this.data.contText);
    console.log(!_this.data.imgArray.length)
    if (_this.data.contText == '' && !_this.data.imgArray.length) {
      _this.showModal('请输入内容');
      return false;
    }
    wx.showToast({
      title: '',
      icon: 'loading',
      success: function (res) {
        //模拟删除
        _this.addColoction();
      }
    });
  },
  //添加函数
  addColoction: function (){
    let _this = this;
    let params = _this.data;
    console.log(params)
    db.collection('RoadInfo').add({
      data: {
        title: _this.data.title,//标题
        contText: _this.data.contText,//内容
        imgArray: _this.data.imgArray,//图片数组
        location: _this.data.location,//地理位置
        sendTime: db.serverDate(),//发布时间
        userInfo: app.globalData.userInfo,//用户信息
        status: 1,//0:被删除，1:正常
      },
      success: function (res) {
        console.log(res);
        wx.showToast({
          title: '发布成功',
          icon: 'success',
          success: function (res) {
            setTimeout(function () {
              //返回页面
              wx.switchTab({
                url: '/pages/ExpressNews/ExpressNews',
              })
            }, 500);
          }
        });
      },
      fail: console.error
    })
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})