<template>
	<view class="">
		<view class="navbar">
			<view class="nav">
			</view>
			<view class="title">
				{{title}}
			</view>
		</view>
		<view class="container">
			<view id="toparea" class="flex">
			  <!-- 左边 -->
			  <view class="roomleft">
			    <view class="label">正在讲解</view>
			    <scroll-view scroll-y class="roomleftscroll">
			      <view v-for="(item,index) in initchunk['goods']['list']" :key="index" class="gooditem" @click="goGoods" :data-url="item['url']">
			        <image :src="item['image']" class="goods-pic" ></image>
			        <view class="price">￥{{item['price']}}</view>
			      </view>
			    </scroll-view>
			  </view>
			  <!-- 直播间 -->
			  <view class="roomright">
			     <live-player 
			      id="player" 
			      :src="initchunk['play_url'][0]" 
			      mode="live"
			      autoplay
			      @statechange="statechange" 
			      object-fit="fillCrop" 
			      :picture-in-picture-mode="['push', 'pop']"
			      @error="error" />
			    <!-- 顶部信息 -->
			    <view class="roomrttop">
			      <image :src="initchunk['employee']['avatar']" class="icon-user"></image>
			      <view class="infor">
			        <view class="name">{{initchunk['employee']['nickname']}}</view>
			        <!-- <view class="num">在线7383</view> -->
			      </view>
			      <!-- <view class="flex-1">
			        <view class="fllow">关注</view>
			      </view> -->
			      <!-- <view class="qingmi">
			        <view class="scroce">亲密值2</view>
			        <view class="linqu">领取</view>
			      </view> -->
			    </view>
			    <!-- 底部信息 -->
			    <view class="roomrtbottom">
			        <navigator url="/pages/order_addcart/order_addcart" hover-class="none" open-type="switchTab" class="btn-car">
			            <image class="icon-car" src="/static/images/car.png"></image>
			        </navigator>
			      <!-- <view class="btn-car" bindtap="gotocart">
			        <image class="icon-car" src="../../../images/live/car.png"></image>
			      </view> -->
			      <!-- <view class="zanwrap">
			        <image class="icon-zan" src="../../../images/live/zanroom.png"></image>
			      </view> -->
			    </view>
			  </view>
			  <!-- end -->
			</view>
			
			<view class="commentareawrap" :style="{height:commentareaH+'px'}">
			  <scroll-view :scroll-into-view="'chat'+msgs.length" scroll-y :style="{height:commentareaH+'px'}">
			    <view class="tips">喜欢主播点赞哦，加购TA推荐的好货!智联绿色直播，禁止低俗、引诱、暴露等一切黄赌毒内容，警察叔叔24小时巡查哦！！！</view>
			    <view class="msgs-wrapper">
			      <view class="msgs" 
			        v-for="(item,index) in msgs" 
			        :key="index"
			        :id="'chat'+index+1">
			        <text class="msg-item">
			          <text class="nickname">{{item.fromAccountNick}}</text>{{item.content}}
			        </text>
			      </view>
			    </view>
			  </scroll-view>
			  <view @click="chatbtnhandle" class="btn-chat">
			    <image  class="icon-chat" src="/static/images/chat.png"></image>
			  </view>
			</view>
			<view 
			  v-if="isMsgContent"
			  :style="{bottom:keyboard_height + 'px'}" 
			  class="input-section">
			  <input :value="msgContent" 
			  :adjustPosition="false"
			  class="txt"
			  :focus="isMsgContent"
			  placeholder="说点什么吧"
			  @focus="focusmsgContentFocus"
			  @keyboardheightchange="keyboardHeightChange"
			  @blur="blurmsgContenthandle" 
			  @input="msgContenthandle"
			  @confirm="bindConfirm" />
			  <view @click="bindConfirm" class="btn-send" :class="msgContent ? 'btn-sended':''">发送</view>
			</view>
		</view>
	</view>
</template>

