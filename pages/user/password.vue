<template>
	<view class="content">
		<view class="password-wrap">
			<view class="input-wrap border-bottom__0">
				<text class="input-label">旧密码</text>
				<input class="input" placeholder="请输入原始密码" type="text" v-model="oldPassword" />
			</view>
			<view class="input-wrap__groub">
				<view class="input-wrap">
					<text class="input-label">新密码</text>
					<input class="input" type="text" password v-model="newPassword" placeholder="请输入"
						placeholder-class="input-placeholder" />
				</view>
				<view class="input-wrap border-bottom__0">
					<text class="input-label">确认密码</text>
					<input class="input" type="text" password v-model="confirmpassword" placeholder="请输入"
						placeholder-class="input-placeholder" />
				</view>
			</view>
			<view class="tips">
				<text>*修改密码后，请牢记密码，若密码丢失请联系管理员。</text>
			</view>
			<view class="button-wrap">
				<button type="primary" @click="changePassword">确定</button>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		mapGetters,
		mapMutations
	} from 'vuex'
	export default {
		data() {
			return {
				oldPassword: '',
				newPassword: '',
				confirmpassword: '',
			};
		},
		computed: {
			...mapGetters({
				getUsers: 'user/getUserInfo'
			})
		},
		methods: {
			...mapMutations({
				logout: 'user/REMOVE_TOKEN'
			}),
			passwordVerify() {
				let reg = /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,20}$/;
				if (this.oldPassword && this.newPassword && this.confirmpassword) {
					if (reg.test(this.newPassword)) {
						if (this.newPassword === this.confirmpassword) {
							return true
						}
					}
					return false
				}
				return false
			},
			changePassword() {
				if (this.passwordVerify()) {
					let options = {
						id: this.getUsers.id,
						oldPassword: this.oldPassword,
						newPassword: this.newPassword
					}
					this.$request('/v1/user/changePassword', options, 'POST').then(res => {
						// console.log(res)
						// if (res.code === 200) {
							this.logout();
							uni.showToast({
								mask: true,
								icon: 'none',
								title: '修改成功,请重新登录!',
								success: () => {
									uni.reLaunch({
										url: '/pages/user/login'
									})
								}
							})
						// } else {
						// 	uni.showToast({
						// 		mask: true,
						// 		icon: 'none',
						// 		title: data.errInfo.msg
						// 	})
						// }
					}).catch(error => {
						// if (error.errInfo && error.errInfo.msg) {
						// 	this.$utils.toast(error.errInfo.msg)
						// }
						this.$utils.toast(error.err.info)
					})
				} else {
					this.$utils.toast('请输入包含字母数字6-20位密码')
				}
			}
		}
	}
</script>

<style lang="scss">
	.password-wrap {
		padding-top: 32px;
		overflow: hidden;

		.input-wrap {
			height: 48px;
			background-color: #ffffff;
			display: flex;
			align-items: center;
			padding: 0 12px;
			border-bottom: 1rpx solid #E5E5E5;

			.input-label {
				font-size: 17px;
				color: #333333;
				width: 99px;
			}
		}

		.border-bottom__0 {
			border-bottom: 0;
		}

		.input-wrap__groub {
			margin-top: 15px;
		}

		.tips {
			font-size: 12px;
			color: #707070;
			margin-top: 15px;
			margin-bottom: 62px;
			text-align: center;
		}
	}
</style>
