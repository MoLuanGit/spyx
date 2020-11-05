<template>
	<view class="container" @click="hideList">
		<view id="toparea" class="flex">
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
		      <image :src="initchunk['anchor_img']" class="icon-user"></image>
		      <view class="infor">
		        <view class="name">{{initchunk['anchor_name']}}</view>
		        <view class="num">1.6万本场点赞</view>
		      </view>
			  <view class="btn" @click="toFocus" v-if="initchunk['is_focus'] == 0">
			  	关注
			  </view>
			  <view class="btn" v-else>
			  	已关注
			  </view>
		    </view>
		    
		  </view>
		  <!-- end -->
		</view>
		
		<!-- 底部信息 -->
		<view class="commentareawrap" :style="{height:commentareaH+60+'px'}">
		  <scroll-view :scroll-into-view="'chat'+msgs.length" scroll-y :style="{height:commentareaH+'px'}" style="margin-bottom: 60px;">
		    <view class="msgs-wrapper" >
		      <view class="msgs" 
		        v-for="(item,index) in msgs" 
		        :key="index"
		        :id="'chat'+index+1">
		        <view class="msg-item">
		          <view class="nickname">{{item.fromAccountNick}}:</view>
				  <view class="content">{{item.content}}</view>
		        </view>
		      </view>
		    </view>
		  </scroll-view>

		  <view class="roomrtbottom">
		    <view @click="chatbtnhandle" class="btn-input">
				<view class="text">
					说点什...
				</view>
				<image class="icon-car" src="/static/images/live-input.png"></image>
		    </view>
		    <view class="btns">
		    	<view class="btn-car btn-car1" @click.stop="showGoods">
		    	  <image class="icon-car" src="/static/images/car1.png"></image>
		    	</view>
		    	<view class="btn-car btn-car2">
		    	  <image class="icon-car" src="/static/images/zanroom1.png"></image>
		    	</view>
		    	<view class="btn-car btn-car3" @click="logout">
		    	  <image class="icon-car" src="/static/images/cancel.png"></image>
		    	</view>
		    </view>
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
		
		<!-- 商品列表弹窗 -->
		<view class="goodslists" :class="showGoodsList==-1?'hide':showGoodsList==1?'show':''" @click.stop="">
			<view class="goods-title">
				共{{goodsNums}}件商品
			</view>
			<scroll-view scroll-y class="lists">
			  <view class="list-item"
			    v-for="(item,index) in goodsLists" 
			    :key="index"
				:class="item.is_ing == 1?'active-bg':''">
				<view class="img">
					<image :src="item.cover_img" class="goods-img"></image>
					<view class="is-ing" v-if="item.is_ing">
						<image src="/static/images/is_ing.png" class="img1"></image>
						<view class="">
							讲解中
						</view>
					</view>
				</view>
				<view class="info">
					<view class="goodsname">
						{{item.name}}
					</view>
					<view class="bottom">
						<view class="price">
							<image src="/static/images/meiyuan.png" class="icon-price"></image>
							{{item.price}}
						</view>
						<view class="btn" @click="toBuy(item.product_id)">
							去抢购
						</view>
					</view>
				</view>
			  </view>
			</scroll-view>
		</view>
	</view>
</template>

