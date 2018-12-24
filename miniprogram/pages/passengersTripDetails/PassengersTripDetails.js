// miniprogram/pages/tripDetails/tripDetails.js
const app = getApp()
const db = wx.cloud.database();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    id:'',
    // 地图
    mapWidth: 750,
    mapHeight: 600,
    latitude: '',//定位坐标
    longitude: '',//定位坐标
    scale: 18,//地图缩放级别
    markers: [],//标记坐标
    polyline: [],//绘制路线
    includePoints: [],//缩放视野以包含所有给定的坐标点
    controls: [],
    // --------------------------------------------------------
    //信息
    userInfo: {},

    //出发城市***
    startCity: [],
    //到达城市***
    endCity: [],
    //具体日期***
    exactDate: '',
    //具体时间***
    exactTime: '',
    //临时保存所有地图点
    allLocation: [],
    //起点***
    startLocation: {},
    //终点***
    endLocation: {},
    //路线图***
    tripsArray: [],
    //人数***
    peopleNumber: '',
    //联系电话
    phoneNumber: '',
    //预算***
    budget: '',
    //备注***
    remarks: 's'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //获取用户当前位置
    let _this = this;
    wx.showLoading({
      title: '加载中...',
    });
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        if (res && res.longitude) {
          console.log(res);
          _this.setData({
            latitude: res.latitude,
            longitude: res.longitude,
          })
        }
      },
    });
    //截取参数
    _this.setData({
      id: options.id
    });;
    _this.addData(_this.data.id);
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.mapCtx = wx.createMapContext('myMap');//获取地图对象同canvas相似，获取后才能调用相应的方法
    this.mapCtx.moveToLocation();//将当前位置移动到地图中心
    this.mapCtx.includePoints({
      padding: [100],
      points: []
    })
  },
  
  /**
   * 加载数据
   */
  addData: function (id) {
    let _this = this;
    db.collection('PassengersRecord').doc(id).get({
      success: function (res) {
        console.log(res.data);
        let data = res.data;
        _this.setData({
          userInfo: data.userInfo,
          //出发城市***
          startCity: data.startRegion[2],
          //到达城市***
          endCity: data.endRegion[2],
          //具体日期***
          exactDate: data.exactDate,
          //具体时间***
          exactTime: data.exactTime,
          //起点***
          startLocation: data.startLocation,
          //终点***
          endLocation: data.endLocation,
          //路线图***
          tripsArray: data.tripsArray,
          //人数***
          peopleNumber: data.peopleNumber,
          //联系电话
          phoneNumber: data.phoneNumber,
          //预算***
          budget: data.budget,
          //备注***
          remarks: data.remarks
        });

        _this.createdMarker(_this.data.dataList);
        _this.drawPolyline(_this.data.allLocation);
        // _this.setCaleMap(_this.data.allLocation);

        wx.hideLoading();
      },
      fail: console.error
    });
  },
  
  /**
   * 创建marker
   */
  createdMarker: function (dataList) {
    let _this = this;
    //将起点+停车点+终点 拼接在一个数组
    let markerArray = [];
    markerArray.push(_this.data.startLocation);
    markerArray = markerArray.concat(_this.data.tripsArray);
    markerArray.push(_this.data.endLocation);


    let currentMarker = [];
    let markerList = markerArray;
    for (let i = 0; i < markerList.length; i++) {
      let marker = markerList[i];
      marker.id = i;
      marker.latitude = marker.latitude;
      marker.longitude = marker.longitude;
      marker.title = marker.name;
      switch (i) {
        //起点
        case 0:
          marker.width = 30;
          marker.height = 30;
          marker.iconPath = '../../images/icon/starting_point.png';
          break;
        //终点
        case markerList.length - 1:
          marker.width = 30;
          marker.height = 30;
          marker.iconPath = '../../images/icon/end_point.png';
          break;
        //过程
        default:
          marker.width = 30;
          marker.height = 30;
          marker.iconPath = '../../images/icon/travel_point.png';
          break;
      }
    }
    currentMarker = currentMarker.concat(markerList);
    console.log(currentMarker)
    _this.setData({
      markers: currentMarker,
      allLocation: currentMarker
    });
  },

  
  /**
   * 绘制路线图
   */
  drawPolyline: function (dataList) {
    let _this = this;
    let polyline = [{
      points: [],
      width: 4,//线的宽度
      color: '#6495ED',//颜色
      dottedLine: false//默认虚线
    }];
    let points = dataList;
    polyline[0].points = points;
    _this.setData({
      polyline: polyline,
    })
  },
  
  /**
   * 缩放视野以包含所有给定的坐标点
   */
  setCaleMap: function (dataList) {
    let _this = this;
    _this.setData({
      includePoints: dataList,
    })
  },
  
  /**
   * 点击marker
   */
  bindMarkertap: function (e) {
    console.log('111111')
  },
  
  /**
   * 查看地图坐标
   */
  openLocationTap: function (e) {
    let _this = this;
    let str = e.currentTarget.dataset.dic;
    let item = {};
    if(str == 'start'){
      item = _this.data.startLocation;
    }else{
      item = _this.data.endLocation;
    }
    //获取位置授权
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        if (res && res.longitude) {
          console.log(res);
          //获取当前经纬度
          wx.getLocation({
            success: function (res) {
              console.log(res);
              //打开微信内置地图
              wx.openLocation(item)
            },
            fail: console.error
          })
        }
      },
    });
  },
  /**
   * 拨打电话
   */
  bindMakePhoneCall: function () {
    let _this = this;
    wx.makePhoneCall({
      phoneNumber: _this.data.phoneNumber
    })
  },
  /**
   * 返回
   */
  bindGoBack: function () {
    wx.navigateBack({
      delta: 1,
    })
  },
  /**
   * 回到首页
   */
  bindGoHome: function () {
    wx.switchTab({
      url: '/pages/index/index'
    })
  },
  /**
   * 用户点击分享
   */
  onShareAppMessage: function (ops) {
    let _this = this;
    let desc = _this.data.remarks;
    
    if (ops.from === 'button') {
      // 来自页面内转发按钮
      console.log(ops.target)
    }
    return {
      title: '人找车:' + _this.data.startLocation.name + '—>' + this.data.endLocation.name,
      desc: '备注:' + desc,
      path: '/ages/passengersTripDetails/PassengersTripDetails?id=' + _this.data.id,
      success: function (res) {
        // 需要在页面onLoad()事件中实现接口
        wx.showShareMenu({
          // 要求小程序返回分享目标信息
          withShareTicket: true
        });
        console.log("转发成功:" + JSON.stringify(res));
      },
      fail: function (res) {
        // 转发失败
        console.log("转发失败:" + JSON.stringify(res));
      }
    }
  }
})