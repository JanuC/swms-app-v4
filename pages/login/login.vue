<template>
	<view class="login-content">
		<view class="logo-content">
			<image class="logo" src="/static/logo.png" mode="scaleToFill" @click="onNavigator"></image>
		</view>
		<view class="logo-title">
			<view class="primary-title">
				<text>文博安全感知预警平台</text>
			</view>
			<view class="explain">
				<text>图片上传工<text class="letter-spacing__0">具</text></text>
			</view>
		</view>
		<view class="logo-form">
			<view class="input-wrapper">
				<text class="input-title">账号</text><input class="input" placeholder="请输入账号" maxlength="16"
					v-model="formData.account" placeholder-class="input-placeholder" />
			</view>
			<view class="input-wrapper">
				<text class="input-title">密码</text><input class="input" placeholder="请输入密码" password maxlength="12"
					v-model="formData.originalPassword" placeholder-class="input-placeholder" />
			</view>
			<view class="checkbox-wrapper">
				<checkbox-group @change="getCheckboxValue">
					<label>
						<checkbox value="checked" :checked="isRemember" style="transform:scale(0.7)" />记住密码
					</label>
				</checkbox-group>
			</view>
			<view class="button-wrapper">
				<button hover-class="none" type="default" @tap="onSubmit">登录</button>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		mapGetters,
		mapMutations
	} from 'vuex'
	import md5 from 'js-md5'

	// import mqtt from '@/utils/mqtt'
	// import socket from '@/utils/socket'

	export default {
		data() {
			return {
				count: 0,
				isRemember: true,
				formData: {
					account: '',
					password: '',
					originalPassword: ''
				},
				mqttClient: null,
				host: ''
			}
		},
		onLoad(option) {
			uni.getStorage({
				key: 'host',
				success: (res) => {
					this.host = res.data;
				}
			})

			this.getUser();
		},
		watch: {},
		computed: {
			...mapGetters({
				apiIp: 'app/apiIp',
			})
		},
		methods: {
			...mapMutations({
				setToken(commit, tokenInfo) {
					commit('user/SET_TOKEN', tokenInfo)
				},
				setLevelData(commit, data) {
					commit('alarm/SET_LEVELDATA', data)
				},
				setCategoryData(commit, data) {
					commit('alarm/SET_CATEGORYDATE', data)
				},
				setFileUrl(commit, data) {
					commit('system/SET_FILEURL', data)
				},

			}),

			// 处理登录
			handleLogin(formData) {
				uni.showLoading({
					mask: true,
					title: '登录中请稍后...'
				})
				this.$request('/v3/urs/login', formData, 'POST').then(async res => {
					let {
						data
					} = res.data

					this.setToken({
						token: data.token,
						tokenExpired: Date.now() + 1000 * 60 * 60 * 24 * 60
					});
					await this.getConfigUrl();
					await this.handleRemember(formData);
					// 获取告警配置数据
					await this.getAlarmConfig();

					uni.hideLoading();
				}).catch(error => {
					console.log(error)
					uni.hideLoading();
					try {
						this.$utils.toast(error.data.err.info);
					} catch {
						this.$utils.toast('无法登录，请检查网络!');
					}
				})
			},
			// 普通登录提交登录
			onSubmit() {
				this.formData.pwd = md5(this.formData.originalPassword);
				this.formData.type = 5; //1-前台 2-后台 3-交班: 5 app（对应后台来说交班目前=前台）
				this.formData.forced = 1 //1-强制登录 0-不强制 
				if (this.formData.account && this.formData.pwd) {
					this.handleLogin(this.formData);
				} else {
					this.$utils.toast('请输入账号密码!')
				}
			},
			// 记住密码
			handleRemember(formData) {
				return new Promise(async (resolve, reject) => {
					if (this.isRemember) {
						uni.setStorageSync('lastuser', JSON.stringify(formData));
					}
					resolve(true)
				});
			},
			// 获取账号密码
			getUser() {
				let user = uni.getStorageSync('lastuser');
				if (user) {
					this.formData = JSON.parse(user)
				}
			},
			// 跳转工程模式
			onNavigator() {
				this.count += 1;
				if (this.count === 6) {
					uni.navigateTo({
						url: "/pages/connect/connect"
					})
				}
				let timeout = setTimeout(() => {
					clearTimeout(timeout)
					this.count = 0;
				}, 2000)
			},
			getCheckboxValue(e) {
				let values = e.detail.value;
				if (values.includes('checked')) {
					this.isRemember = true
				} else {
					this.isRemember = false
				}
			},
			/**
			 * 获取图片预览地址
			 */
			getConfigUrl() {
				return new Promise((resolve, reject) => {
					let dstHost = this.host
					this.$request('/v3/ags/sys-conf', {
						host: dstHost
					}).then(res => {
						let {
							code,
							data
						} = res.data
						let file_stream = data.file_stream;
						this.setFileUrl(file_stream);
						uni.setStorageSync('file_url', file_stream);
						uni.redirectTo({
							url: '/pages/home/home'
						})
						resolve(true)
					}).catch(error => {
						this.$utils.toast('获取配置文件失败');
						reject(error)
					})
				})
			},

			/**
			 * 获取告警配置数据
			 */
			getAlarmConfig() {
				return new Promise((resolve) => {
					// 1-告警分类 2-告警等级
					this.$request('/v3/acs/sys/enums/1').then(res => {
						let {
							data
						} = res.data;
						this.setCategoryData(data)
					})
					this.$request('/v3/acs/sys/enums/2').then(res => {
						let {
							data
						} = res.data;
						this.setLevelData(data)
						resolve()
					})

				})

			}
		}
	}
</script>

<style lang="scss">
	.login-content {
		height: 100%;
		overflow: hidden;
		background-color: #FFFFFF;
	}

	.logo-content {
		text-align: center;
		margin-top: 186rpx;
		margin-bottom: 30rpx;

		.logo {
			width: 200rpx;
			height: 200rpx;
		}
	}

	.logo-title {
		text-align: center;
		margin-bottom: 232rpx;

		.primary-title {
			font-size: 40rpx;
			color: #060606;
			margin-bottom: 20rpx;
		}

		.explain {
			font-size: 28rpx;
			letter-spacing: 20rpx;
			color: #9e9e9e;
		}
	}

	.logo-form {
		border-top: 1rpx solid #F5F5F5;

		.input-wrapper {
			display: flex;
			align-items: center;
			margin-left: 24rpx;
			border-bottom: 1rpx solid #F5F5F5;
			position: relative;

			.input-title {
				font-size: 34rpx;
				color: #333333;
			}

			.input {
				height: 94rpx;
				margin-left: 129rpx;
			}
		}

		.checkbox-wrapper {
			padding: 30rpx 30rpx 0 20rpx;
			font-size: 28rpx;
			color: #b2b2b2;
			margin-bottom: 99rpx;
		}
	}

	.input-placeholder {
		font-size: 34rpx;
		color: #cccccc;
	}
</style>
