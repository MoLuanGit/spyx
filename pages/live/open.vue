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
			<form bindsubmit="formSubmit" report-submit='true'>
			    <view class="evaluate-con">
			        <view class='textarea'>
			            <textarea placeholder='给你的直播写一个标题吧' name="title" value="" placeholder-class='placeholder'></textarea>
			            <view class='list acea-row row-middle'>
			                <view class='pictrue' v-if="cover" wx:key>
			                    <image :src="cover"></image>
			                    <text class='iconfont icon-guanbi1 font-F0F0F0' @click='DelPic'></text>
			                </view>
			                <view class='pictrue acea-row row-center-wrapper row-column' @click='uploadPic'>
			                    <text class='iconfont icon-icon25201'></text>
			                    <view>添加封面</view>
			                </view>
			            </view>
			        </view>
			        <view class="mygoodstitle">我的商品</view>
			        <view class="mygoodswrap">
			          <view v-for="(item,index) in goodslists['list']" :key="index" class="item">
			            <image class="pic" :src="item['image']"></image>
			            <view class="price">￥{{item['price']}}</view>
			          </view>
			        </view>
			        <button class='evaluateBnt' formType="submit">立即直播</button>
			    </view>
			</form>
			<authorize bind:onLoadFun="onLoadFun" ></authorize>
		</view>
	</view>
</template>

<script>
	// #ifdef MP
	import authorize from '@/components/Authorize';
	// #endif
	
	import {
	    openChannel,
	    mygoods
	} from '../../api/live.js';
	
	export default {
		components: {
			// #ifdef MP
			authorize,
			// #endif
		},
		data() {
			return {
				title:'我要开直播',
				title: '',
				cover: null,
				goodslists: ''
			};
		},
		onLoad: function(options) {
		    this.initmygoods()
		},
		methods:{
			initmygoods() {
			    mygoods().then(res => {
			        let {
			            status,
			            data
			        } = res;
			        if (status == 200) {
						this.cover = data['default_cover'];
						this.goodslists = data;
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
			    })
			},
			onLoadFun: function() {
			
			},
			/**
			 * 上传文件
			 */
			uploadPic: function() {
			    var that = this;
			    util.uploadImageOne('live/uploadimage', function(res) {
			        // console.log(res);
					that.cover = res.data.url;
			    });
			},
			/**
			 * 删除图片
			 */
			DelPic: function(e) {
				this.cover = null;
			},
			
			/**
			 * 提交表单
			 */
			formSubmit: function(e) {
			    var formId = e.detail.formId,
			        value = e.detail.value,
			        that = this;
			    if (!value.title) return uni.showToast({
					title: '给你的直播写一个标题吧！',
					icon: 'none',
					duration: 2000
				});
			    // console.log(value.title);
			    if (!this.data.cover) return uni.showToast({
					title: '请上传一张封面！',
					icon: 'none',
					duration: 2000
				});
			
			    uni.showLoading({
			        title: "正在开启直播……"
			    });
			    value.cover_url = this.data.cover;
			    openChannel(value).then(res => {
			        uni.hideLoading();
			        uni.redirectTo({
			            url: `/pages/live/liveopen?channel_id=${res.data.channel_id}`,
			        })
			    }).catch(err => {
			        uni.hideLoading();
			        return uni.showToast({
						title: err,
						icon: 'none',
					});
			    });
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
			font-weight: bold;
		}
	}
	.container{
		padding-top: 61px;
	}
	page{
	  background:#ffffff !important;
	}
	.evaluate-con{background-color:#fff;border-top:1rpx solid #f5f5f5;font-size:28rpx;color:#282828;padding:32rpx 30rpx 65rpx 30rpx;}
	
	.evaluate-con .textarea{width:690rpx;border-radius:10rpx}
	.evaluate-con .textarea textarea{font-size:28rpx;padding:30rpx;width:100%;box-sizing:border-box;height:160rpx;
	background-color:#f5f5f5;}
	.evaluate-con .textarea .placeholder{color:#bbb;}
	.evaluate-con .textarea .list{margin-top:35rpx;padding-left:5rpx;}
	.evaluate-con .textarea .list .pictrue{width:140rpx;height:140rpx;margin:0 35rpx 25rpx 0;position:relative;font-size:22rpx;color:#bbb;}
	.evaluate-con .textarea .list .pictrue:nth-last-child(1){border:1rpx solid #ddd;box-sizing:border-box;}
	.evaluate-con .textarea .list .pictrue image{width:100%;height:100%;border-radius:3rpx;}
	.evaluate-con .textarea .list .pictrue .icon-guanbi1{font-size:45rpx;position:absolute;top:-20rpx;right:-20rpx;}
	.evaluate-con .textarea .list .pictrue .icon-icon25201{color:#bfbfbf;font-size:50rpx;}
	.evaluate-con .evaluateBnt{
	 position: fixed;
	  left:50%;
	  transform: translateX(-50%);
	  bottom:40px;
	  box-shadow: 0 0 8px rgba(0,0,0,.3);
	font-size:44rpx;color:#fff;width:530rpx;height:100rpx;border-radius:100rpx;text-align:center;line-height:100rpx;margin-top:50rpx;background: #747bb1;}
	
	.mygoodstitle{
	  font-size:30rpx;
	  color:#323232;
	  font-weight: 500;
	}
	.mygoodswrap{
	  display: flex;
	  flex-wrap:wrap;
	  margin-top:30rpx;
	}
	.mygoodswrap .item{
	  width:150rpx;
	  height:150rpx;
	  margin-left:30rpx;
	  margin-bottom:30rpx;
	  position: relative;
	}
	.mygoodswrap .item:nth-child(4n+1){
	  margin-left:0;
	}
	.mygoodswrap .item .pic{
	  width:150rpx;
	  height:150rpx;
	}
	.mygoodswrap .item .price{
	  position: absolute;
	  left:0;
	  right: 0;
	  bottom:0;
	  height: 30rpx;
	  line-height:30rpx;
	  background-color: rgba(181, 183, 206, 0.5);
	  font-size: 18rpx;
	  color:#ffffff;
	  padding-left:15rpx;
	  padding-right:15rpx;
	}
	.font-F0F0F0{
	  color:#F0F0F0;
	}
</style>
