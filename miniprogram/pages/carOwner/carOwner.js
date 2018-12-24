//index.js
const app = getApp()
const db = wx.cloud.database();
const _ = db.command;

Page({
  data: {
    isLodding: true,

    pageIndex: 1,//第一页
    hasMore: true,//是否还有下一页
    list: [],

    //banner
    imgUrls: [
      'https://ss3.bdstatic.com/70cFv8Sh_Q1YnxGkpoWK1HF6hhy/it/u=2241101822,3622838363&fm=200&gp=0.jpg',
      'https://ss3.bdstatic.com/70cFv8Sh_Q1YnxGkpoWK1HF6hhy/it/u=2241101822,3622838363&fm=200&gp=0.jpgg',
      'https://ss3.bdstatic.com/70cFv8Sh_Q1YnxGkpoWK1HF6hhy/it/u=2241101822,3622838363&fm=200&gp=0.jpg'
    ],
    indicatorDots: false,
    autoplay: true,
    interval: 5000,
    duration: 1000,

    //发布信息按钮动画
    status: ''
  },

  onLoad: function () {
    let _this = this;
    //是否连接数据库
    if (!wx.cloud) {
      wx.redirectTo({
        url: '../chooseLib/chooseLib',
      })
      return
    }
    console.log(app.globalData.userInfo);
    //是否授权登录
    if (!app.globalData.userInfo) {
      wx.redirectTo({
        url: '/pages/authorize/authorize',
      })
    };

    _this.onGetOpenid();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let _this = this;
    wx.showLoading({
      title: '加载中...',
    });
    _this.addData(1);
  },
  //获取_openid
  onGetOpenid: function () {
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        app.globalData.openid = res.result.openid
      },
      fail: err => {
      }
    })
  },
  //获取有效的拼车信息
  addData: function (n) {
    let _this = this;
    let startTime = _this.startTime();
    let endTime = _this.endTime();
    //按照时间查询，规则开始当前时间60分钟前 到明天24：00；
    wx.cloud.callFunction({
      name: 'queryInfo',
      data: {
        dbName: 'PassengersRecord',
        pageIndex: n,
        pageSize: 15,
        startTime: _this.startTime(),
        endTime: _this.endTime()
      }
    }).then(res => {
      console.log(res);
      _this.setData({
        isLodding: false,
        list: res.result.data,
        pageIndex: _this.data.pageIndex + 1,
        hasMore: res.result.hasMore
      });
      //隐藏导航栏加载框
      wx.hideNavigationBarLoading();
      //停止下拉动作
      wx.stopPullDownRefresh();
      wx.hideLoading();
    });
  },
  //下拉刷新
  onPullDownRefresh: function () {
    //显示刷新图标
    wx.showNavigationBarLoading();
    wx.showLoading({
      title: '加载中...',
    });
    let _this = this;
    _this.setData({
      pageIndex: 1
    });
    _this.addData(1);
  },
  //上拉加载更多
  onReachBottom: function () {
    let _this = this;
    if (!_this.data.hasMore) return;//没有下一页了

    let startTime = _this.startTime();
    let endTime = _this.endTime();
    //按照时间查询，规则开始当前时间60分钟前 到明天24：00；
    wx.cloud.callFunction({
      name: 'queryInfo',
      data: {
        dbName: 'PassengersRecord',
        pageIndex: _this.data.pageIndex,
        pageSize: 15,
        startTime: _this.startTime(),
        endTime: _this.endTime()
      }
    }).then(res => {
      console.log(res);
      _this.setData({
        list: _this.data.list.concat(res.result.data),
        pageIndex: _this.data.pageIndex + 1,
        hasMore: res.result.hasMore
      });
    });
  },
  // 查看行程详情
  lookTripDetails: function (e) {
    let _this = this;
    let idx = e.currentTarget.dataset.idx;
    wx.navigateTo({
      url: '../../pages/passengersTripDetails/PassengersTripDetails?id=' + idx,
    })
  },
  //获取60分钟前时间戳
  startTime: function () {
    let day = new Date()
    let strTime = day.getTime() - 1 * 60 * 60 * 1000;
    console.log(strTime)
    return strTime;
  },
  //获取次日凌晨时间戳
  endTime: function () {
    // 获取当天 0 点的时间戳
    let oneTime = new Date(new Date().setHours(0, 0, 0, 0)) / 1000;
    //次日凌晨时间戳
    let threeTime = oneTime + 86400 * 2;
    console.log(threeTime * 1000)
    return threeTime * 1000;
  },

  //发布信息按钮动画
  trigger: function () {
    let _this = this;
    let active = _this.data.status;
    if (active == 'on') {
      this.setData({
        status: ''
      });
    } else {
      this.setData({
        status: 'on'
      });
    }
  },

})
