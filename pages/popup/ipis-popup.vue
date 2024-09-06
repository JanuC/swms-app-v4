<template>
	<view class="ipis-mask">
		<view class="popup-warp">
			<view class="popup-body" :animation="animationData">
				<view class="popup-title">
					<text>{{title}}</text>
				</view>
				<view class="popup-content">
					<text>{{content}}</text>
				</view>
				<view class="popup-footer">
					<view class="button-wrapper cancel-button-wrapper" @click="onClose">
						<text class="popup-footer__button cancel-button">{{cancelButtonText}}</text>
					</view>
					<view class="button-wrapper affirm-button-wrapper" @click="onConfirm">
						<text class="popup-footer__button affirm-button">{{affirmButtonText}}</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		mapGetters,
		mapMutations
	} from 'vuex';
	import plugin from '@/utils/androidPlugs.js';
	import appInit from "@/utils/init.js";
	export default {
		name: "ipis-popup",
		data() {
			return {
				title: '温馨提示',
				content: '确定退出登录?',
				cancelButtonText: '取消',
				affirmButtonText: '确认',
				animationData: {}
			};
		},
		onLoad() {
			const vm = this;
			const eventChannel = this.getOpenerEventChannel()
			// 监听acceptDataFromOpenerPage事件，获取上一页面通过eventChannel传送到当前页面的数据
			eventChannel.on('acceptDataFromOpenerPage', function(data) {
				vm.title = data.title || vm.title;
				vm.content = data.content || data.content;
			})
		},
		onUnload() {
			uni.$off('acceptDataFromOpenerPage');
		},
		onShow() {
			// zoom-fade-out
			let animation = uni.createAnimation({
				transformOrigin: "50% 50%",
				duration: 200,
				timingFunction: "ease",
				delay: 0
			});
			this.animation = animation
			animation.scale(0.5, 0.5).opacity(0).step();
			this.animationData = animation.export();
			setTimeout(function() {
				animation.scale(1, 1).opacity(1).step()
				this.animationData = animation.export();
			}.bind(this), 250)
		},
		methods: {
			...mapMutations({
				logout: 'user/REMOVE_TOKEN',
			}),
			onConfirm() {
				this.logout();
				appInit.handleClearInterval();
				uni.reLaunch({
					url: '/pages/user/login'
				});
			},
			onClose() {
				uni.navigateBack()
			},
		}
	}
</script>

<style lang="scss">
	page {
		background: transparent;
	}

	.ipis-mask {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 9999;
		background-color: rgba(0, 0, 0, 0.4);
	}

	.popup-warp {
		position: absolute;
		left: 25px;
		right: 25px;
		top: 50%;
		transform: translate(0, -50%);
	}

	.popup-body {
		width: 100%;
		/* margin: 0 25px; */
		border-radius: 16rpx;
		background-color: #FFFFFF;
	}

	.popup-title {
		text-align: center;
		font-size: 19px;
		padding: 18px;
		color: #333333;
		border-bottom: 1rpx solid #e5e5e5;
	}

	.popup-content {
		text-align: center;
		line-height: 24px;
		font-size: 17px;
		padding: 20px;
		color: #333333;
	}

	.popup-footer {
		height: 59px;
		line-height: 59px;
		border-top: 1rpx solid #e5e5e5;
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
	}

	.popup-footer__button {
		font-size: 18px;
	}

	.affirm-button {
		color: $uni-color-primary;
	}

	.cancel-button {
		color: #666666;
	}

	.button-wrapper {
		flex: 1;
		height: 59px;
		align-items: center;
		justify-content: center;
		text-align: center;
	}

	.cancel-button-wrapper {
		border-right: 1rpx solid #e5e5e5;
	}
</style>
