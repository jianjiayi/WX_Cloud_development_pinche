// miniprogram/pages/carsLookPeople/carLoolPeople.js

const app = getApp()
const db = wx.cloud.database();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    showIcon: true,
    startRegion: ['河北省', '廊坊市', '固安县'],
    endRegion: ['北京市', '北京市', '大兴区'],
    //上车地点***
    startLocation: {
      name: "",
      address: '',
      latitude: "",
      longitude: "",
    },
    //下车地点***
    endLocation: {
      name: "",
      address: '',
      latitude: "",
      longitude: "",
    },
    //具体日期
    dateArray: ['今天', '明天'],
    objectDateArray: [
      {
        id: 0,
        name: '今天'
      },
      {
        id: 1,
        name: '明天'
      }
    ],
    dateIndex: 0,
    //具体日期***
    exactDateTag: '今天',
    //具体时间***
    exactTime: '06:00',
    //中途停车点数组***
    tripsArray: [],
    //高速
    isSpeed: [
      {
        name: '辅路',
        value: '否',
        checked: 'true',
      },
      {
        name: '高速',
        value: '是',
      }
    ],
    //是否高速***
    isSpeedStr:'辅路',
    //人数***
    peopleNumber: '',
    //联系电话***
    phoneNumber:'',
    //预算***
    budget: '',
    //备注***
    remarks: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getTodyTime();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

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
   * 选择上车地点
   */
  chooseStartMapTap: function () {
    let _this = this;
    wx.chooseLocation({
      success: function (res) {
        console.log(res);
        _this.setData({
          startLocation: res
        });
      },
    });
  },
  
  /**
   * 选择下车地点
   */
  chooseEndtMapTap: function () {
    let _this = this;
    wx.chooseLocation({
      success: function (res) {
        console.log(res);
        _this.setData({
          endLocation: res
        });
      },
    });
  },
  
  /**
   * 日期选择器
   */
  bindPickerChange: function (e) {
    let _this = this;
    console.log(e.detail.value);
    e.detail.value == 0 ? _this.getTodyTime() : _this.getTomorrowTime();
    _this.setData({
      dateIndex: e.detail.value
    })
  },
  
  /**
   * 时间选择器
   */
  bindTimeChange: function (e) {
    console.log(e.detail.value)
    this.setData({
      exactTime: e.detail.value
    })
  },
  
  
  /**
   * 添加中途停车点
   */
  addTripsItem: function () {
    let _this = this;
    wx.chooseLocation({
      success: function (res) {
        console.log(res);
        let list = _this.data.tripsArray;
        list.push(res);
        _this.setData({
          tripsArray: list
        });
      },
    })
  },
  
  /**
   * 修改停车点
   */
  changeTripsItem: function () {
    let _this = this;
    wx.chooseLocation({
      success: function (res) {
        console.log(res);
        _this.setData({

        });
      },
    })
  },
  
  /**
   * 删除停车点
   */
  delTripsItem: function (e) {
    let _this = this;
    let idx = e.currentTarget.dataset.idx;
    let list = _this.data.tripsArray;
    let filterRes = list.filter((ele, index) => {
      return index != idx;
    });
    console.log(filterRes)
    this.setData({
      tripsArray: filterRes
    })
  },
  
  /**
   * 道路选择
   */
  isSpeedChange: function (e) {
    console.log(e.detail.value);
    let _this = this;
    _this.setData({
      isSpeedStr : e.detail.value
    })
  },
  
  /**
   * 获取今天时间
   */
  getTodyTime: function () {
    let _this = this;
    _this.setData({
      exactDateTag: '今天'
    });
  },
  
  /**
   * 获取明天时间
   */
  getTomorrowTime: function () {
    let _this = this;
    _this.setData({
      exactDateTag: '明天'
    });
  },
  
  /**
   * 监听输入框  实现双向数据绑定
   */
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
  
  /**
   * 错误提示信息
   */
  showModal(error) {
    wx.showModal({
      content: error,
      showCancel: false,
    })
  },
  
  /**
   * 点击发布函数
   */
  submitTap: function () {
    let _this = this;
    if (_this.data.startLocation.name == '') {
      _this.showModal('请选择上车地点');
      return false;
    }
    if (_this.data.endLocation.name == '') {
      _this.showModal('请选择下车地点');
      return false;
    }
    if (_this.data.tripsArray.length == 0){
      _this.showModal('请输入中途停车点');
      return false;
    }
    if (_this.data.peopleNumber == '') {
      _this.showModal('请输入人数');
      return false;
    }
    if (_this.data.phoneNumber == '') {
      _this.showModal('请输入联系电话');
      return false;
    }
    if (_this.data.budget == '') {
      _this.showModal('请输入预算金额');
      return false;
    }
    wx.showToast({
      title: '',
      icon: 'loading',
      success: function (res) {
        _this.addColoction();
      }
    });

  },
  
  /**
   * 添加函数
   */
  addColoction: function () {
    let _this = this;
    db.collection('CarSearchPeople').add({
      data: {
        //出发城市
        startRegion: _this.data.startRegion,
        //到大城市
        endRegion: _this.data.endRegion,
        //上车地点***
        startLocation: _this.data.startLocation,
        //下车地点***
        endLocation: _this.data.endLocation,
        //中途停车
        tripsArray: _this.data.tripsArray,
        //具体日期***
        exactDateTag: _this.data.exactDateTag,
        //具体时间***
        exactTime: _this.data.exactTime,
        //高速
        isSpeed:_this.data.isSpeedStr,
        //人数***
        peopleNumber: _this.data.peopleNumber,
        //联系电话***
        phoneNumber: _this.data.phoneNumber,
        //预算***
        budget: _this.data.budget,
        //备注***
        remarks: _this.data.remarks,
        //创建时间
        createdTime: db.serverDate(),
        //状态
        status: 0,//0:正常使用,1:被删除
      },
      success: function (res) {
        console.log(res);
        wx.showToast({
          title: '发布成功',
          icon: 'success',
          success: function (res) {
            setTimeout(function () {
              //返回页面
              wx.navigateBack();
            }, 500);
          }
        });
      },
      fail: console.error
    })
  }
})