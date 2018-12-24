// miniprogram/pages/SearchPage/SearchPage.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showIcon: true,
    statusBarHeight: 0,//状态栏高度
    titleBarHeight: 0,//标题栏高度
    navBarHeight: 0,//导航栏高度

    startRegion: ['河北省', '廊坊市', '固安县'],
    endRegion: ['北京市', '北京市', '大兴区'],
    //具体日期
    typeArray: ['人找车', '车找人'],
    objectTypeArray: [
      {
        id: 0,
        name: '今天'
      },
      {
        id: 1,
        name: '明天'
      }
    ],
    typeIndex: 0,
    dnName: 'CarOwnerRecord',//查询集合列表，默认人找车

    currentNavTab: 0,//当前状态

    pageIndex: 1,//第一页
    hasMore: true,//是否还有下一页
    list: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let _this = this;
    _this.setData({
      statusBarHeight: app.globalData.statusBarHeight,//状态栏高度
      titleBarHeight: app.globalData.titleBarHeight,//标题栏高度
      navBarHeight: app.globalData.navBarHeight,//导航栏高度
      userInfo: app.globalData.userInfo,
    });

    let _start = _this.data.startRegion;//出发城市
    let _end = _this.data.endRegion;//到大城市
    _this.addData(1);//第一个参数页数
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
   * 获取有效的信息列表
   */
  addData: function (n) {//第一个参数页数
    let _this = this;
    let startTime = _this.startTime();
    let endTime = _this.endTime();
    wx.showLoading({
      title: '加载中...',
    });
    //按照时间查询，规则开始当前时间60分钟前 到明天24：00；
    wx.cloud.callFunction({
      name: 'queryInfo',
      data: {
        dbName: _this.data.dnName,
        pageIndex: n,
        pageSize: 15,
        filter:{
          startRegion: _this.data.startRegion,
          endRegion: _this.data.endRegion
        },
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
      
      wx.hideLoading();
    });
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh: function () {
    wx.showLoading({
      title: '加载中...',
    });
    let _this = this;
    _this.setData({
      pageIndex: 1
    });
    _this.addData(1);

    //停止下拉动作
    wx.stopPullDownRefresh();
  },
  
  /**
   * 上拉加载更多
   */
  onReachBottom: function () {
    let _this = this;
    if (!_this.data.hasMore) return;//没有下一页了

    let startTime = _this.startTime();
    let endTime = _this.endTime();
    //按照时间查询，规则开始当前时间60分钟前 到明天24：00；
    wx.cloud.callFunction({
      name: 'queryInfo',
      data: {
        dbName: _this.data.dnName,
        pageIndex: _this.data.pageIndex,
        pageSize: 15,
        filter: {
          startRegion: _this.data.startRegion,
          endRegion: _this.data.endRegion
        },
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

  /**
   * 搜索事件
   */
  onSubmitTap:function(){
    let _this = this;
    _this.addData(1);//第一个参数页数
  },

  /**
   * 查看行程详情
   */
  lookTripDetails: function (e) {
    let _this = this;
    let id = e.currentTarget.dataset.id;
    let idx = e.currentTarget.dataset.idx;
    let item = _this.data.list[idx];
    console.log(item.tripsArray)
    if (item.tripsArray) {
      wx.navigateTo({
        url: '../../pages/tripDetails/tripDetails?id=' + id,
      });
    } else {
      wx.navigateTo({
        url: '../../pages/passengersTripDetails/PassengersTripDetails?id=' + id,
      });
    }
  },
  
  /**
   * 获取60分钟前时间戳
   */
  startTime: function () {
    let day = new Date()
    let strTime = day.getTime() - 1 * 60 * 60 * 1000;
    console.log(strTime)
    return strTime;
  },
  
  /**
   * 获取次日凌晨时间戳
   */
  endTime: function () {
    // 获取当天 0 点的时间戳
    let oneTime = new Date(new Date().setHours(0, 0, 0, 0)) / 1000;
    //次日凌晨时间戳
    let threeTime = oneTime + 86400 * 2;
    console.log(threeTime * 1000)
    return threeTime * 1000;
  },
  
  /**
   * 出发城市
   */
  startRegionChange: function (e) {
    console.log(e.detail.value)
    this.setData({
      startRegion: e.detail.value
    })
  },
  
  /**
   * 到大城市
   */
  endRegionChange: function (e) {
    console.log(e.detail.value)
    this.setData({
      endRegion: e.detail.value
    })
  },
  
  /**
   * 类型选择器
   */
  bindTypeChange: function (e) {
    let _this = this;
    console.log(e.detail.value);
    switch (e.detail.value) {
      case 0:
        _this.setData({
          dnName: "CarOwnerRecord",
          typeIndex: e.detail.value
        });
        break;
      case 1:
        _this.setData({
          dnName: "PassengersRecord",
          typeIndex: e.detail.value
        })
        break;
      case 2:
        _this.setData({
          dnName: "PassengersRecord",
          typeIndex: e.detail.value
        })
        break;
      case 3:
        _this.setData({
          dnName: "PassengersRecord",
          typeIndex: e.detail.value
        })
        break;
    }
  }
})