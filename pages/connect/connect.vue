<template>
	<view class="project-content">
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
					<button hover-class="none" type="default" @click="onCommunicationTest(2)">确定</button>
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
				ip: '',
				port: '',
			};
		},
		async onLoad() {

			uni.getStorage({
				key: 'host',
				success: (res) => {
					console.log(res, 'host')
					this.ip = res.data;
				}
			})
			uni.getStorage({
				key: 'port',
				success: (res) => {
					console.log(res, 'port')
					this.port = res.data;
				}
			})

			// this.ip = this.lastIp ? this.lastIp : '';
			// this.port = this.lastPort ? this.lastPort : '';
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
					uni.showLoading({
						title: '努力连接中...'
					});
					let api_url = `http://${this.ip}:${this.port}`;
					uni.request({
						url: api_url,
						success: (res) => {
							uni.hideLoading();
							if (type === 2) {
								uni.$emit('onShowUserPopup', {
									taskSubmitTips: 'success',
									successTipsTitle: '连接成功',
									content: '',
									second: 10,
									affirmType: 2
								});


								uni.setStorage({
									key: 'host',
									data: this.ip
								})
								uni.setStorage({
									key: 'port',
									data: this.port
								})

								this.setApiUrl(api_url);
								this.setApiIp(this.ip);
								this.setApiPort(this.port);

								uni.$on('onUserPopupConfirm', () => {
									console.log(api_url)
									uni.reLaunch({
										url: '/pages/login/login'
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
					this.$utils.toast('请输入IP端口号')
					return false
				}
			},
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
		margin-top: 344rpx;
	}

	.logo-form {
		border-top: 1rpx solid #F5F5F5;

		.input-wrapper {
			display: flex;
			align-items: center;
			margin-left: 24rpx;
			border-bottom: 1rpx solid #F5F5F5;

			.input-title {
				width: 136rpx;
				font-size: 34rpx;
				color: #333333;
			}

			.input {
				height: 94rpx;
				margin-left: 61rpx;
			}
		}

		.button-wrapper {
			margin-top: 163rpx;
			padding: 0 24rpx;

			button {
				height: 98rpx;
			}
		}
	}

	.input-placeholder {
		font-size: 34rpx;
		color: #cccccc;
	}
</style>
