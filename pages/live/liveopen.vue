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
			
			<live-pusher
			  :url="initchunk['push_url']"
			  mode="RTC"
			  autopush
			  :beauty = "beauty"
			  :whiteness = "beauty"
			  @statechange="statechange"
			  @error = "errorhandle"
			  id="pusher"
			/>
			
			<view class="roomrttop">
			  <image :src="initchunk['avatar']" class="icon-user"></image>
			  <view class="infor flex-1">
			    <view class="name">{{initchunk['nickname']}}</view>
			    <view class="num">在线7383</view>
			  </view>
			</view>
			
			<view class="roomutils">
			  <view @click="bindSwitchCamera" class="item">
			    <image class="pic" src="/static/images/back.png"></image>
			    <view class="des">翻转</view>
			  </view>
			  <view @click="beautyhandle" class="item m-t30">
			    <image class="pic" src="/static/images/meiyan.png"></image>
			    <view class="des">美颜</view>
			  </view>
			</view>
			
			
			<view class="operawrap" :style="{bottom:keyboard_height ? keyboard_height+'px':"10"+'px'}">
			  <scroll-view :scroll-into-view="'chat'+msgs.length" class="msgswrap" scroll-y>
			    <view class="tips">喜欢主播点赞哦，加购TA推荐的好货!智联绿色直播，禁止低俗、引诱、暴露等一切黄赌毒内容，警察叔叔24小时巡查哦！！！</view>
			    <view class="msgs-wrapper">
			      <view class="msgs" 
			        v-for="(item,index) in msgs" 
			        :key="index"
			        id="'chat'+index+1">
			        <text class="msg-item">
			          <text class="nickname">{{item.fromAccountNick}}</text>{{item.content}}
			        </text>
			      </view>
			    </view>
			  </scroll-view>
			  <view class="operabtns">
			    <view class="flex-1">
			      <view @click="chatbtnhandle" class="btn-chat">
			        <image class="icon-chat" src="/static/images/chat.png"></image>
			      </view>
			    </view>
			    <view @click="shopbaghandle" class="btn-chat">
			      <image class="icon-chat" src="/static/images/shopbag.png"></image>
			    </view>
			    <view @click="liveouthandle" class="btn-chat m-l10">
			      <image class="icon-chat" src="/static/images/liveout.png"></image>
			    </view>
			  </view>
			</view>
			
			<view class="goodswrap" :class="isshopbag ? 'on':''">
			  <view class="top flex">
			    <view class="tit">共{{initchunk['goods']['count']}}件商品</view>
			    <view @click="shopbagclose" class="iconfont icon-guanbi"></view>
			  </view>
			  
			  <view class="goodsscroll">
			    <scroll-view style="height:300px" :scroll-into-view="'chat'+msgs.length" scroll-y>
			      <view v-for="(item,index) in initchunk['goods']['list']" :key="index" class="item">
			        <view class="picwrap">
			          <image class="pic" :src="item['image']"></image>
			          <view class="order">{{index+1}}</view>
			        </view>
			        <view class="desc">
			          <view class="goodtit">{{item['name']}}</view>
			          <view class="price">￥{{item['price']}}</view>
			        </view>
			        <view @click="recomhandle" class="recombtn">推荐</view>
			      </view>
			    </scroll-view>
			  </view>
			</view>
			
			
			<view 
			  v-if="isMsgContent"
			  @click="blurmsgContenthandle" 
			  class="input-sectionwrap" >
			  <view 
			    :style="{bottom:keyboard_height+'px'}"
			    data-area="inputsectionwrap" 
			    class="input-section">
			    <input :value="msgContent"
			     data-area="inputtxt" 
			    :adjustPosition="false"
			    class="txt"
			    :focus="isinputfocus"
			    :placeholder="msgContent ? '':'说点什么吧'"
			    @focus="focusmsgContentFocus"
			    :hold-keyboard="holdkeyboard"
			    @keyboardheightchange="keyboardHeightChange" 
			    @input="msgContenthandle"
			    @confirm="bindConfirm" >
			      <view data-area="btnsend" @click="bindConfirm" class="btn-send" :class="msgContent ? 'btn-sended':''">发送</view>
			    </input>
			  </view>
			</view>
		</view>
	</view>
	
</template>

