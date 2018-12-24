//index.js
const app = getApp()
const db = wx.cloud.database();
const _ = db.command;

Page({
  data: {
    isLodding: true,

    statusBarHeight: 0,//状态栏高度
    titleBarHeight: 0,//标题栏高度
    navBarHeight: 0,//导航栏高度
    navData: ['人找车', '车找人', '查公交','货找车', '车找货'],
    currentNavTab: 0,//当前状态

    dnName:'CarOwnerRecord',//查询集合列表，默认人找车

    pageIndex:1,//第一页
    hasMore:true,//是否还有下一页
    list:[],

    hotList: [],
    hotCurrent:0,

    //banner
    imgUrls: [
      '../../images/icon/banner01.jpg'
    ],
    indicatorDots: true,
    autoplay: false,
    interval: 5000,
    duration: 1000,
    //轮播页当前index
    swiperCurrent: 0,
    webUrl:[
      'http://wap.coobus.cn/v2/#/favorite?code=constant'
    ],

    //发布信息按钮动画
    status:'',
    showModalStatus:true
  },
  /**
   * 
   */
  onLoad: function() {
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
    if(!app.globalData.userInfo){
      wx.redirectTo({
        url: '/pages/authorize/authorize',
      })
    };
    _this.onGetSystemInfo();
    _this.onGetOpenid();
    wx.showLoading({
      title: '加载中...',
    });
    _this.onGetHotNews(10);//获取热点新闻
    _this.addData(1, _this.data.currentNavTab);//第一个参数页数，第二个参数分类
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
  },
  /**
   * 获取设备信息
   */
  onGetSystemInfo:function(){
    let _this = this
    // 因为很多地方都需要用到，所有保存到全局对象中
    if (app.globalData.statusBarHeight && app.globalData.titleBarHeight)    {
      _this.setData({
        statusBarHeight: app.globalData.statusBarHeight,
        titleBarHeight: app.globalData.titleBarHeight,
        navBarHeight: app.globalData.navBarHeight,
        windowHeight: app.globalData.windowHeight,
        windowWidth: app.globalData.windowWidth
      });
    } else {
      console.log(11111);
      wx.getSystemInfo({
        success: function (res) {
          console.log(res);
          if (!app.globalData) {
            app.globalData = {}
          }
          //这里默认iOS安卓导航栏都是44;
          app.globalData.titleBarHeight = 44;
          app.globalData.statusBarHeight = res.statusBarHeight;
          app.globalData.windowHeight = res.windowHeight;
          app.globalData.windowWidth = res.windowWidth;
          app.globalData.navBarHeight = res.statusBarHeight+44;
          _this.setData({
            statusBarHeight: app.globalData.statusBarHeight,
            titleBarHeight: app.globalData.titleBarHeight,
            navBarHeight: app.globalData.navBarHeight,
            windowHeight: app.globalData.windowHeight,
            windowWidth: app.globalData.windowWidth
          });
        },
        failure() {
          that.setData({
            statusBarHeight: 0,
            titleBarHeight: 0
          });
        }
      })
    }
  },
  
  /**
   * 获取_openid
   */
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
  
  /**
   * 获取热点快报
   */
  onGetHotNews:function(n){
    let _this = this;
    db.collection('RoadInfo').where({
      status: _.neq(0)
    })
    .orderBy('sendTime','desc')
    .limit(n)
    .get({
      success: function (res) {
        console.log(res.data);
        let list = res.data
        _this.setData({
          hotList: list
        });
      },
      fail: console.error
    })
  },
  
  /**
   * 导航列表点击
   */
  switchNav(event) {
    let _this = this;
    let cur = event.currentTarget.dataset.current;
    //每个tab选项宽度占1/5
    let singleNavWidth = this.data.windowWidth / 5;
    //tab选项居中                            
    _this.setData({
      navScrollLeft: (cur - 2) * singleNavWidth
    })
    if (_this.data.currentNavTab == cur) {
      return false;
    } else {
      if (cur==2){
        wx.navigateTo({
          url: '/pages/LookTransit/LookTransit',
        });
        return false;
      };
      if (cur == 3 || cur == 4)
      {
        wx.showModal({
          title: '我与三人行',
          content: '该功能暂未开放，敬请期待',
        });
        return false;
      } 

      this.setData({
        currentNavTab: cur,
        list:[]
      });
      //加载数据
      _this.addData(1,_this.data.currentNavTab);
    }
  },
  
  /**
   * 获取有效的拼车信息
   */
  addData: function (n,s) {//第一个参数页数，第二个参数分类
    let _this = this;
    let startTime = _this.startTime();
    let endTime = _this.endTime();
    switch (s){
      case 0:
        _this.setData({
          dnName : "CarOwnerRecord"
        });
        break;
      case 1:
        _this.setData({
          dnName : "PassengersRecord"
        })
        break;
      case 4:
        // _this.setData({
        //   dnName : ""
        // })
        break;
    }
    wx.showLoading({
      title: '加载中...',
    });
    //按照时间查询，规则开始当前时间60分钟前 到明天24：00；
    wx.cloud.callFunction({
      name: 'queryInfo',
      data:{
        dbName: _this.data.dnName,
        pageIndex:n,
        pageSize:15,
        filter:{},
        startTime: _this.startTime(),
        endTime: _this.endTime()
      }
    }).then(res => {
      console.log(res);
      _this.setData({
        isLodding: false,
        list: res.result.data,
        pageIndex: _this.data.pageIndex+1,
        hasMore: res.result.hasMore
      });
      wx.hideLoading();
    });
  },
  
  /**
   * 下拉刷新
   */
  onPullDownRefresh:function(){
    let _this = this;
    
    //显示刷新图标
    wx.showLoading({
      title: '加载中...',
    });
    _this.setData({
      pageIndex:1
    });
    _this.onGetHotNews(10);//获取热点新闻
    _this.addData(1,_this.data.currentNavTab);
    //停止刷新，页面回单
    wx.stopPullDownRefresh();
  },
  
  /**
   * 上拉加载更多
   */
  onReachBottom:function(){
    let _this = this;
    if(!_this.data.hasMore) return;//没有下一页了

    let startTime = _this.startTime();
    let endTime = _this.endTime();
    //按照时间查询，规则开始当前时间60分钟前 到明天24：00；
    wx.cloud.callFunction({
      name: 'queryInfo',
      data: {
        dbName: _this.data.dnName,
        pageIndex: _this.data.pageIndex,
        pageSize: 15,
        filter:{},
        startTime: _this.startTime(),
        endTime: _this.endTime()
      }
    }).then(res => {
      console.log(res);
      _this.setData({
        list: _this.data.list.concat(res.result.data),
        pageIndex: _this.data.pageIndex+1,
        hasMore: res.result.hasMore
      });
    });
  },
  
  /**
   * 点击搜索
   */
  bindSearchTap:function(){
    wx.navigateTo({
      url: '../../pages/SearchPage/SearchPage',
    });
  },
  
  /**
   * 轮播图的切换事件
   */
  swiperChange: function (e) {
    this.setData({
      swiperCurrent: e.detail.current
    })
  },
  
  /**
   * 轮播图点击事件
   */
  swipclick: function (e) {
    console.log(this.data.swiperCurrent);
    let _this = this;
    let _index = _this.data.swiperCurrent;
    let str = _this.data.webUrl[_index];
    wx.navigateTo({
      url: '../../pages/webViewPage/webViewPage?url=' + str+'&name=推荐',
    });
  },
  
  /**
   * 热点新闻切换
   */
  hotSwiperChange:function(e){
    this.setData({
      hotCurrent: e.detail.current
    });
  },
  
  /**
   * 查看热点新闻
   */
  hotNewsClick:function(e){
    let _this = this;
    let _index = _this.data.hotCurrent;
    let id = _this.data.hotList[_index]._id;
    wx.navigateTo({
      url: '../../pages/ArticleDetails/ArticleDetails?path=index&id=' + id,
    })
  },
  
  /**
   * 查看行程详情
   */
  lookTripDetails:function(e){
    let _this = this;
    let id = e.currentTarget.dataset.id;
    let idx = e.currentTarget.dataset.idx;
    let item = _this.data.list[idx];
    console.log(item.tripsArray)
    if (item.tripsArray){
      wx.navigateTo({
        url: '../../pages/tripDetails/tripDetails?id=' + id,
      });
    }else{
      wx.navigateTo({
        url: '../../pages/passengersTripDetails/PassengersTripDetails?id=' + id,
      });
    }
  },
  
  /**
   * 获取60分钟前时间戳
   */
  startTime:function(){
    let day = new Date()
    let strTime = day.getTime() - 1 * 60 * 60 * 1000;
    console.log(strTime)
    return strTime;
  },
  
  /**
   * 获取次日凌晨时间戳
   */
  endTime:function(){
    // 获取当天 0 点的时间戳
    let oneTime = new Date(new Date().setHours(0, 0, 0, 0)) / 1000;
    //次日凌晨时间戳
    let threeTime = oneTime + 86400 *2;
    console.log(threeTime*1000)
    return threeTime*1000;
  },

  /**
   * 发布信息按钮动画
   */
  trigger:function(){
    let _this = this;
    let active = _this.data.status;
    if(active == 'on'){
      this.setData({
        status : ''
      });
    }else{
      this.setData({
        status : 'on'
      });
    }
  },
  // 隐藏遮罩层  
  hideModal: function () {
    this.setData({
      status: ''
    });
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.setData({
      status: ''
    });
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    this.setData({
      status: ''
    });
  },
  
})
