import request from "./../utils/request.js";
/**
 * 直播相关接口
 */


/**
 * 开直播
 * @param object
 */
export function openChannel(data) {
    return request.post('live/openchannel', data);
}
/**
 * 主播获取直播详情
 */
export function channelInfo(id) {
  return request.get('live/channelinfo/' + id);
}
/**
 * 关闭直播间
 */
export function closechannel(id) {
  return request.get('live/closechannel/' + id);
}


/* 直播列表 */
export function livelist() {
  return request.get('live/list');
}
/**
 * 观众获取直播详情
 */
export function visitChannel(id) {
    return request.get('live/visitchannel/' + id);
}

/* 观众获取User_Sig */
export function getusersig() {
  return request.get('live/getusersig');
}

/* 主播的预约直播 */
export function mysubscribe() {
  return request.get('live/mysubscribe');
}

/* 主播的商品 */
export function mygoods() {
  return request.get('live/mygoods');
}

/* 订阅直播 */
export function messagetips(id) {
  return request.get('live/subscribechannel/' + id);
}

// 直播详情
