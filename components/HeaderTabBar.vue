<template>
	<view class="flex">
		<view @click="goBack" class="status_bar">
			<uni-icons custom-prefix="custom-icon" type="back" size="30"></uni-icons>
		</view>
		<view class="header-wrap">
			<view :class="['tab-item', active===item.id?'active':'']" v-for="item in tabs" :key="item.id"
				@tap="onToggle(item.id)">
				<text class="tab-item__text">{{item.name}}</text>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		name: "HeaderTabBar",
		data() {
			return {
				active: 0,
				tabs: [{
						id: 0,
						name: '区域'
					},
					{
						id: 1,
						name: '类型'
					}
				]
			}
		},
		methods: {
			onToggle(id) {
				this.active = id;
				this.$emit('onActive', id)
			},
			goBack() {
				uni.navigateBack({
					delta: 1
				})
			}
		}
	}
</script>

<style lang="scss">
	.flex {
		display: flex;
		align-items: center;
		padding-top: 100rpx;
		background: #FFFFFF;
	}

	.status_bar {
		height: 88rpx;
		line-height: 88rpx;
		width: 60rpx;
		background-color: #FFFFFF;
	}

	.header-wrap {
		flex: 1;
		height: 88rpx;
		background-color: #FFFFFF;
		position: relative;
		z-index: 9;
		display: flex;
		align-items: center;
		justify-content: space-around;

		.tab-item {
			height: 88rpx;
			line-height: 88rpx;
			box-sizing: border-box;

			.tab-item__text {
				font-size: 30rpx;
				color: #333333;
			}
		}

		.active {
			border-bottom: solid 4rpx #9f4b63;

			.tab-item__text {
				color: #9f4b63;
			}
		}
	}
</style>