<script>
	var webim = require('@/utils/wxim/webim_wx.js');
	var webimhandler = require('@/utils/wxim/webim_handler.js');
	global.webim = webim;
	import {
	    getusersig, visitChannel,liveFocus
	} from "../../api/live.js";
	
	export default {
		data(){
			return {
				goodsNums:24,
				showGoodsList:0,
				goodsLists:[
					// {
					// 	'image':'/static/images/bargainBg.jpg',
					// 	'price':123.8,
					// 	'goodsname':'好波内衣女春夏新款无钢圈',
					// 	'is_ing':1,
					// },
					// {
					// 	'image':'/static/images/bargainBg.jpg',
					// 	'price':123.8,
					// 	'goodsname':'好波内衣女春夏新款无钢圈',
					// 	'is_ing':0,
					// },
					// {
					// 	'image':'/static/images/bargainBg.jpg',
					// 	'price':123.8,
					// 	'goodsname':'好波内衣女春夏新款无钢圈',
					// 	'is_ing':0,
					// },
					// {
					// 	'image':'/static/images/bargainBg.jpg',
					// 	'price':123.8,
					// 	'goodsname':'好波内衣女春夏新款无钢圈',
					// 	'is_ing':0,
					// },
					// {
					// 	'image':'/static/images/bargainBg.jpg',
					// 	'price':123.8,
					// 	'goodsname':'好波内衣女春夏新款无钢圈',
					// 	'is_ing':0,
					// },
					// {
					// 	'image':'/static/images/bargainBg.jpg',
					// 	'price':123.8,
					// 	'goodsname':'好波内衣女春夏新款无钢圈',
					// 	'is_ing':1,
					// },
					// {
					// 	'image':'/static/images/bargainBg.jpg',
					// 	'price':123.8,
					// 	'goodsname':'好波内衣女春夏新款无钢圈',
					// 	'is_ing':0,
					// },
				],
				title:'超级购物台',
				commentareaH: 255, //下面高度
				userSig: '',
				identifier: '',
				nickName: '',
				avChatRoomId: '',
				sdkappid: '',
				//input输入
				msgContent: "",
				isMsgContent: false,
				msgs: [
					// {
					// 	'fromAccountNick':'zs',
					// 	'content':'玩哈哈哈，哇哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈13哈哈哈哈哈哈',
					// },
					// {
					// 	'fromAccountNick':'ls',
					// 	'content':'22',
					// },
					// {
					// 	'fromAccountNick':'ww',
					// 	'content':'有意所哦和有三亚房价是阿斯顿法国红酒看来',
					// },
					// {
					// 	'fromAccountNick':'zs',
					// 	'content':'11',
					// },
					// {
					// 	'fromAccountNick':'ls',
					// 	'content':'22',
					// },
					// {
					// 	'fromAccountNick':'ww',
					// 	'content':'有意所以',
					// },
				],
				ctx:null,
				initchunk:{
					// 'cover':'/static/images/bargainBg.jpg',
					// 'title':'冬日温暖，贴身舒适',
					// 'play_url':[
					// 	'',
					// ],
					// 'employee':{
					// 	'nickname':'直播柚子酱',
					// 	'avatar':'/static/images/bargainBg.jpg',
					// },
					// 'goods':{
					// 	list:[{
					// 		'image':'/static/images/address.png'
					// 	},
					// 	{
					// 		'image':'/static/images/address.png'
					// 	}],
					// 	count:23
					// }
				},
			}
		},
		onLoad: function(options) {
		    let self = this;
		    this.init();
		  
		    if(options['id']){ // 传ID的方式
				console.log('111')
		        visitChannel(options['id']).then(res => {
		            console.log(res);
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
			// #ifdef MP
		    this.ctx = uni.createLivePlayerContext('player')
			// #endif
		},
		onShow: function() {
			// #ifdef MP
			//保持常亮状态
			uni.setKeepScreenOn({
			    keepScreenOn: true
			})
			// #endif
		},
		methods:{
			//点击底部x按钮
			logout(){
				
			},
			//去抢购
			toBuy(product_id){
				console.log('product_id',product_id)
			},
			//关注主播
			toFocus(){
				let id = this.initchunk.store_staff_id;
				liveFocus(id).then(res=>{
					console.log(res)
				}).catch(e=>{
					uni.showToast({
						title: e,
						icon: 'none',
						duration: 2000
					});
				})
			},
			//隐藏商品列表
			hideList(e){
				this.showGoodsList = this.showGoodsList != 0 && -1;
			},
			showGoods(){
				console.log('showgoods')
				this.showGoodsList = 1;
			},
			prepareData(data){
			    let self = this;
				this.initchunk = data;
				this.goodsLists = data.channel_products;
				getusersig().then(res => {
				    let initchunk = self.initchunk
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

			//发送消息
			bindConfirm: function(e) {
			    var _this = this;
			    var content = this.msgContent;
			    if (!content.replace(/^\s*|\s*$/g, '')) return
			    webimhandler.onSendMsg(content, function() {
			        _this.clearInput();
			    })
			},
			clearInput(){
				this.msgContent = '';
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
			    var msgs = this.msgs || [];
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
			    var avChatRoomId = that.avChatRoomId; //聊天群ID
			    var sdkappid = that.sdkappid; //创建通讯云通信获取到的sdkappid
			
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
			        'identifier': that.identifier, //当前用户ID,必须是否字符串类型，选填
			        'identifierNick': that.nickName || '', //当前用户昵称，选填
			        'userSig': that.userSig, //当前用户身份凭证，必须是字符串类型，选填
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
	.goodslists{
		width:100%;
		height:0;
		background-color: #fff;
		position: fixed;
		z-index: 10;
		bottom: 0;
		border-radius: 20rpx 20rpx 0 0;
		
		.goods-title{
			height:80rpx;
			background-color: #fff;
			line-height: 80rpx;
			padding-left: 30rpx;
			color:#333;
			border-radius: 20rpx 20rpx 0 0;
		}
		.lists{
			height: calc(800rpx - 80rpx);
			min-height: 400rpx;
		}
	}
	@keyframes showList{
		0%{
			height:0rpx;
		},
		100%{
			height:800rpx;
		}
	}
	@keyframes hideList{
		0%{
			height:800rpx;
		},
		100%{
			height:0rpx;
		}
	}
	.show{
		animation: showList 0.5s ease 0s 1 alternate forwards;
	}
	.hide{
		animation: hideList 0.5s ease 0s 1 alternate forwards;
	}
	.active-bg{
		background-color: #FEF4F4;
	}
	.list-item{
		height:200rpx;
		// border-bottom:1rpx solid #ccc;
		padding: 20rpx 24rpx;
		display: flex;
		justify-content: space-between;
			
		.img{
			position: relative;
			.goods-img{
				width: 160rpx;
				height: 160rpx;
			}
			.is-ing{
				width: 160rpx;
				height: 40rpx;
				background: linear-gradient(-90deg, rgba(255,90,0,0.5), rgba(255,129,79,0.5));
				position: absolute;
				bottom: 0;
				font-size: 24rpx;
				color:#fff;
				justify-content: center;
				align-items: center;
				display: flex;
				.img1{
					width: 20rpx;
					height: 20rpx;
					margin-right: 10rpx;
				}
			}
		}
		.info{
			flex:1;
			display: flex;
			padding-left: 20rpx;
			flex-direction: column;
			justify-content: space-between;
			.goodsname{
				font-size: 30rpx;
				color: #333333;
			}
			.bottom{
				width: 100%;
				display: flex;
				justify-content: space-between;
				align-items: flex-end;
				.price{
					color: #FF5A00;
					font-size: 38rpx;
					font-weight: 500;
					.icon-price{
						width:12rpx;
						height:14rpx;
					}
				}
				.btn{
					width: 160rpx;
					height: 60rpx;
					background: linear-gradient(-90deg, #FF5A00, #FF814F);
					border-radius: 5rpx;
					line-height: 60rpx;
					text-align: center;
					color:#FFFFFF;
					font-size: 30rpx;
				}
			}
		}
	}
	.container{
		min-height: 100vh;
	}
	page{
	  min-height: 100vh;
	}
	.flex{display:flex }
	.flex-1{flex:1}
	::-webkit-scrollbar{
	  width: 0;
	  height: 0;
	  color: transparent;
	}
	
	.commentareawrap{
		width: 100%;
	  padding-left:24rpx;
	  padding-right:24rpx;
	  position: fixed;
	  bottom: 0;
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
	  display: flex;
	  padding: 0 31rpx;
	  background: rgba(0,0,0,0.17);
	  border-radius: 35rpx;
	  // line-height: 60rpx;
	  font-size: 30rpx;
	 
	  .content{
		  line-height: 50rpx;
		  margin-top:10rpx;
		  margin-bottom:10rpx;
	  }
	}
	.msgs-wrapper .msgs .nickname{
		line-height: 50rpx;
	  color:#6CDBFF;
		margin-top:10rpx;
	  margin-bottom:10rpx;
		margin-right: 13rpx;
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
	  height:100vh;
	  width:750rpx;
	  // background: #f5f5f5;
	  background-color: #DF828C !important;
	  position: relative;
	}
	live-player{
	  height:100vh;
	  width:750rpx;
	}
	
	.roomrttop{
	  position: absolute;
	  left:24rpx;
	  top:35rpx;
	  display: flex;
	  align-items: center;
	  width: 375rpx;
	  height: 100rpx;
	  background: rgba(0,0,0,0.17);
	  border-radius: 50rpx;
		.btn{
			width: 120rpx;
			height: 60rpx;
			background: linear-gradient(-90deg, #FF5A00, #FF814F);
			border-radius: 30px;
			line-height: 60rpx;
			text-align: center;
			color:#FEFEFE;
			font-size: 30rpx;
		}
	}
	.roomrttop .icon-user{
	  height:70rpx;
	  width:70rpx;
	  border-radius: 50%; 
	  margin-left:8rpx; 
	}
	.roomrttop .infor{
	  margin-left:4rpx; 
	  margin-right:8rpx; 
	}
	.roomrttop .infor .name{
	  font-size: 30rpx;
	  color:#ffffff;
	  font-weight:500;
	}
	.roomrttop .infor .num{
	  font-size: 24rpx;
	  margin-left: -20rpx;
	  color:#ffffff;
	  transform: scale(0.8);
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
	  bottom:32rpx;
	  padding: 0 24rpx;
	  display: flex;
	  align-items: center;
	  justify-content:space-between;
	  .btn-input{
		  width: 270rpx;
		  height: 70rpx;
		  background: rgba(0,0,0,0.17);
		  border-radius: 35rpx;
		  line-height: 70rpx;
		  padding: 0 31rpx;
		  color:#6CDBFF;
		  font-size: 30rpx;
		  display: flex;
		  justify-content: space-between;
		  align-items: center;
		  .icon-car{
			  width: 28rpx;
			  height:40rpx;
		  }
	  }
	  .btns{
		  display: flex;
	  }
	}
	.btn-car{
	  width:74rpx;
	  height: 74rpx;
	  border-radius:100%;
	  display: flex;
	  align-items: center;
	  justify-content: center;
	  background-color: rgba(0, 0, 0, 0.3);
	}
	.btn-car1 .icon-car{
	  width:48rpx;
	  height:48rpx;
	}
	.btn-car2 {
	  margin-left: 44rpx;
	  .icon-car{
		  width:48rpx;
		  height:44rpx;
	  }
	}
	.btn-car3{
		margin-left: 44rpx;
		.icon-car{
		  width:40rpx;
		  height:40rpx;
		}
	}
	.zanwrap{
	  margin-right:30rpx;
	  width:86rpx;
	  height: 86rpx;
	  border-radius:100%;
	  display: flex;
	  align-items: center;
	  justify-content: center;
	  // background-image: linear-gradient(to right,#ff0000 0%,#ff4800 100%);
	}
	.zanwrap .icon-zan{
	  width:48rpx;
	  height:44rpx;
	}
</style>
