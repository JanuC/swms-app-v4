<template>
	<view class="ipis-mask">
		<view class="popup-warp">
			<view class="popup-body" :animation="animationData">
				<view class="warining-title">
					<text>{{title}}</text>
				</view>
				<view class="popup-content">
					<text>{{content}}</text>
				</view>
				<view class="popup-footer">
					<view class="button-wrapper affirm-button-wrapper" @click="onConfirm">
						<text class="popup-footer__button affirm-button">{{affirmButtonText}}</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				title: '警告',
				content: '系统检测到您已经离开了工作区域，请尽快返回工作区域',
				affirmButtonText: '我知道了',
				animationData: {},
				show: false,
			};
		},
		onLoad(option) {
			const vm = this;
			const eventChannel = this.getOpenerEventChannel()
			// 监听acceptDataFromOpenerPage事件，获取上一页面通过eventChannel传送到当前页面的数据
			eventChannel.on('acceptDataFromOpenerPage', function(data) {
				console.log(data)
				vm.title = data.title || vm.title;
				vm.content = data.content || vm.content;
				vm.show = data.show || vm.show;
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
			onConfirm() {
				const eventChannel = this.getOpenerEventChannel()
				eventChannel.emit('someEvent', {
					data: '2'
				});
				uni.navigateBack();
				uni.$off('someEvent');
			},
		}
	}
</script>

<style>
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

	.warining-title {
		text-align: center;
		font-size: 19px;
		padding: 18px;
		color: #ff3b30;
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
		color: #9E4A63;
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
