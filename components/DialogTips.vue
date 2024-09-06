<template>
	<view class="dialog-container">
		<uni-popup ref="dialogTips" type="dialog" :mask-click="false">
			<view class="dialog-body">
				<view class="dialog-title">
					<text>{{title}}</text>
				</view>
				<view class="dialog-content">
					<text>{{content}}</text>
				</view>
				<view class="dialog-footer">
					<view class="dialog-button dialog-button__cancel" @tap="dialogClose">
						<text>{{cancelText}}</text>
					</view>
					<view class="dialog-button dialog-button__confirm" @tap="dialogConfirm">
						<text>{{confirmText}}</text>
					</view>
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script>
	export default {
		name: "DialogTips",
		props: {
			title: {
				type: String,
				default: '温馨提示'
			},
			content: {
				type: String,
				default: 'content'
			},
			cancelText: {
				type: String,
				default: '取消'
			},
			confirmText: {
				type: String,
				default: '确定'
			}
		},
		data() {
			return {

			};
		},
		methods: {
			dialogOpen() {
				this.$refs.dialogTips.open();
			},
			dialogClose() {
				this.$refs.dialogTips.close();
			},
			dialogConfirm() {
				this.$emit('onConfirm')
			}
		}
	}
</script>

<style lang="scss">
	.dialog-container {
		.dialog-body {
			width: 560rpx;
			height: 308rpx;
			background-color: #ffffff;
			border-radius: 16rpx;
			position: relative;
			overflow: hidden;

			.dialog-title {
				font-size: 36rpx;
				color: #333333;
				text-align: center;
				padding: 40rpx 0 25rpx 0;
			}

			.dialog-content {
				text-align: center;
				font-size: 30rpx;
				color: #333333;
			}

			.dialog-footer {
				width: 100%;
				position: absolute;
				bottom: 0;
				border-top: 1rpx solid #e5e5e5;
				box-sizing: border-box;
				display: flex;
				justify-content: space-between;

				.dialog-button {
					width: 50%;
					height: 99rpx;
					line-height: 99rpx;
					text-align: center;
				}

				.dialog-button__cancel {
					border-right: 1rpx solid #e5e5e5;
					font-size: 36rpx;
					color: #999999;
				}

				.dialog-button__confirm {
					font-size: 36rpx;
					color: #9f4b63;
				}
			}
		}
	}
</style>