<script>
	import {
	    channelInfo,
	    closechannel
	} from '../../api/live.js';
	
	var webim = require('@/utils/wxim/webim_wx.js');
	var webimhandler = require('@/utils/wxim/webim_handler.js');
	global.webim = webim;
	
	export default {
		data() {
			return {
				title:'正在直播中',
				beauty: 6,
				initchunk: '',
				userSig: '',
				identifier: '',
				nickName: '',
				avChatRoomId: '',
				sdkappid: '',
				//input输入
				msgContent: "",
				isMsgContent: false,
				msgs: [],
				isshopbag: false,
				holdkeyboard: true,
				ctx:null,
			};
		},
		onReady: function() {
		    this.ctx = wx.createLivePusherContext('pusher')
		},
		onLoad: function(options) {
		    options['channel_id'] && this.initdata(options['channel_id'])
		},
		onShow: function() {
		    //保持常亮状态
		    uni.setKeepScreenOn({
		        keepScreenOn: true
		    })
		},
		methods:{
			initdata(id) {
			    channelInfo(id).then(res => {
			        let {
			            data,
			            status
			        } = res
			        if (status == 200) {
						this.initchunk = data;
						this.userSig = data.im.im_user_sig;
						this.identifier = data.im.im_user_id;
						this.nickName = data.nickname;
						this.sdkappid = data.im.sdkAppID;
						this.avChatRoomId = data.im.im_room_id;
						this.initIM()
			        }
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
				this.msgContent = content
			},
			chatbtnhandle() {
				this.isMsgContent = true;
				this.isinputfocus = true;
			},
			blurmsgContenthandle(e) {
			    let area = e.target.dataset['area'];
			    if (area == 'btnsend') {
			        return
			    }
			    if (area == 'inputsectionwrap') {
			        return
			    }
			    if (area == 'inputtxt') {
			        return
			    }
				this.isMsgContent = false;
				this.holdkeyboard = false;
				this.keyboard_height = 0;
			    console.log("keyboard_height=", this.data.keyboard_height)
			},
			focusmsgContentFocus(e) {
			    // 输入框获取焦点, 通过软键盘高度设置输入框位置
				this.keyboard_height = e.detail.height;
			},
			keyboardHeightChange(e) {
				this.keyboard_height = e.detail.height
			},
			//清空input内容
			clearInput: function() {
				this.msgContent = '';
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
			beautyhandle() {
			    let beauty = this.data.beauty;
			    if (beauty === 6) {
			        beauty = 9
			    } else {
			        beauty = 6
			    }
				this.beauty = beauty;
			},
			bindSwitchCamera() {
			    this.ctx.switchCamera({
			        success: res => {
			            console.log('switchCamera success')
			        },
			        fail: res => {
			            console.log('switchCamera fail')
			        }
			    })
			},
			//状态变化事件
			statechange(e) {
			    console.log('live-pusher code:', e.detail.code)
			},
			//错误触发
			errorhandle(e) {
			    console.log("错误触发=", e.detail.errCode)
			    let errCode = e.detail.errCode;
			    if (errCode == 10001) {
			        uni.showToast({
			            title: '请前往我的页面设置中允许使用摄像头功能,来保证直播功能正常使用',
			            icon: 'none',
			            duration: 3000
			        })
			        return
			    }
			    if (errCode == 10002) {
			        uni.showToast({
			            title: '请前往我的页面设置中允许使用麦克风功能，来保证直播功能正常使用',
			            icon: 'none',
			            duration: 3000
			        })
			        return
			    }
			},
			//登出 - webim.logout(cbOk, cbErr)
			onUnload: function() {
			    webimhandler.logout();
			    this.liveouthandle();
			},
			liveouthandle() {
			    let initchunk = this.data.initchunk;
			    closechannel(initchunk['channel_id']).then(res => {
			        uni.showToast({
			            title: res.data.msg,
			            icon: 'none',
			            duration: 2000,
			            success: res => {
			                uni.navigateBack({
			                    'delta': 1
			                })
			            }
			        })
			    })
			},
			shopbaghandle() {
			    let initchunk = this.data.initchunk;
			    if (initchunk['goods']['list'].length == 0) {
					uni.showToast({
						title: '推荐商品为空,请添加推荐产品！',
						icon:'none',
					})
			        return
			    }
				this.isshopbag = true;
			},
			shopbagclose() {
				this.isshopbag = false;
			},
			recomhandle() {
				uni.showToast({
					title: '功能开发中，请等待~',
					icon:'none',
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
			    var onDestoryGroupNotify = function (notify) {
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
			        "onGroupSystemNotifys": webimhandler.onGroupSystemNotifys,
			   
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
	  width:100vw;
	  height:100vh;
	  position: relative;
	  overflow: hidden;
	}
	.flex{display:flex }
	.flex-1{flex:1}
	::-webkit-scrollbar{
	  width: 0;
	  height: 0;
	  color: transparent;
	}
	live-pusher{
	  width:100vw;
	  height:100vh;
	}
	.roomutils{
	  position: absolute;
	  right:10px;
	  top:90px;
	}
	.roomutils .item{
	  text-align: center
	}
	.roomutils .item .pic{
	  width:48rpx;
	  height:48rpx;
	}
	.roomutils .item .des{
	  font-size:18rpx;
	  color:#ffffff;
	}
	.m-t30{
	  margin-top:30rpx;
	}
	.roomrttop{
	  position: absolute;
	  left:10px;
	  top:90px;
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
	.operawrap{
	  position: absolute;
	  left:10px;
	  right:10px;
	  bottom:10px;
	}
	.operawrap .operabtns{
	  display: flex;
	  align-items: center;
	}
	.btn-chat{
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
	.m-l10{
	  margin-left:10px;
	}
	.msgswrap{
	  width:580rpx;
	  max-height:200px;
	  margin-bottom:10px;
	}
	.msgswrap .tips{
	  background:rgba(0, 0, 0, 0.3);
	  font-size:24rpx;
	  color:#ffffff;
	  border-radius:12rpx;
	  padding:8px 10px;
	  line-height:20px;
	  margin-bottom:12px;
	}
	.msgs-wrapper .msgs{
	   font-size:24rpx;
	   color:#ffffff;
	   max-width:560rpx;
	   margin-bottom:10px;
	}
	.msgs-wrapper .msgs .msg-item{
	  color:#ffffff; 
	  background: rgba(0, 0, 0, 0.3);
	  min-height:30px;
	  padding-left:15px;
	  padding-right:15px;
	  border-radius:22px;
	  padding-top:3px;
	  padding-bottom:3px;
	}
	.msgs-wrapper .msgs .nickname{
	  color:#ffb497;
	  margin-right:10px;
	}
	.input-sectionwrap{
	  position: fixed;
	  left:0;
	  right:0;
	  bottom:0;
	  top:0;
	  background:transparent;
	}
	.input-section{
	  position:fixed;
	  left:0;
	  right:0;
	  bottom:0;
	  z-index:10;
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
	  padding-right:90px;
	}
	.input-section .btn-send{
	  position: absolute;
	  right:10px;
	  top:0;
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
	.goodswrap{
	  position:absolute;
	  left:0;
	  right:0;
	  bottom:0;
	  background-color:#ffffff;
	  min-height:100px;
	  border-radius:12px 12px 0 0;
	  transform: translate3d(0,100%,0);
	  transition: all .3s cubic-bezier(.25,.5,.5,.9);
	}
	.goodswrap.on{
	  transform: translate3d(0,0,0);
	}
	.goodswrap .top{
	  display: flex;
	  align-items: center;
	  padding:20rpx;
	  border-bottom:1px solid #f5f5f5;
	}
	.goodswrap .top .tit{
	  font-weight:500;
	  color:#323232;
	  font-size:30rpx;
	  flex: 1;
	}
	.goodswrap .goodsscroll{
	  margin-left:10px;
	  margin-right:10px;
	}
	.goodswrap .item{
	  display: flex;
	  align-items: center;
	  border-bottom:1px solid #f5f5f5;
	  padding-top:10px;
	  padding-bottom:10px;
	}
	.goodswrap .item:last-child{
	  border-bottom:none;
	}
	.goodswrap .item .picwrap{
	  width:140rpx;
	  height:140rpx;
	  position:relative;
	}
	.goodswrap .item .picwrap .pic{
	  width:140rpx;
	  height:140rpx;
	  display: block;
	}
	.goodswrap .item .picwrap .order{
	  position: absolute;
	  left:0;
	  top:0;
	  width:48rpx;
	  height:30rpx;
	  line-height:30rpx;
	  text-align: center;
	  border-radius:0 0 10rpx 0;
	  background: rgba(0, 0, 0, 0.3);
	  color:#ffffff;
	  font-size:20rpx;
	}
	.goodswrap .item .desc{
	  flex:1;
	  margin-left:10px;
	}
	.goodswrap .item .desc .goodtit{
	  color:#323232;
	  font-size:26rpx;
	  display:-webkit-box;
	  -webkit-box-orient: vertical;
	  -webkit-line-clamp:2;
	  overflow: hidden
	}
	.goodswrap .item .desc .price{
	  color:#ff0000;
	  font-size:26rpx;
	  margin-top:10px;
	}
	.goodswrap .item .recombtn{
	  margin-left:10px;
	  width:140rpx;
	  height:66rpx;
	  line-height:66rpx;
	  text-align:center;
	  border-radius: 12rpx;
	  background: #747BB1;
	  font-size:30rpx;
	  color:#ffffff;
	  font-weight:500;
	}
	
</style>
