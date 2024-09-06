<template>
	<view class="content login-content" :style="{height: windowHeight+'px'}">
		<view class="logo-content">
			<image class="logo" src="/static/logo_icon_swms.png" mode="widthFix" @click="onNavigator"></image>
		</view>
		<view class="logo-title">
			<view class="primary-title">
				<text>文物巡检巡查系统</text>
			</view>
			<view class="explain">
				<text>让管理简单明<text class="letter-spacing__0">了</text></text>
			</view>
		</view>
		<view class="logo-form">
			<view class="input-wrapper">
				<text class="input-title">账号</text><input class="input" placeholder="请输入账号" maxlength="16"
					v-model="formData.account" placeholder-class="input-placeholder" @focus="onInput" />
				<view class="drop-down__button" :style="{transform: isSpread ? 'rotate(-90deg)' : 'rotate(90deg)'}"
					@click="onDropDownBox">
					<image class="down-arrow" src="@/static/my_right.png" mode="scaleToFill"></image>
				</view>
				<view class="drop-down__box" :style="{'max-height': isSpread ? '200rpx' : '0'}">
					<view v-for="item in userData" class="user-account" @click="onSelectUser(item)">
						<text>{{item.account}}</text>
						<view class="delete-button" @click="onDeleteUser(item.id)">
							<image class="delete-icon" src="@/static/close_1.png" mode="scaleToFill"></image>
						</view>
					</view>
					<view class="no-user" v-if="noUser">
						<text>暂无其他用户</text>
					</view>
				</view>
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
				<button :loading="submit_loading" :disabled="submit_loading" type="primary" @tap="onSubmit">登录</button>
			</view>
		</view>
		<uni-popup ref="popup" type="center" :maskClick="false">
			<view class="card-login__dialog">
				<view class="card-login">
					<view class="close" @tap="onClose">
						<image class="close-img" src="/static/close_1.png" mode="scaleToFill"></image>
					</view>
					<view class="title">刷卡登录</view>
					<view class="card-login__form">
						<view class="form-item">
							<text class="form-item__label">姓名</text>
							<text class="form-item__content">{{nfcForm.userName}}</text>
						</view>
						<view class="form-item">
							<text class="form-item__label">部门</text>
							<text class="form-item__content">{{nfcForm.deptName}}</text>
						</view>
						<view class="form-item form-item__cell">
							<text class="form-item__label">密码</text>
							<input class="form-item__input" placeholder="请输入密码" password maxlength="12"
								v-model="nfcForm.originalPassword" placeholder-class="input-placeholder"
								:adjust-position="false" />
						</view>
						<view class="form-item form-item__cell form-item__checkbox">
							<checkbox-group @change="getCheckboxValue">
								<label>
									<checkbox value="checked" :checked="isRemember" style="transform:scale(0.7)" />
									记住密码
								</label>
							</checkbox-group>
							<text @tap="onClose">账号密码登录</text>
						</view>
						<view class="card-login__button">
							<button :loading="submit_loading" :disabled="submit_loading" type="primary"
								@tap="onNfcSubmit">登录</button>
						</view>
					</view>
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script>
	// import NFC from '@/utils/nfc.js';
	import {
		mapGetters,
		mapMutations
	} from 'vuex'
	import md5 from 'js-md5'
	import appInit from "@/utils/init.js";
	import {
		generate_UUID
	} from "@/common/js/uuid.js";
	export default {
		data() {
			return {
				submit_loading: false,
				count: 0,
				NfcAdapter: null,
				dataList: null,
				isRemember: true,
				formData: {
					account: '',
					password: '',
					originalPassword: ''
				},
				nfcForm: {},
				isSpread: false,
				userData: [],
				noUser: false,
				loginUser: {},
				windowHeight: 0
			}
		},
		onLoad(option) {
			appInit.handleClearInterval();
			// if (this.nfc_data) {
			// 	this.removeNfcData();
			// }
			this.getUser();
			uni.getSystemInfo({
				success: (res) => {
					this.windowHeight = res.windowHeight
				}
			});
			if (option.status && option.status == 1) {
				uni.hideLoading();
				setTimeout(() => {
					this.offlineNotification();
				}, 1500)
			}
			uni.setStorageSync('warn_switch', false);
		},
		watch: {
			// nfc_data(val) {
			// 	if (val) {
			// 		this.nfcLogin();
			// 	}
			// }
		},
		computed: {
			// ...mapGetters({
			// 	nfc_data: 'app/nfcData'
			// })
		},
		methods: {
			...mapMutations({
				// removeNfcData(commit) {
				// 	commit('app/REMOVE_NFC_DATA')
				// },
				setToken(commit, tokenInfo) {
					commit('user/SET_TOKEN', tokenInfo)
				},
				setUserInfo(commit, userInfo) {
					commit('user/SET_USER_INFO', userInfo)
				},
				logout: 'user/REMOVE_TOKEN',
				setPopupId: 'app/SET_POPUP_ID',
				setPopupData: 'app/SET_POPUP_DATA',
			}),
			// 处理登录
			async handleLogin(formData) {
				this.submit_loading = true;
				this.$request('/v1/user/login', formData, 'POST').then(async res => {
					this.loginUser = res.data;
					this.setUserInfo(this.loginUser);
					this.setToken({
						token: this.loginUser.token,
						tokenExpired: Date.now() + 1000 * 60 * 60 * 24 * 60
					});
					await this.saveAccount();
					await this.handleRemember(formData);
					await this.getIpisConfig();
					uni.switchTab({
						url: '/pages/tabbar/index',
						success: (res) => {
							appInit.init()
						}
					})
					this.submit_loading = false;
				}).catch(error => {
					this.submit_loading = false;
					// this.$utils.toast(error.err.info);
					// if (error.err && error.err.info) {
					// 	let msg = error.err.info;
					// 	this.$utils.toast(error.err.info);
					// } else {
						this.$utils.toast('无法登录，请检查网络!');
					// }
				})
			},
			// 获取配置文件
			getIpisConfig() {
				return new Promise((resolve, reject) => {
					let api_ip = uni.getStorageSync('api_ip')
					this.$request(`/v3/ags/sys-conf?host=${api_ip}`).then(async res => {
						const {
							data
						} = res;
						let links = {
							preview: data.file_stream,
							swmsFileInternet: data.file_stream,
							mqtt: data.mqtt_tcp,
							getUploadUrl: data.file_stream,
							mqttWx: '',
							online_map_enable: data.online_map_enable
						}
						uni.setStorageSync('links', links)
						resolve()
					}).catch(error => {
						// this.$utils.toast(error.err.info);
						// if (error.errInfo && error.errInfo.msg) {
						// 	let msg = error.errInfo.msg;
						// 	this.$utils.toast(msg);
						// } else {
							// this.$utils.toast('获取配置文件失败!');
						// }
						reject()
					})
				})
			},
			// 普通登录提交登录
			onSubmit() {
				this.formData.password = md5(this.formData.originalPassword.toLowerCase());
				this.formData.type = 1;
				if (this.formData.account && this.formData.password) {
					this.handleLogin(this.formData);
				} else {
					this.$utils.toast('请输入账号密码!')
				}
			},
			// NFC登录提交
			onNfcSubmit() {
				this.nfcForm.password = md5(this.nfcForm.originalPassword.toLowerCase());
				this.nfcForm.type = 2;
				if (this.nfcForm.password) {
					this.handleLogin(this.nfcForm);
				} else {
					this.$utils.toast('请输入登录密码!')
				}
			},
			// 记住密码
			handleRemember(formData) {
				return new Promise(async (resolve, reject) => {
					if (this.isRemember) {
						if (formData.type === 1) {
							uni.setStorageSync('lastuser', JSON.stringify(formData));
						} else if (formData.type === 2) {
							uni.setStorageSync('lastNfcUser', JSON.stringify(formData));
						}
					}
					resolve()
				});
			},
			// 查询历史账号
			async queryHistoryAccount() {
				let select = `select * from ipis_users WHERE status="0"`;
				this.userData = await this.$db.selectSQL(select);
				this.noUser = this.userData.length <= 0;
			},
			// 保存登录账号
			async saveAccount() {
				let sql =
					`replace into ipis_users values("${this.loginUser.id}", "0", "${this.loginUser.userName}", "${this.formData.account}", "${this.formData.originalPassword}")`;
				await this.$db.executeSQL(sql);
			},
			// 获取账号密码
			getUser() {
				let user = uni.getStorageSync('lastuser');
				if (user) {
					this.formData = JSON.parse(user)
				}
			},
			// NFC登录查询
			nfcLogin() {
				let user, lastNfcUser;
				this.$request('/v1/user/getUserBynfc', {
					nfc: this.nfc_data
				}).then(res => {
					if (res.code === 200) {
						if (res.data != null) {
							user = uni.getStorageSync('lastNfcUser');
							if (user) {
								lastNfcUser = JSON.parse(user)
							}
							if (lastNfcUser && lastNfcUser.account === res.data.account) {
								this.nfcForm = res.data;
								this.nfcForm.originalPassword = lastNfcUser.originalPassword;
							} else {
								this.nfcForm = res.data;
							}
							this.removeNfcData()
							this.$refs.popup.open();
						} else {
							this.$utils.toast('非法卡号!')
						}
					} else {
						this.$utils.toast('查询失败!')
					}
				}).catch(err => {
					console.log(err);
					this.$utils.toast(err.errInfo.msg);
					this.removeNfcData();
				})
			},
			// 跳转工程模式
			onNavigator() {
				this.count += 1;
				if (this.count === 6) {
					uni.navigateTo({
						url: "/pages/user/engineer"
					})
				}
				let timeout = setTimeout(() => {
					clearTimeout(timeout)
					this.count = 0;
				}, 2000)
			},
			onClose() {
				this.$refs.popup.close();
				this.removeNfcData();
			},
			getCheckboxValue(e) {
				let values = e.detail.value;
				if (values.includes('checked')) {
					this.isRemember = true
				} else {
					this.isRemember = false
				}
			},
			onDropDownBox() {
				this.isSpread = !this.isSpread;
				if (this.isSpread) {
					this.queryHistoryAccount();
				}
			},
			onSelectUser(user) {
				this.formData.account = user.account;
				this.formData.originalPassword = user.password;
				this.isSpread = !this.isSpread;
			},
			async onDeleteUser(id) {
				let sql = `UPDATE ipis_users SET status="-1" WHERE id="${id}"`;
				this.$db.executeSQL(sql);
				this.queryHistoryAccount();
			},
			onInput() {
				this.isSpread = false;
			},
			// 下线通知
			offlineNotification() {
				let uuid = generate_UUID();
				this.setPopupId(uuid);
				let params = {
					title: '下线通知',
					content: '账户已在其他设备登录，如非本人操作，请及时修改密码',
					affirmButtonText: '知道了'
				}
				this.setPopupData(params);
				uni.getSubNVueById('login-tips-popup').show('zoom-fade-out', 250);
			}
		}
	}
