<template>
	<view class="footer-wrap" @tap="openQuitDialog">
		<image class="logout-image" src="@/static/logout.png" mode="widthFix"></image>
		<text class="quit-text">退出</text>
		<DialogTips ref="quitpopup" content="是否退出登录？" @onConfirm="handleQuit" />
	</view>
</template>

<script>
	import {
		mapGetters,
		mapMutations
	} from 'vuex';
	import DialogTips from './DialogTips.vue';
	export default {
		name: "Footer",
		components: {
			DialogTips
		},
		data() {
			return {};
		},
		methods: {
			...mapMutations({
				removeToken(commit) {
					commit('user/REMOVE_TOKEN')
				},
			}),
			openQuitDialog() {
				this.$refs.quitpopup.dialogOpen();
			},
			handleQuit() {
				console.log(11)
				this.removeToken();
				this.$refs.quitpopup.dialogClose();
				uni.reLaunch({
					url: '/pages/login/login'
				});
			},
			dialogClose() {
				this.$refs.quitpopup.dialogClose();
			}
		}
	}
</script>

<style lang="scss">
	.footer-wrap {
		width: 100%;
		height: 152rpx;
		background-color: #FFFFFF;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		position: fixed;
		bottom: 0;
		z-index: 9;
		border-top: 1px solid rgba($color: #e5e5e5, $alpha: 0.5);

		.logout-image {
			width: 30rpx;
			height: 32rpx;
		}

		.quit-text {
			font-size: 24rpx;
			color: #999999;
		}
	}
</style>
