// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  let dbName = event.dbName;//集合名称
  console.log(event.filter);
  let filter = event.filter ? event.filter : null;//刷选条件，默认为空 格式{_id:'asdhabsd'}
  
  let pageIndex = event.pageIndex ? event.pageIndex : 1;//当前第几页，默认第一页
  let pageSize = event.pageSize ? event.pageSize : 10;//每页去多少条记录，默认10条
  const countResult = await db.collection(dbName).where(filter).count();//获取集合中的总记录数
  const total = countResult.total;//得到总记录数
  let pages = total/pageSize;
  const totalPage = Math.ceil(pages); //计算需要多少页
  let hasMore;//提示前端是否还数据
  if(pageIndex > totalPage || pageIndex == totalPage){//如果没有数据了，就返回false
    hasMore = false;
  }else{
    hasMore = true;
  }

  //最后查询数据并返回给前端
  return db.collection(dbName).where(filter).skip((pageIndex - 1) * pageSize).orderBy('sendTime', 'desc').limit(pageSize).get().then(res => {
    res.hasMore = hasMore;
    return res;
  });
}