<script>
	var webim = require('@/utils/wxim/webim_wx.js');
	var webimhandler = require('@/utils/wxim/webim_handler.js');
	global.webim = webim;
	import {
	    getusersig, visitChannel
	} from "../../api/live.js";
	
	export default {
		data(){
			return {
				title:'超级购物台',
				commentareaH: 178, //下面高度
				userSig: '',
				identifier: '',
				nickName: '',
				avChatRoomId: '',
				sdkappid: '',
				//input输入
				msgContent: "",
				isMsgContent: false,
				msgs: [],
				ctx:null,
			}
		},
		onLoad: function(options) {
		    let self = this;
		    this.init();
		  
		    if (options['detail']){ // 列表直接点过来的方式
		        let info = JSON.parse(decodeURIComponent(options['detail']));
		        self.prepareData(info);
		    } else if(options['id']){ // 传ID的方式
		        visitChannel(options['id']).then(res => {
		            // console.log(res);
		            self.prepareData(res.data);
		        }).catch(err=>{
					uni.showToast({
						title: err,
						icon: 'none',
						duration: 2000
					});
					setTimeout(()=>{
						uni.reLaunch({
							url:'/pages/live/index'
						})
					},2000);
		        });
		    }else{
				uni.showToast({
					title: '参数丢失',
					icon: 'none',
					duration: 2000
				});
				setTimeout(()=>{
					uni.reLaunch({
						url:'/pages/live/index'
					})
				},2000);
		    }
		    
		},
		//登出 - webim.logout(cbOk, cbErr)
		onUnload: function() {
		    webimhandler.logout()
		},
		onReady: function() {
		    this.ctx = wx.createLivePlayerContext('player')
		},
		onShow: function() {
		    uni.setKeepScreenOn({
		        keepScreenOn: true
		    })
		},
		methods:{
			prepareData(data){
			    let self = this;
				this.initchunk = data;
				getusersig().then(res => {
				    let initchunk = self.data.initchunk
				    let {
				        data,
				        status
				    } = res;
				    if (status == 200) {
						this.userSig = data.im_user_sig//im登录密码(当前用户签名，必选)
						this.identifier = data.im_user_id//im用户名(当前用户身份标识，必选)
						this.nickName = data.nickname//用户名(当前用户昵称，选填)
						this.sdkappid = data.sdkAppID//填入创建腾讯云通讯应用获取到的 sdkappid
						this.avChatRoomId = initchunk.im_room_id//互动直播聊天室的群ID
						self.initIM()
				    }
				})
			},
			// 跳转到商品
			goGoods(e) {
			    let url = e.currentTarget.dataset['url']
			    uni.navigateTo({
			        url: url
			    });
			},
			// 去购物车
			gotocart(){
			    uni.navigateTo({
			        url: '/pages/order_addcart/order_addcart'
			    });
			},
			//发送消息
			bindConfirm: function(e) {
			    var _this = this;
			    var content = this.data.msgContent;
			    if (!content.replace(/^\s*|\s*$/g, '')) return
			    webimhandler.onSendMsg(content, function() {
			        _this.clearInput();
			    })
			},
			msgContenthandle(e) {
			    var content = e.detail.value;
				this.msgContent = content;
			},
			chatbtnhandle() {
				this.isMsgContent = true;
			},
			blurmsgContenthandle() {
				this.isMsgContent = false;
				this.keyboard_height = 0;
			},
			focusmsgContentFocus(e) {
			    // 输入框获取焦点, 通过软键盘高度设置输入框位置
				this.keyboard_height = e.detail.height;
			},
			keyboardHeightChange(e) {
				this.keyboard_height = e.detail.height
			},
			//点赞
			bindTap: function() {
			    webimhandler.sendGroupLoveMsg();
			},
			//消息数据处理
			receiveMsgs: function(data) {
			    console.log('receiveMsgs', data);
			    var msgs = this.data.msgs || [];
			    msgs.push(data);
			    //最多展示20条信息
			    if (msgs.length > 20) {
			        msgs.splice(0, msgs.length - 20)
			    }
			
			    // 此处消息数据处理
				this.msgs = msgs;
			},
			statechange(e) {
			    console.log('live-player code:', e.detail.code)
			},
			error(e) {
			    console.error('live-player error:', e.detail.errMsg)
			},
			init() {
			    let _this = this;
			    uni.getSystemInfo({
			        success: res => {
			            let window_H = res.windowHeight;
			            var query = uni.createSelectorQuery();
			            let commentareaH
			            query.select('#toparea').boundingClientRect(res => {
			                commentareaH = window_H - res.height
			            }).exec();
			            query.select('#toptitarea').boundingClientRect(res => {
			                commentareaH = commentareaH - res.height - 10
			                _this.setData({
			                    "commentareaH": commentareaH
			                })
			            }).exec();
			        }
			    })
			},
			//初始化IM
			initIM: function() {
			    var that = this;
			    var avChatRoomId = that.data.avChatRoomId; //聊天群ID
			    var sdkappid = that.data.sdkappid; //创建通讯云通信获取到的sdkappid
			
			    //初始化信息
			    webimhandler.init({
			        accountMode: 0, //帐号模式，0-表示独立模式，1-表示托管模式(已停用，仅作为演示)
			        accountType: 1, //已废弃
			        sdkAppID: sdkappid,
			        avChatRoomId: avChatRoomId, //默认房间群ID，群类型必须是直播聊天室（AVChatRoom）
			        selType: webim.SESSION_TYPE.GROUP, //群聊类型
			        selToID: avChatRoomId, //群聊id
			        selSess: null //当前聊天会话
			    });
			
			    //当前用户身份
			    var loginInfo = {
			        'sdkAppID': sdkappid, //用户所属应用id,必填
			        'appIDAt3rd': sdkappid, //用户所属应用id，必填
			        'accountType': 1, // 已废弃
			        'identifier': that.data.identifier, //当前用户ID,必须是否字符串类型，选填
			        'identifierNick': that.data.nickName || '', //当前用户昵称，选填
			        'userSig': that.data.userSig, //当前用户身份凭证，必须是字符串类型，选填
			    };
			
			    // 监听群被解散，退出直播间 
			    var onDestoryGroupNotify = function(notify) {
			        console.log('群被解散');
			        // webim.Log.warn("执行 解散群 回调：" + JSON.stringify(notify));
			        // var reportTypeCh = "[群被解散]";
			        // var content = "群主" + notify.Operator_Account + "已解散该群";
			        // console.log(notify.ReportType, reportTypeCh, notify.GroupId, notify.GroupName, content, notify.MsgTime);
					uni.showToast({
						title: '直播已结束！',
						icon: 'none',
						duration: 2000
					});
					setTimeout(()=>{
						uni.reLaunch({
							url:'/pages/live/index'
						})
					},2000)
			    }
			
			    //监听（多终端同步）群系统消息方法，方法都定义在demo_group_notice.js文件中
			    var onGroupSystemNotifys = {
			        // "5": webimhandler.onDestoryGroupNotify, //群被解散(全员接收)
			        "5": onDestoryGroupNotify, //群被解散(全员接收)
			        "11": webimhandler.onRevokeGroupNotify, //群已被回收(全员接收)
			        "255": webimhandler.onCustomGroupNotify //用户自定义通知(默认全员接收) 
			    };
			
			    //监听连接状态回调变化事件
			    var onConnNotify = function(resp) {
			        switch (resp.ErrorCode) {
			            //连接状态正常,可正常收发消息
			            case webim.CONNECTION_STATUS.ON:
			                webim.Log.warn('连接状态正常...');
			                break;
			                //连接已断开，当前用户已离线，无法收信息
			            case webim.CONNECTION_STATUS.OFF:
			                webim.Log.warn('连接已断开，无法收到新消息，请检查下你的网络是否正常');
			                break;
			            case webim.CONNECTION_STATUS.RECONNECT:
			                webim.Log.warm('连接重新建立')
			            default:
			                webim.Log.error('未知连接状态,status=' + resp.ErrorCode);
			                break;
			        }
			    };
			
			    //监听事件
			    var listeners = {
			        //选填
			        "onConnNotify": webimhandler.onConnNotify,
			        //监听新消息(大群)事件，必填
			        "onBigGroupMsgNotify": function(msg) {
			            webimhandler.onBigGroupMsgNotify(msg, function(msgs) {
			                that.receiveMsgs(msgs);
			            })
			        },
			        //监听新消息(私聊(包括普通消息和全员推送消息)，普通群(非直播聊天室)消息)事件，必填
			        "onMsgNotify": webimhandler.onMsgNotify,
			        //监听（多终端同步）群系统消息事件，必填
			        "onGroupSystemNotifys": onGroupSystemNotifys,
			        // "onGroupSystemNotifys": function(msg){
			        //     webimhandler.onRevokeGroupNotify(msg);
			        //     console.log(msg);
			        // },
			        //监听群资料变化事件,选填
			        "onGroupInfoChangeNotify": webimhandler.onGroupInfoChangeNotify
			    };
			
			    //其他对象，选填
			    var options = {
			        //是否访问正式环境，默认访问正式，选填
			        'isAccessFormalEnv': true,
			        //是否开启控制台打印日志,默认开启，选填
			        'isLogOn': false
			    };
			
			    //登录
			    webimhandler.sdkLogin(loginInfo, listeners, options, avChatRoomId);
			
			},
		}
	}
