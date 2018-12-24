// miniprogram/pages/ArticleDetails/ArticleDetails.js
const app = getApp()
const db = wx.cloud.database();
const _ = db.command;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    openid:'',
    showIcon: true,
    id:'',//参数id

    isPraise:false,//是否点赞

    title: '',//标题
    contText: '',//内容
    imgArray: '',//图片数组
    location: '',//地理位置
    sendTime: '',//发布时间
    
    userInfo: '',//用户信息
    status: '',//0:被删除，1:正常
    post:{
      like_count:0,//点赞数
      view_count:0,//浏览量
      comment_count:0//评论数
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let _this = this;
    wx.showLoading({
      title: '加载中...',
    });
    //截取参数id
    _this.data.id = options.id;
    _this.setData({
      openid:app.globalData.openid,
      id: _this.data.id
    });
    let id = _this.data.id;
    _this.addData(id);//获取详情
    _this.statistics(id);//更新文章浏览量
  },
  /**
   * 加载数据
   */
  addData:function(id){
    let _this = this;
    db.collection('RoadInfo').doc(id).get({
      success: function (res) {
        console.log(res.data);
        let data = res.data;
        _this.setData({
          title: data.title,
          contText: data.contText,
          imgArray: data.imgArray,
          location: data.location,
          sendTime: data.sendTime,
          userInfo: data.userInfo,
          status: data.status,
        });
        _this.onGetStatistic(_this.data.id);//获取 浏览量、点赞量，评论数
        _this.onGetPraise(_this.data.id, _this.data.openid);//获取是否点赞
        setTimeout(function () {
          //返回页面
          wx.hideLoading();
        }, 500);
        
      },
      fail: console.error
    });
  },
  /**
   * 更新文章浏览量
   */
  statistics: function (blogId){
    //浏览数+1不需要知道调用结果，失败了不影响
    wx.cloud.callFunction({
      name: 'changeSatistics',
      data: {
        post_id: blogId,
        view_count: 1,
        comment_count: 0,
        like_count: 0
      }
    })
  },
  
  /**
   * 获取 浏览量、点赞量，评论数
   */
  onGetStatistic: function (postIds){
    //js部分-展示统计数据时
    wx.cloud.callFunction({
      name: 'queryStatistics',
      data: {
        post_ids: [postIds]
      }
    }).then(res => {
      console.log(res);
      let post = {};
      //访问数
      post.view_count = res.result[0].view_count;
      //点评数
      post.comment_count = res.result[0].comment_count;
      //点赞数
      post.like_count = res.result[0].like_count;

      this.setData({
        post: post
      });
    })
  },
  /**
   * 获取是否点赞
   */
  onGetPraise:function (id, openid){
    let _this = this;
    console.log(id);
    //获取点赞数量
    db.collection('PraiseRecord').where({//获取是否点过赞
      idx: id,
      _openid: openid
    }).get({
      success(res) {
        console.log(res);
        let _data = res.data;
        if (_data.length == 0) {//没有点过赞
          _this.setData({
            isPraise: false
          });
        } else { //存在点记录
          _this.setData({
            isPraise: true
          });
        }
      },
      fail: console.error
    });
  },
  
  /**
   * 点赞按钮
   */
  praisePointsTag:function(){
    let _this = this;
    let id = _this.data.id;
    let openid = _this.data.openid;
    let _isPraise = _this.data.isPraise;
    let _praisePoints = _this.data.praisePoints;
   
    _this.setData({ //设置点赞记录
      isPraise: !_isPraise,
      praisePoints: _isPraise ? _praisePoints-1 : _praisePoints+1
    });
    db.collection('PraiseRecord').where({
      idx: id,
      _openid: openid
    }).get({
      success(res) {
        console.log(res);
        if(res.data.length){
          let _id = res.data[0]._id;
          db.collection('PraiseRecord').doc(_id).remove();
          _this.changePraisePoints(id, -1);
          
        }else{
          db.collection('PraiseRecord').add({
            data: {
              idx: id,
              userInfo: _this.data.userInfo
            },
            success(res) {
              console.log(res);
            },
            fail: console.error
          });
          //点赞增加一
          _this.changePraisePoints(id, 1);
        }
      },
      fail: console.error
    });
  },
  /**
   * 修改文章点赞点赞数量
   */
  changePraisePoints: function (blogId,val){
    console.log(blogId+":::"+val);
    let _this = this;
    wx.cloud.callFunction({
      name: 'changeSatistics',
      data: {
        post_id: blogId,
        view_count: 0,
        comment_count: 0,
        like_count: val
      }
    }).then(res =>{
      console.log(res);
      _this.data.post.like_count = _this.data.post.like_count+val;
      _this.setData({
        post: _this.data.post
      });
    })
  },
  /**
   * 分享文章按钮
   */
  onShareAppMessage: function (ops) {
    let _this = this;
    if (ops.from === 'button') {
      // 来自页面内转发按钮
      console.log(ops.target)
    }
    console.log(_this.data.title);
    return {
      title: _this.data.title,
      desc:_this.data.content,
      path: 'pages/ArticleDetails/ArticleDetails?id=' + _this.data.id,
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
  },
  /**
   * 预览图片
   */
  previewImage: function (e) {
    let _this = this;
    let current = e.currentTarget.dataset.src;
    wx.previewImage({
      current: current, // 当前显示图片的http链接
      urls: _this.data.imgArray// 需要预览的图片http链接列表
    })
  }
  
  
})