</script>

<style lang="scss">
	.login-content {
		overflow: hidden;
		background-color: #FFFFFF;
	}

	.logo-content {
		text-align: center;
		margin-top: 102px;
		margin-bottom: 16px;

		.logo {
			width: 65px;
			height: 65px;
		}
	}

	.logo-title {
		text-align: center;
		margin-bottom: 38px;

		.primary-title {
			font-size: 20px;
			color: #060606;
			margin-bottom: 5px;
		}

		.explain {
			font-size: 14px;
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
			padding: 0 20rpx 0;

			.input-title {
				font-size: 17px;
				color: #333333;
			}

			.input {
				height: 47px;
				margin-left: 100rpx;
			}

			.drop-down__box {
				position: absolute;
				left: 0;
				right: 20rpx;
				top: 114rpx;
				z-index: 99;
				overflow: auto;
				background-color: #FFFFFF;
				border-radius: 16rpx;
				box-shadow: 0 0 10rpx #999999;
				transition: height 0.3s;
			}

			.user-account {
				display: flex;
				padding: 10rpx 30rpx;
				align-items: center;
				justify-content: space-between;

				&:last-child {
					padding-bottom: 20rpx;
					padding-left: 30rpx;
					padding-right: 30rpx;
				}

				&:first-child {
					padding-top: 20rpx;
					padding-left: 30rpx;
					padding-right: 30rpx;
				}
			}

			.no-user {
				padding: 20rpx;
				text-align: center;
				color: #666666;
			}

			.delete-button {
				padding: 10rpx;

				.delete-icon {
					width: 34rpx;
					height: 34rpx;
				}
			}
		}

		.checkbox-wrapper {
			padding: 12px 15px 0 15px;
			font-size: 14px;
			color: #b2b2b2;
			margin-bottom: 50px;
		}

		.button-wrapper {
			padding: 0 12px;

			button {
				height: 49px;
			}
		}
	}

	.input-placeholder {
		font-size: 17px;
		color: #cccccc;
	}

	/deep/.uni-popup__wrapper-box {
		width: 100%;
	}

	.card-login__dialog {
		margin: 0 25px;

		.card-login {
			background-color: #FFFFFF;
			padding: 0 40rpx;
			border-radius: 8px;
			position: relative;
			overflow: hidden;

			.close {
				position: absolute;
				top: 24px;
				right: 14px;

				.close-img {
					width: 36rpx;
					height: 36rpx;
				}
			}

			.title {
				text-align: center;
				font-size: 19px;
				color: #333333;
				border-bottom: 1rpx solid #e5e5e5;
				padding: 18px 0;
			}

			.card-login__form {
				// padding: 25rpx 0;

				.form-item {
					padding: 15px 0;
					color: #333333;
				}

				.form-item__label {
					font-size: 16px;
				}

				.form-item__content {
					font-size: 16px;
					margin-left: 22px;
				}

				.form-item__cell {
					display: flex;
					align-items: center;

					.form-item__input {
						margin-left: 22px;
					}

					.input-placeholder {
						font-size: 16px;
						color: #cccccc;
					}
				}

				.form-item__checkbox {
					justify-content: space-between;
					border-top: 1rpx solid #e5e5e5;
					font-size: 14px;
					color: #306dfe;
					margin-bottom: 27px;
				}

				.card-login__button {
					margin-bottom: 25px;

					button {
						height: 49px;
					}
				}
			}
		}
	}

	.drop-down__button {
		transform: rotate(90deg);
		padding: 20rpx;
		transition: transform 0.3s;
		position: absolute;
		right: 20px;
		top: 4px;

		.down-arrow {
			width: 15rpx;
			height: 35rpx;
		}
	}
</style>