<template>
	<view class="content project-content">
		<view class="project-schema">
			<view class="logo-form">
				<view class="input-wrapper">
					<text class="input-title">IP地址</text><input class="input" placeholder="请输入" maxlength="16"
						placeholder-class="input-placeholder" :adjust-position="false" v-model="ip" />
				</view>
				<view class="input-wrapper">
					<text class="input-title">服务端口</text><input class="input" placeholder="请输入" maxlength="12"
						placeholder-class="input-placeholder" :adjust-position="false" v-model="port" />
				</view>
				<view class="button-wrapper">
					<button :disabled="isSubmit" type="primary" @click="onCommunicationTest(2)">确定</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		mapMutations,
		mapGetters
	} from 'vuex';
	export default {
		data() {
			return {
				isSubmit: false,
				ip: '',
				port: '',
				deviceId: ''
			};
		},
		async onLoad() {
			uni.getSystemInfo({
				success: (res) => {
					this.deviceId = res.deviceId;
				}
			});
			this.ip = this.lastIp ? this.lastIp : '';
			this.port = this.lastPort ? this.lastPort : '';
		},
		computed: {
			...mapGetters({
				lastIp: 'app/apiIp',
				lastPort: 'app/apiPort'
			})
		},
		methods: {
			...mapMutations({
				setApiUrl(commit, url) {
					commit('app/SET_API_URL', url)
				},
				setApiIp(commit, ip) {
					commit('app/SET_API_IP', ip)
				},
				setApiPort(commit, port) {
					commit('app/SET_API_PORT', port)
				}
			}),
			// 通讯测试
			onCommunicationTest(type) {
				if (this.checkInput()) {
					uni.$emit('loading-popup', {
						title: '努力连接中...'
					});
					const subNVue = uni.getSubNVueById('loading-popup')
					subNVue.show('zoom-fade-out', 250)
					let api_url = `http://${this.ip}:${this.port}`;
					uni.request({
						url: api_url,
						success: (res) => {
							subNVue.hide()
							uni.hideLoading();
							this.isSubmit = false;
							if (type === 2) {
								uni.$emit('onShowUserPopup', {
									taskSubmitTips: 'success',
									successTipsTitle: '连接成功',
									content: '',
									second: 10,
									affirmType: 2
								});
								uni.$on('onUserPopupConfirm', () => {
									this.setApiUrl(api_url);
									this.setApiIp(this.ip);
									this.setApiPort(this.port);
									uni.reLaunch({
										url: '/pages/user/login'
									});
								})
							}
						},
						fail: (error) => {
							subNVue.hide()
							uni.hideLoading();
							uni.$emit('onShowUserPopup', {
								content: '无法连接,请检查网络IP地址或端口。',
							});
						}
					});
				}
			},
			// 验证输入框
			checkInput() {
				if (this.ip !== '' && this.port !== '') {
					return true
				} else {
					uni.showToast({
						icon: 'none',
						title: '请输入IP端口号',
					})
					return false
				}
			}
		}
	}
</script>

<style lang="scss">
	.project-content {
		overflow: hidden;
		background-color: #FFFFFF;
		height: 100%;
	}

	.project-schema {
		margin-top: 85px;
	}

	.logo-form {
		border-top: 1rpx solid #F5F5F5;

		.input-wrapper {
			display: flex;
			align-items: center;
			margin-left: 12px;
			border-bottom: 1rpx solid #F5F5F5;

			.input-title {
				width: 70px;
				font-size: 17px;
				color: #333333;
			}

			.input {
				height: 94rpx;
				margin-left: 31px;
			}
		}

		.test-button {
			padding: 12px 12px 0 12px;
			font-size: 14px;
			color: #306dfe;
			margin-bottom: 44px;
		}

		.button-wrapper {
			margin-top: 40px;
			padding: 0 12px;

			button {
				height: 49px;
			}
		}
	}

	.uni-popup {
		z-index: 1000 !important;
	}

	.popup-tips {
		border-radius: 16rpx;
		background-color: #FFFFFF;
		color: #333333;

		.title {
			text-align: center;
			font-size: 36rpx;
			padding-top: 30rpx;
		}

		.content {
			text-align: center;
			font-size: 30rpx;
			padding: 50rpx;
		}
	}
</style>
