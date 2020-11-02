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
			<view class='liveswiper'>
			  <swiper :indicator-dots="true" 
			    :autoplay="true" 
			    :interval="5000" 
			    :duration="1000"
			    class="swiper-box">
			    <block v-for="(item,index) in livelistdata['banner_list']" :key="index">
			      <swiper-item
			        bindtap="bannerurlhandle"
			        :data-url="item['url']"
			        class="swiperitemwrap">
			        <image :src="item['image']" class="pic-swiper"/>
			      </swiper-item>
			    </block>
			  </swiper>
			</view>
			
			<view class="p-w24">
			  <view class="listtitle">直播中</view>
			
			  <view 
			    v-for="(item,index) in livelistdata['living_list']" :key="index" 
			    :data-detail="item"
			    @click="liveaudience"
			    class="onlivewrap m-b30">
			    <view class="p-relative">
			      <image class="pic-goods" :src="item.cover"></image>
			      <view class="tag">
			        <image class="icon-onlive" src="/static/images/onlive.png"></image>
			        <text>直播中</text>
			      </view>
			    </view>
			    <view class="conwrap">
			      <view class="tit">{{item.title}}</view>
			      <view class="desc">{{item.employee.nickname}}</view>
			      <view class="pic-wrap">
			        <block 
			          v-for="(item,index) in item['goods']['list']" 
			          :key="index">
			          <image v-:if="index<2" class="pic-small" :src="item.image"></image>
			        </block>
			        
			        <view class="pic-small-tips">
			          <view>{{item['goods']['count']}}件</view>
			          <view>直播购</view>
			        </view>
			      </view>
			    </view>
			  </view>
			
			  <view class="listtitle">即将开播</view>
			
			  <view v-for="(item,index) in livelistdata['subscribe_list']" :key="index" class="onlivewrap m-b30">
			    <view class="p-relative">
			      <image class="pic-goods" :src="item.cover"></image>
			      <view class="tag">
			        <image class="icon-onlive" src="/static/images/yugao.png"></image>
			        <text>预告</text>
			      </view>
			    </view>
			    <view class="conwrap">
			      <view class="tit">{{item.title}}</view>
			      <view class="desc">{{item.employee.nickname}}</view>
			      <view class="kaibo-time">{{item.open_time}}</view>
			      <view :data-channelid= "item['channel_id']" bindtap="messagehandle" class="kaibo-btn" :data-index="index" v-if="item['is_subscribe']==0">开播提醒</view>
			      <view class="kaibo-btn" :data-index="index" v-else>已订阅</view>
			    </view>
			  </view>
			
			</view>
			<!-- #ifdef MP -->
			<authorize @onLoadFun="onLoadFun" :isAuto="isAuto" :isShowAuth="isShowAuth" @authColse="authColse"></authorize>
			<!-- #endif -->
			
			 <z_tabBar :pagePath="'/pages/live/index'"></z_tabBar>
		</view>
	</view>
</template>

