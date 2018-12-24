// miniprogram/pages/ExpressNews/ExpressNews.js
const app = getApp()
const db = wx.cloud.database();
const _ = db.command;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight:'',
    titleBarHeight:'',

    openid: '',
    id: '',//参数id

    isPraise: false,//是否点赞
    praisePoints: 0,//点赞数

    list:[],//存放数据
    pageIndex: 1,//第一页
    hasMore: true,//是否还有下一页
    list: [],//文章列表
    postsStatistics:[]//统计列表
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let _this = this;
    _this.setData({
      statusBarHeight: app.globalData.statusBarHeight,
      titleBarHeight: app.globalData.titleBarHeight
    });
    _this.addData(1);//第一个参数页数，第二个参数分类
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
   * 获取文章列表
   */
  addData: function (n) {//第一个参数页数
    let _this = this;
    wx.showLoading({
      title: '加载中...',
    });
    wx.cloud.callFunction({
      name: 'paginator',
      data: {
        dbName: 'RoadInfo',
        pageIndex: n,
        pageSize: 15
      }
    }).then(res => {
      console.log(res);
      let data = res.result.data
      _this.setData({
        isLodding: false,
        list: data,
        pageIndex: _this.data.pageIndex + 1,
        hasMore: res.result.hasMore
      });
      let postIds = [];
      data.map(n => {
        postIds.push(n._id);
      });
      console.log(postIds)
      _this.onGetStatistic(postIds)
      //停止下拉动作
      wx.hideLoading();
    });
  },

  /**
   * 获取 浏览量、点赞量，评论数
   */
  onGetStatistic: function (postIds) {
    let _this = this;
    //js部分-展示统计数据时
    wx.cloud.callFunction({
      name: 'queryStatistics',
      data: {
        post_ids: postIds
      }
    }).then(res => {
      console.log(res);
      let array = res.result;
      let resData = [];
      for (let i = 0; i < postIds.length; i++){
        let _id = postIds[i];
        let obj = array.filter( m =>{
          return m.post_id == _id
        });
        if(obj.length){
          resData.push(obj[0]);
        }else{
          resData.push({});
        };
        console.log(obj);
      }
      
      _this.data.postsStatistics = _this.data.postsStatistics.concat(resData);
      this.setData({
        postsStatistics: _this.data.postsStatistics
      });
    })
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh: function () {
    console.log('下拉刷新')
    let _this = this;
    //显示刷新图标
    wx.showLoading({
      title: '加载中...',
    });
    _this.setData({
      pageIndex: 1,
      postsStatistics:[]
    });
    _this.addData(1);
    //停止刷新，页面回单
    wx.stopPullDownRefresh();
  },
  /**
   * 上拉加载更多
   */
  onReachBottom: function () {
    let _this = this;
    if (!_this.data.hasMore) return;//没有下一页了

    wx.cloud.callFunction({
      name: 'paginator',
      data: {
        dbName: 'RoadInfo',
        pageIndex: _this.data.pageIndex,
        pageSize: 15
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
   * 查看文章详情
   */
  bindLookDetail:function(e){
    let _this = this;
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../../pages/ArticleDetails/ArticleDetails?id=' + id,
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})