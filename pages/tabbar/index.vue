<template>
	<view class="content index-content">
		<view class="header">
			<image class="header-bg" src="/static/index_bg_swms.png" mode="widthFix"></image>
		</view>
		<view class="body left-right-space__15" v-if="menuList">
			<view class="menu-card" v-if="menuList[0].name">
				<view class="title">
					<image class="title-image" src="/static/index_title.png" mode="heightFix"></image>
					<text>{{menuList[0].name}}</text>
				</view>
				<view class="index-card navigator">
					<navigator hover-class="none" class="navigator-item" v-for="menu in menuList[0].children"
						:url="menu.url" :key="menu.id">
						<image class="navigator-icon" :src="menu.icon" mode="heightFix"></image>
						<text>{{menu.name}}</text>
					</navigator>
				</view>
			</view>
			<view class="menu-card" v-if="menuList[1].name">
				<view class="title safety-report__title">
					<image class="title-image" src="/static/index_nav4.png" mode="heightFix"></image>
					<text>{{menuList[1].name}}</text>
				</view>
				<view class="index-card safety-report" v-for="menu in menuList[1].children" :key="menu.id">
					<image class="safety-report__icon" :src="menu.icon" mode="heightFix"></image>
					<navigator :url="menu.url" class="safety-report__button"><text>{{menu.name}}</text></navigator>
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
	import androidPlugs from '@/utils/androidPlugs.js'
	export default {
		data() {
			return {}
		},
		computed: {
			...mapGetters({
				menuList: 'user/getMenuData',
				isTokenValid: 'user/isTokenValid'
			})
		},
		onShow() {
			if (this.isTokenValid) {
				this.getGeofence();
			}
		},
		methods: {
			...mapMutations({
				setpoints: 'app/SET_POINTS'
			}),
			showDots() {
				uni.showTabBarRedDot({
					index: 1,
					success() {
						console.log('红点成功!')
					},
					fail() {
						console.log('红点失败!')
					}
				})
			},
			async getGeofence() {
				this.$request(`/v1/electronic-fenceelectronicFence`).then(res => {
					// if (res.code == 200) {
						if (res.data.pointsInfo) {
							this.setpoints(res.data.pointsInfo);
						} else {
							this.setpoints("[]");
						}
					// }
				}).catch(error => {
					// let msg = '当前无网络或网络状态差!';
					this.setpoints("[]");
					// if(error.err) {
					// 	msg = error.err.info;
					// } else {
					// 	msg = error.errMsg;
					// }
					// this.$utils.toast(msg);
					// if (error.code != 500) {
					// 	this.$utils.toast('当前无网络或网络状态差!')
					// }
				})
			}
		}
	}
</script>

<style lang="scss">
	.index-content {
		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		background-color: #F5F5F5;

		.header-bg {
			width: 100%;
			height: 164px;
		}
	}

	.body {
		position: absolute;
		top: 60px;
		left: 0;
		right: 0;
		z-index: 2;

		.title {
			display: flex;
			align-items: center;
			font-size: 18px;
			color: #FFFFFF;
			margin-bottom: 22px;

			.title-image {
				height: 20px;
				margin-right: 10px;
			}
		}

		.safety-report__title {
			color: #333333;
		}

		.menu-card {
			margin-bottom: 25px;
		}

		.index-card {
			background-color: #FFFFFF;
			box-shadow: 0px 1px 20px 0px rgba(0, 0, 0, 0.02);
			border-radius: 14px;
			box-sizing: border-box;
		}

		.navigator {
			width: 100%;
			padding: 22px 10px 0 10px;
			display: flex;
			flex-wrap: wrap;
			align-items: center;
			justify-content: space-between;

			.navigator-item {
				display: flex;
				align-items: center;
				flex-direction: column;
				font-size: 15px;
				color: #707070;
				width: calc(100% / 3);
				margin-bottom: 20px;
			}

			.navigator-icon {
				width: 40px;
				height: 40px;
				margin-bottom: 10px;
			}
		}

		.safety-report {
			height: 100px;
			display: flex;
			align-items: center;
			justify-content: space-between;

			.safety-report__icon {
				height: 100px;
			}

			.safety-report__button {
				width: 90px;
				height: 30px;
				line-height: 30px;
				text-align: center;
				background-color: $uni-color-primary;
				border-radius: 15px;
				font-size: 14px;
				color: #FFFFFF;
				margin-right: 18px;
			}
		}
	}
</style>