<script>
	import {
	    livelist,
	    messagetips
	} from "../../api/live.js";
	import {
		getLiveList
	} from '@/api/api.js';
	import {
		mapGetters
	} from "vuex";
	
	// #ifdef MP
	import authorize from '@/components/Authorize';
	// #endif
	import z_tabBar from "@/pages/index/components/z_tabBar.vue";

	export default {
		components: {
			z_tabBar,
			// #ifdef MP
			authorize
			// #endif
		},
		data() {
			return {
				title:'超级购物台',
				isGoIndex: false,
				isShowAuth: false,
				isAuto: false,
				livelistdata: '',
				page:1,
				limit:10,
				isScroll:true,
			};
		},
		computed: mapGetters(['isLogin']),
		onShow: function() {
		    if (!this.isLogin) {
				console.log('111')
				this.isShowAuth = true;
			}
		},
		methods:{
			// 直播
			getlivelist() {
				if(!this.isScroll) return
				getLiveList(this.page, this.limit)
					.then(res => {
						this.isScroll = res.data.length>=this.limit
						this.page++
						this.livelistdata =this.livelistdata.concat(res.data);
					})
					.catch(res => {
						console.log(res.msg);
					});
			},
			liveaudience(e) {
			    console.log(e);
			    let detail = e.currentTarget.dataset['detail']
			    uni.navigateTo({
			        url: `/pages/live/liveaudience?detail=${encodeURIComponent(JSON.stringify(detail))}`
			    })
			},
			bannerurlhandle(e) {
			    let url = e.currentTarget.dataset['url']
			    uni.navigateTo({
			        url: `/${url}`
			    })
			},
			onReachBottom() {
				this.getlivelist()
			},
			// 订阅
			messagehandle(e) {
			    var self = this;
			    // console.log(e);return;
			    if (!this.data.livelistdata.template_id){
					uni.showToast({
						title: '未配置订阅模板，请联系管理员',
						icon: 'none',
						duration: 2000
					});
					return;
			    }
			    uni.requestSubscribeMessage({
			        tmplIds: [this.data.livelistdata.template_id],
			        success(res) {
			            let channelid = e.currentTarget.dataset['channelid'];
			
			            messagetips(channelid).then(result => {
			                // 获取当前点击下标    
			                let Index = e.currentTarget.dataset.index;
			                let list = self.data.livelistdata.subscribe_list;
			    
			                list[Index].is_subscribe = 1;
			                let livelistdata = self.data.livelistdata;
			                livelistdata.subscribe_list = list;
							self.livelistdata = livelistdata
			                // console.log(self.data.livelistdata);
							uni.showToast({
								title: result.msg,
								icon: 'none',
								duration: 2000
							});
			            }).catch(err=>{
			                uni.showToast({
			                	title: err,
			                	icon: 'none',
			                });
			            });
			        },
			        fail(res) {
						uni.showToast({
							title: res.errMsg,
							icon: 'none',
						});
			            return;
			        }
			    })
			    
			},
			// 授权回调
			onLoadFun() {
				this.getlivelist();
			},
			// 授权关闭
			authColse: function(e) {
				// this.isShowAuth = e;
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
	.swiperitemwrap{height: 240rpx;}
	.pic-swiper{width:100%;height:100%;}
	.swiper-box .wx-swiper-dot{width:14rpx;display: inline-flex;height: 14rpx;justify-content:space-between;}
	.swiper-box .wx-swiper-dot::before{ content: '';flex-grow: 1;border-radius: 14rpx;transition: all .3s ease-in-out;}
	.swiper-box .wx-swiper-dot-active::before{ background:#ffffff;  }
	.p-w24{
	  padding-left:24rpx;
	  padding-right:24rpx;
	}
	.listtitle{
	  padding-top:30rpx;
	  padding-bottom:30rpx;
	  font-size:30rpx;
	  color:#ffffff;
	  font-weight:500;
	}
	.onlivewrap{
	  display: flex;
	  height:248rpx;
	  background-color: #ffffff;
	  width:100%;
	  border-radius: 12rpx;
	}
	.onlivewrap .pic-goods{
	  width:248rpx;
	  height: 248rpx;
	  display:block;
	  border-radius: 12rpx;
	}
	.onlivewrap .conwrap{
	  flex: 1;
	  margin-left:20rpx;
	  white-space:nowrap; 
	  overflow: hidden;
	  text-overflow: ellipsis;
	  margin-right:20rpx;
	}
	.onlivewrap .conwrap .tit{
	  font-size: 30rpx;
	  color:#353535;
	  margin-top:20rpx;
	  font-weight:500;
	  white-space:nowrap; 
	  overflow: hidden;
	  text-overflow: ellipsis
	}
	.onlivewrap .conwrap .desc{
	  font-size: 24rpx;
	  color:#444444;
	  margin-top:10rpx;
	  white-space:nowrap; 
	  overflow: hidden;
	  text-overflow: ellipsis
	}
	.pic-wrap{
	  display: flex;
	  align-content: center;
	}
	.onlivewrap .conwrap .pic-small{
	  width:110rpx;
	  height:110rpx;
	  border-radius: 10rpx;
	  display: inline-block;
	  margin-right:20rpx;
	  margin-top:20rpx;
	}
	.pic-small-tips{
	  width:110rpx;
	  height:110rpx;
	  border-radius: 10rpx;
	  display: inline-block;
	  margin-top:20rpx;
	  background-color: #e4e7ff;
	  text-align: center;
	  color:#747bb1;
	  padding-top:30rpx;
	  font-size:20rpx;
	}
	
	.onlivewrap .tag{
	  position: absolute;
	  left:12rpx;
	  top:15rpx;
	  padding-left:10rpx;
	  padding-right:10rpx;
	  height: 26rpx;
	  line-height: 26rpx;
	  border-radius: 26rpx;
	  background-color:#ff0000;
	  color: #ffffff;
	  font-size: 14rpx;
	  text-align: center;
	  display: flex;
	  align-items:center;
	  justify-content: center;
	}
	.onlivewrap .tag .icon-onlive{
	  width:16rpx;
	  height:16rpx;
	  margin-right:5rpx;
	  display: inline-block;
	  align-self:center;
	}
	.m-b30{
	  margin-bottom: 30rpx;
	}
	
	.onlivewrap .otherwrap{
	  position: absolute;
	  left:12rpx;
	  right:12rpx;
	  bottom:20rpx;
	  display: flex;
	  align-items:center;
	}
	.onlivewrap .icon-people{
	  width:18rpx;
	  height:20rpx;
	}
	.onlivewrap .icon-zan{
	  width:22rpx;
	  height:19rpx;
	}
	.onlivewrap .dec{
	  font-size: 18rpx;
	  color:#ffffff;
	  margin-left:10rpx;
	}
	.kaibo-time{
	  color:#444444;
	  font-size: 24rpx;
	  margin-top:20rpx;
	}
	.kaibo-btn{
	  width:140rpx;
	  height:52rpx;
	  line-height: 52rpx;
	  text-align: center;
	  border-radius: 52rpx;
	  color:#ffffff;
	  font-size: 24rpx;
	  background-color: #747BB1;
	  margin-top:20rpx;
	}
</style>
