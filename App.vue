<script>
	import {
		mapGetters,
		mapMutations
	} from 'vuex'
	export default {
		computed: {
			...mapGetters({
				isTokenValid: 'user/isTokenValid',
				apiIp: 'app/apiIp',
			})
		},
		onLaunch: function() {
			console.log('App Launch', this.isTokenValid)
			// if (this.isTokenValid) {
			// 	// #ifdef APP-PLUS
			// 	plus.navigator.closeSplashscreen();
			// 	this.getConfigUrl();
			// 	// #endif
			// } else {
			// 	uni.reLaunch({
			// 		url: '/pages/login/login',
			// 		success: () => {
			// 			// #ifdef APP-PLUS
			// 			plus.navigator.closeSplashscreen()
			// 			// #endif
			// 		}
			// 	})
			// }
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		},
		onPageNotFound(msg) { // 页面不存在监听函数
			uni.redirectTo({
				url: '/pages/error/404'
			})
		},

		methods: {
			...mapMutations({
				setFileUrl(commit, data) {
					commit('system/SET_FILEURL', data)
				},
			}),
			/**
			 * 获取图片预览地址
			 */
			getConfigUrl() {
				return new Promise((resolve, reject) => {

					uni.getStorage({
						key: 'host',
						success: (res) => {

							let dstHost = res.data
							this.$request('/v3/ags/sys-conf', {
								host: dstHost
							}).then(res => {
								let {
									code,
									data
								} = res.data
								let file_stream = data.file_stream;
								this.setFileUrl(file_stream);

								uni.redirectTo({
									url: '/pages/home/home'
								})
								resolve(true)
							}).catch(error => {
								this.$utils.toast('获取配置文件失败');
								reject(error)
							})
						}
					})

				})
			},
		}

	}
</script>

<style lang="scss">
	/*每个页面公共css */
	/* #ifndef APP-PLUS-NVUE */
	page {
		height: 100%;
		font-family: Source Han Sans CN;
		background-color: #F2F4F5;
	}

	/* #endif*/

	.right-image {
		width: 16rpx;
		height: 30rpx;
		margin: 0 10rpx;
	}

	.add-button {
		width: 32rpx;
		height: 32rpx;
		margin: 0 10rpx;
	}

	.add-image {
		width: 32rpx;
		height: 32rpx;
	}

	.add-photo__wrap {
		width: 200rpx;
		height: 160rpx;
	}

	.add-photo {
		width: 200rpx;
		height: 160rpx;
	}

	.photo-wrap {
		margin-right: 27rpx;
		position: relative;
	}

	.photo-style {
		width: 200rpx;
		height: 160rpx;
		border-radius: 8rpx;
	}

	.delete-image {
		width: 34rpx;
		height: 34rpx;
		position: absolute;
		top: 10rpx;
		right: 10rpx;
	}

	.button-wrapper {
		padding: 0 24rpx;

		button {
			height: 98rpx;
			background: #9f4b63;
			color: #FFFFFF;
		}
	}
</style>
