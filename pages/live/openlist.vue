<template>
	<view class="">
		<view class="navbar">
			<view class="nav">
			</view>
			<view class="title">
				{{title}}
			</view>
		</view>
		<view class="p-w24 m-t30">
		  <view 
		    v-for="(item,index) in datalists" 
		    :key="index" 
		    @click="liveopenhandle"
		    :data-channelid="item['channel_id']"
		    class="onlivewrap m-b30">
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
		      <view class="kaibo-time">{{item.open_time}}开播</view>
		      <view class="kaibo-btn">直播</view>
		    </view>
		  </view>
		</view>
		<view @click="startopenlive" class="startopenlive">新建直播</view>
	</view>
</template>

<script>
	import {
	    mysubscribe, openChannel
	} from "../../api/live.js";
	export default {
		components: {
			
		},
		data() {
			return {
				title:'我的预约直播',
				datalists: [],
			};
		},
		onLoad(options){
			this.initmysubscribe();
		},
		methods:{
			initmysubscribe() {
			    mysubscribe().then(res => {
			        console.log(res);
			        let {
			            data,
			            status,
			            msg
			        } = res
			        if (status == 200) {
			            if (data.length == 0){
			                uni.navigateTo({
			                    url: `/pages/live/open`
			                });
			                return
			            }else{
							this.datalists = data;
			            }
			        } else {
			            uni.showToast({
			                title: msg,
			                icon: 'none',
			                duration: 2000
			            })
			        }
			    }).catch(err => {
					uni.showToast({
						title: err,
						icon: 'none',
						duration: 2000
					});
					setTimeout(()=>{
						uni.navigateTo({
							url:'/pages/user/index'
						})
					},2000)
			    });
			},
			liveopenhandle(e) {
			    let channelid = e.currentTarget.dataset['channelid'];
			    openChannel({ subscribe: channelid}).then(res=>{
			        uni.navigateTo({
			            url: `/pages/live/liveopen?channel_id=${channelid}`
			        });
			    }).catch(err=>{
			        return uni.showToast({
						title: err,
						icon: 'none',
					})
			    });
			    
			},
			startopenlive() {
				console.log('11')
			    uni.navigateTo({
			        url: '/pages/live/open',
			    })
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
	page{
	  background-color: #DF828C !important;
	  min-height: 100vh;
	}
	.p-w24{
	  padding-left:24rpx;
	  padding-right:24rpx;
	  padding-top:61px;
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
	.m-t30{
	  margin-top:30rpx;
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
	
	.startopenlive{
	  position: fixed;
	  left:50%;
	  transform: translateX(-50%);
	  bottom:40px;
	  width:530rpx;
	  height: 100rpx;
	  text-align: center;
	  line-height: 100rpx;
	  background: #ffffff;
	  color:#747BB1;
	  font-size: 44rpx;
	  border-radius:100rpx;
	  box-shadow: 0 0 8px rgba(0,0,0,.3);
	}
</style>
