// miniprogram/pages/peopleLookCars/peopleLookCars.js
const app = getApp()
const db = wx.cloud.database();


Page({
  /**
   * 页面的初始数据
   */
  data: {
    showIcon: true,
    isLodding:true,
    openid: '',
    exactDate: '',
    list: [],
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let _this = this;
    wx.showLoading({
      title: '加载中...',
    });
    _this.setData({
      openid: app.globalData.openid,
    });
    _this.addData(_this.data.openid);
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let _this = this;
    _this.addData(_this.data.openid);
  },

  /**
   * 加载数据列表
   */
  addData: function (openid) {
    const _ = db.command;
    let _this = this;
    db.collection('CarSearchPeople').where({
      _openid: openid,
      status: _.neq(1)
    }).orderBy('createdTime', 'desc')
    .get({
      success: function (res) {
        console.log(res.data);
        _this.setData({
          list: res.data
        });
        setTimeout(function () {
          wx.hideLoading({
            success: function (res) {
              _this.setData({
                isLodding: false
              });
            }
          })
        }, 1000);
      },
      fail: console.error
    });
  },
  
  /**
   * 获取今天时间
   */
  getTodyTime: function (time) {
    let _this = this;
    let day = new Date();
    day.setTime(day.getTime());
    let dayStr = day.getFullYear() + "-" + (day.getMonth() + 1) + "-" + day.getDate() + ' ' + time + ':00';
    dayStr = dayStr.replace(/-/g, '/');
    let timestamp = new Date(dayStr).getTime();
    _this.setData({
      exactDate: timestamp
    });
  },
  
  /**
   * 获取明天时间
   */
  getTomorrowTime: function (time) {
    let _this = this;
    let day = new Date();
    day.setTime(day.getTime() + 24 * 60 * 60 * 1000);
    let dayStr = day.getFullYear() + "-" + (day.getMonth() + 1) + "-" + day.getDate() + ' ' + time + ':00';
    dayStr = dayStr.replace(/-/g, '/');
    let timestamp = new Date(dayStr).getTime();
    _this.setData({
      exactDate: timestamp
    });
  },
  
  /**
   * 发布函数
   */
  publishTap: function (e) {
    let _this = this;
    let idx = e.currentTarget.dataset.idx;
    let id = e.currentTarget.dataset.id;

    let params = _this.data.list[idx];
    //修改出发时间
    params.exactDateTag == '今天' ? _this.getTodyTime(params.exactTime) : _this.getTomorrowTime(params.exactTime);
    //存放时间戳
    params.exactDate = _this.data.exactDate;
    //添加数据库时 _id、_openid不能存在否则报错
    delete params._id;
    delete params._openid;
    delete params.exactDateTag;
    console.log(params);

    //判断是否有效
    if(!_this.isValid(params.exactDate)) return false;

    //添加个人信息
    params.userInfo = app.globalData.userInfo;

    wx.showModal({
      title: '人找车',
      content: '确定发布这条信息？',
      success: function (res) {
        if (res.confirm) {
          console.log('ok');
          wx.showToast({
            title: '',
            icon: 'loading',
            success: function (res) {
              //操作数据库
              db.collection('CarOwnerRecord').add({
                data: params,
                success: function (res) {
                  console.log(res);
                  //发布成功
                  wx.showToast({
                    title: '发布成功',
                    icon: 'success',
                    duration: 2000
                  })
                },
                fail: console.error
              });
            }
          });
        } else if (res.cancel) {
          console.log('cancel');
        }
      }
    })
  },
  
  /**
   * 删除函数
   */
  deleteTap: function (e) {
    let _this = this;
    let idx = e.currentTarget.dataset.idx;
    let id = e.currentTarget.dataset.id

    console.log('idx:' + idx);
    console.log('id:' + id);
    wx.showModal({
      title: '',
      content: '确定删除这条信息？',
      success: function (res) {
        if (res.confirm) {
          console.log('ok');
          wx.showToast({
            title: '',
            icon: 'loading',
            success: function (res) {
              //更新状态函数
              db.collection('CarSearchPeople').doc(id).update({
                data: {
                  status: 1
                },
                success: function (res) {
                  console.log(res);
                  let list = _this.data.list;
                  let filterRes = list.filter((ele, index) => {
                    return index != idx;
                  });
                  _this.setData({
                    list: filterRes
                  });
                  wx.showToast({
                    title: '删除成功',
                    icon: 'success',
                  })
                },
                fail: console.error
              });
            }
          });
        } else if (res.cancel) {
          console.log('cancel');
        }
      }
    })
  },

  
  /**
   * 校验发布时是否有效
   */
  isValid:function(timeStr){
    let day = new Date();
    if (timeStr >= day.getTime()){
      return true;
    }else{
      wx.showModal({
        title: '车找人',
        content: '出发时间已超时,请重新设置',
      });
      return false;
    }
  },

});
