<template>
	<view class="device-image">
		<view v-if="!imageErrorTips" class="photo-wrap" @tap.stop="onPhotoPreview">
			<image class="photo-style" :src="url" :lazy-load="true" @error="imageError" mode="aspectFill">
			</image>
		</view>
		<view v-else class="photo-wrap image-error-tips">
			<text>{{imageErrorTips}}</text>
		</view>
		<image @tap.stop="openDeleteDialog" class="delete-image" src="@/static/delete.png" mode=""></image>
	</view>
</template>

<script>
	export default {
		name: "DeviceImage",
		props: {
			picture: {
				type: Array,
				default: () => []
			},
			index: {
				type: Number,
				default: -1
			},
			devId: {
				type: [Number, String],
				default: -1
			},
			url: {
				type: String,
				default: ''
			}
		},
		data() {
			return {
				imageErrorTips: ''
			};
		},
		onLoad() {
			console.log('----', this.url)
			console.log('----', this.picture)
		},
		onShow() {
			console.log('----', this.url)
			console.log('----', this.picture)
		},
		methods: {
			onPhotoPreview() {
				this.$emit('onPreview', this.picture, this.index)
			},
			openDeleteDialog() {
				this.$emit('onDialog', this.devId, this.picture, this.index)
			},
			imageError(e) {
				console.log('----', this.url)
				console.log('----', this.picture)
				console.error('image发生error事件，携带值为' + e.detail.errMsg)
				this.imageErrorTips = '加载失败';
			}
		}
	}
</script>

<style lang="scss">
	.device-image {
		position: relative;
		width: 200rpx;
		height: 160rpx;
		margin-right: 27rpx;

		.photo-wrap {
			width: 200rpx;
			height: 160rpx;

			.photo-style {
				width: 200rpx;
				height: 160rpx;
				border-radius: 8rpx;
				box-sizing: border-box;
			}

			.delete-image {
				width: 34rpx;
				height: 34rpx;
				position: absolute;
				top: 10rpx;
				right: 10rpx;
			}
		}

		.image-error-tips {
			font-size: 24rpx;
			color: #666666;
			width: 200rpx;
			height: 160rpx;
			line-height: 160rpx;
			border-radius: 8rpx;
			background-color: #f2f2f2;
			text-align: center;
			// display: flex;
			// align-items: center;
			// justify-content: center;
		}
	}
</style>
