<template>
	<view class="content my-content">
		<view class="header">
			<image class="header-bg" src="/static/my_bg_swms.png" mode="scaleToFill"></image>
			<view class="header-user">
				<text class="user-name">{{getUsers.userName}}</text>
				<view class="department">
					<!-- <image class="department-img" src="/static/department_bg.png" mode="widthFix"></image> -->
					<text class="department-name">{{getUsers.deptName}}</text>
				</view>
			</view>
		</view>
		<view class="menu-wrap left-right-space__15">
			<!-- 		<navigator url="/pages/notice/list" class="menu-item menu-item__independent">
				<view class="my-notice">
					<image class="menu-item__img" src="/static/my_inform.png" mode="widthFix"></image>
					<text>我的通知</text>
					<view v-if="showDots" class="dots"></view>
				</view>
				<image class="menu-item-right__img" src="/static/my_right.png" mode="widthFix"></image>
			</navigator> -->
			<view class="menu-group">
				<navigator url="/pages/notice/list" class="menu-item menu-group__item">
					<view class="my-notice">
						<image class="menu-item__img" src="/static/my_inform_swms.png" mode="widthFix"></image>
						<text>我的通知</text>
						<view v-if="showDots" class="dots"></view>
					</view>
					<image class="menu-item-right__img" src="/static/my_right.png" mode="widthFix"></image>
				</navigator>
				<view class="menu-item menu-group__item menu-group__alert">
					<view class="my-notice">
						<image class="menu-item__img" src="/static/alert_swms.png" mode="widthFix"></image>
						<text>静默告警</text>
					</view>
					<switch :checked="alertChecked" color="#9E4A63" style="transform:scale(0.7)" @change="onSwitch" />
				</view>
				<navigator url="/pages/system/about" class="menu-item menu-group__item">
					<view>
						<image class="menu-item__img" src="/static/my_about_swms.png" mode="widthFix"></image>
						<text>版本更新</text>
					</view>
					<image class="menu-item-right__img" src="/static/my_right.png" mode="widthFix"></image>
				</navigator>
				<navigator url="/pages/system/cache" class="menu-item menu-group__item">
					<view>
						<image class="menu-item__img" src="/static/my_setting_swms.png" mode="widthFix"></image>
						<text>清除缓存</text>
					</view>
					<image class="menu-item-right__img" src="/static/my_right.png" mode="widthFix"></image>
				</navigator>
				<navigator url="/pages/synchronize/index" class="menu-item menu-group__item">
					<view>
						<image class="menu-item__img" src="/static/my_synchronous_swms.png" mode="widthFix"></image>
						<text>同步数据</text>
					</view>
					<image class="menu-item-right__img" src="/static/my_right.png" mode="widthFix"></image>
				</navigator>
			</view>
			<view class="menu-group">
				<navigator url="/pages/user/password" class="menu-item menu-group__item">
					<view>
						<image class="menu-item__img" src="/static/my_change.png" mode="widthFix"></image>
						<text>修改密码</text>
					</view>
					<image class="menu-item-right__img" src="/static/my_right.png" mode="widthFix"></image>
				</navigator>
				<view class="menu-item menu-group__item" @click="onLogout">
					<view>
						<image class="menu-item__img" src="/static/my_logout.png" mode="widthFix"></image>
						<text>退出登录</text>
					</view>
					<image class="menu-item-right__img" src="/static/my_right.png" mode="widthFix"></image>
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
	import androidPlugs from '@/utils/androidPlugs.js';
	export default {
		data() {
			return {
				showDots: false,
				alertChecked: false
			};
		},
		computed: {
			...mapGetters({
				getUsers: 'user/getUserInfo',
				getShowDots: 'user/getShowDots'
			})
		},
		watch: {
			getShowDots(val) {
				this.showDots = val;
			}
		},
		onShow() {
			this.alertChecked = uni.getStorageSync('warn_switch');
			this.showDots = uni.getStorageSync('showDots');
			uni.hideTabBarRedDot({
				index: 1,
				success() {
					// console.log('红点消失成功!')
				},
				fail() {
					console.log('红点消失失败!')
				}
			})
		},
		onUnload() {
			uni.$off();
		},
		methods: {
			...mapMutations({
				logout: 'user/REMOVE_TOKEN',
			}),
			onLogout() {
				uni.navigateTo({
					url: '/pages/popup/ipis-popup',
					success: function(res) {
						// 通过eventChannel向被打开页面传送数据
						res.eventChannel.emit('acceptDataFromOpenerPage', {
							content: '确定退出登录?',
							cancelButtonText: '取消',
							affirmButtonText: '确认'
						})
					}
				});
			},
			onModalButton() {
				uni.$on('handleClick', (res) => {
					console.log(res)
				})
			},
			onSwitch(e) {
				let val = e.target.value;
				androidPlugs.onSwitch(val);
				try {
					uni.setStorageSync('warn_switch', val);
				} catch (e) {
					// error
				}
			}
		}
	}
</script>

<style lang="scss">
	.my-content {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: #F5F5F5;

		.header {
			width: 100%;
			height: 160px;
			position: relative;
			margin-bottom: 12px;
		}

		.header-bg {
			width: 100%;
			height: 100%;
		}

		.header-user {
			width: 100%;
			text-align: center;
			position: absolute;
			bottom: 35px;
			color: #FFFFFF;
			display: flex;
			align-items: center;
			justify-content: center;
			flex-direction: column;

			.user-name {
				font-size: 21px;
				margin-bottom: 7px;
			}

			.department {
				position: relative;
				font-size: 12px;
				height: 21px;
				line-height: 21px;
				padding: 0 11px;
				background-color: rgba(255, 255, 255, 0.1);
				border-radius: 12px;
			}

			.department-img {
				width: 60px;
				height: 21px;
				position: absolute;
				top: 0;
				left: 0;
			}

			.department-name {
				position: relative;
				z-index: 9;
			}
		}

		.menu-wrap {
			position: relative;
			z-index: 99;

			.menu-item {
				height: 45px;
				font-size: 16px;
				color: #333333;
				display: flex;
				align-items: center;
				justify-content: space-between;

			}

			.menu-item__independent {
				background-color: #ffffff;
				box-shadow: 0px 1rpx 0px 0px rgba(0, 0, 0, 0.02);
				border-radius: 7px;
				padding: 0 16px 0 12px;
				margin-bottom: 10px;
			}

			.menu-item__img {
				width: 14px;
				height: 14px;
				margin-right: 10px;
			}

			.menu-item-right__img {
				width: 9px;
				height: 15px;
			}

			.menu-group {
				background-color: #ffffff;
				box-shadow: 0px 1rpx 0px 0px rgba(0, 0, 0, 0.02);
				border-radius: 7px;
				margin-bottom: 10px;
				padding-left: 12px;

				.menu-group__item {
					padding-right: 16px;
					margin-bottom: 0;
					border-bottom: 1rpx solid #ebebeb;

					&:last-child {
						border-bottom: 0
					}
				}

				.menu-group__alert {
					padding-right: 6px;
				}
			}
		}
	}

	.my-notice {
		position: relative;
	}

	.dots {
		position: absolute;
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background-color: #FF3B30;
		right: -10px;
		top: -5px;
	}
</style>