</script>

<style lang="scss">
	
	.navbar{
		text-align: center;
		height: 61px;
		position: fixed;
		background-color: #fff;
		top: 0;
		left: 0;
		z-index: 999;
		width: 100%;
		background-color: #DF828C;
		.title{
			color: #fff;
			font-size: 36rpx;
			line-height: 61px;
			font-weight: bold;
		}
	}
		
	.container{
		padding-top: 61px;
	}
	page{
	  background-color: #DF828C !important;
	  min-height: 100vh;
	}
	.flex{display:flex }
	.flex-1{flex:1}
	::-webkit-scrollbar{
	  width: 0;
	  height: 0;
	  color: transparent;
	}
	.roomleft{
	  width:176rpx;
	  height:842rpx;
	}
	.roomleft .label{
	  width:110rpx;
	  height:30rpx;
	  line-height:30rpx;
	  text-align: center;
	  background-color: #ff1200;
	  font-size: 18rpx;
	  color:#ffffff;
	}
	.roomleftscroll{
	  height:812rpx;
	  margin-left:24rpx;
	}
	.roomleftscroll .gooditem{
	  margin-top:18rpx;
	  width:130rpx;
	  height:130rpx;
	  position: relative;
	}
	.roomleftscroll .goods-pic{
	  width:130rpx;
	  height:130rpx;
	}
	.roomleftscroll .price{
	  position: absolute;
	  bottom:0;
	  left:0;
	  right:0;
	  padding-left:10rpx;
	  padding-right:10rpx;
	  height:30rpx;
	  line-height:30rpx;
	  background-color: rgba(0, 0, 0, 0.3);
	  font-size: 18rpx;
	  color:#ffffff;
	}
	
	.commentareawrap{
	  padding-left:24rpx;
	  padding-right:24rpx;
	  position: relative;
	  margin-top:10px;
	}
	.commentareawrap .tips{
	  font-size: 24rpx;
	  color:#fffefe;
	}
	.msgs-wrapper{
	  margin-top:20rpx;
	}
	.msgs-wrapper .msgs{
	   font-size:24rpx;
	   color:#ffffff;
	   max-width:560rpx;
	   margin-bottom:10px;
	}
	.msgs-wrapper .msgs .msg-item{
	  color:#ffffff; 
	}
	.msgs-wrapper .msgs .nickname{
	  color:#ffb497;
	  margin-right:10px;
	}
	.input-section{
	  position:fixed;
	  left:0;
	  right:0;
	  bottom:0;
	  display: flex;
	  background-color: #ffffff;
	  padding-left:10px;
	  padding-right:10px;
	}
	.input-section .txt{
	  flex:1;
	  height:30px;
	  line-height:30px;
	  margin-top:6px;
	  margin-bottom:6px;
	  background-color: #f5f5f5;
	  border-radius:4px;
	  padding-left:10px;
	  padding-right:10px;
	}
	.input-section .btn-send{
	  height:30px;
	  line-height:30px;
	  margin-top:6px;
	  margin-bottom:6px;
	  padding-left:20px;
	  padding-right:20px;
	  border-radius: 30px;
	  margin-left:20px;
	  background-color: #f5f5f5;
	  color:#999999;
	}
	.input-section .btn-sended{
	  background-color: #747BB1;
	  color:#ffffff;
	}
	.btn-chat{
	  position: absolute;
	  right:24rpx;
	  bottom:10px;
	  width:74rpx;
	  height: 74rpx;
	  border-radius:100%;
	  display: flex;
	  align-items: center;
	  justify-content: center;
	  background-color: rgba(0, 0, 0, 0.3);
	}
	.btn-chat .icon-chat{
	  width:47rpx;
	  height:45rpx;
	}
	
	.roomright{
	  height:842rpx;
	  width:576rpx;
	  background: #f5f5f5;
	  position: relative;
	}
	live-player{
	  height:842rpx;
	  width:576rpx;
	}
	
	.roomrttop{
	  position: absolute;
	  left:0;
	  right:0;
	  top:10px;
	  display: flex;
	  align-items: center;
	}
	.roomrttop .icon-user{
	  height:48rpx;
	  width:48rpx;
	  border-radius: 100%; 
	  margin-left:20rpx; 
	}
	.roomrttop .infor{
	  margin-left:15rpx; 
	}
	.roomrttop .infor .name{
	  font-size: 24rpx;
	  color:#ffffff;
	  font-weight:500;
	}
	.roomrttop .infor .num{
	  font-size: 18rpx;
	  color:#ffffff;
	}
	
	.roomrttop .fllow{
	  margin-left: 20rpx;
	  width: 90rpx;
	  height: 40rpx;
	  line-height: 40rpx;
	  border-radius: 40rpx;
	  border: 1px solid #ff0000;
	  color: #ff0000;
	  font-size: 23rpx;
	  text-align: center;
	}
	.roomrttop .qingmi{
	  height: 40rpx;
	  min-width: 140rpx;
	  border-radius:40rpx 0 0 40rpx;
	  background: rgba(0, 0, 0, 0.3);
	  display: flex;
	  align-items: center;
	}
	.roomrttop .qingmi .scroce{
	  color:#ff1200;
	  font-size: 18rpx;
	  margin-left:10px;
	}
	.roomrttop .qingmi .linqu{
	  width:60rpx;
	  height: 24rpx;
	  color:#ffffff;
	  text-align: center;
	  border-radius: 24rpx;
	  margin-left:5px;
	  margin-right:5px;
	  font-size: 16rpx;
	  background-image: linear-gradient(to right,#ff0000 0%,#ff4800 100%);
	}
	
	.roomrtbottom{
	  position: absolute;
	  left:0;
	  right:0;
	  bottom:10px;
	  display: flex;
	  align-items: center;
	  justify-content:flex-end;
	}
	.btn-car{
	  margin-right:30rpx;
	  width:86rpx;
	  height: 86rpx;
	  border-radius:100%;
	  display: flex;
	  align-items: center;
	  justify-content: center;
	  background-color: rgba(0, 0, 0, 0.3);
	}
	.btn-car .icon-car{
	  width:48rpx;
	  height:37rpx;
	}
	.zanwrap{
	  margin-right:30rpx;
	  width:86rpx;
	  height: 86rpx;
	  border-radius:100%;
	  display: flex;
	  align-items: center;
	  justify-content: center;
	  background-image: linear-gradient(to right,#ff0000 0%,#ff4800 100%);
	}
	.zanwrap .icon-zan{
	  width:48rpx;
	  height:44rpx;
	}
</style>
