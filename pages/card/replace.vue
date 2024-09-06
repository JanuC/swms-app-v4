<template>
	<view class="content card-wrap">
		<view class="card-group card-group__top">
			<view class="label-title border-bottom__1">
				<text>设备或巡查点信息</text>
			</view>
			<view class="card-content">
				<view class="list">
					<text class="list-label">设备:</text>
					<navigator url="/pages/card/device" class="select-button">
						<text>选择设备或巡查点</text>
					</navigator>
				</view>
				<view v-show="nfcInfo.code != ''">
					<view class="list">
						<text class="list-label">设备/点位:</text>
						<!-- <text class="list-label">{{nfcInfo.type == 0 ? nfcInfo.name : nfcInfo.location}}</text> -->
						<text class="list-label">{{nfcInfo.name}}</text>
					</view>
					<view class="list">
						<text class="list-label">NFC:</text>
						<text class="list-label">{{nfcInfo.code}}</text>
					</view>
				</view>
			</view>
		</view>
		<view class="card-group">
			<view class="label-title border-bottom__1">
				<text>新nfc信息</text>
			</view>
			<view class="card-content">
				<view class="list">
					<text class="list-label">卡片:</text>
					<view class="select-button" @click="handleScanCode">
						<text>扫一扫</text>
					</view>
				</view>
				<view class="list">
					<text class="list-label">卡片编号:</text>
					<view class="list-label list-input">
						<input placeholder="请输入NFC" type="number" maxlength="30" v-model="params.cardId" />
					</view>
				</view>
				<view class="list">
					<text class="list-label">现场图片:</text>
					<view class="img-wrap">
						<view v-show="params.picture.length < 2" class="add-img" @click="handlePhotograph">
							<image class="increase" src="/static/increase.png" mode="scaleToFill"></image>
						</view>

						<view @click="previewImg(item)" v-show='params.picture.length !== 0' class="picture-wrap"
							v-for="(item,index) in params.picture">
							<image @click.stop="delImg(index)" class="delete-icon" src="/static/delete.png"
								mode="scaleToFill"></image>
							<image class="patrol-photo" :src="item" mode="scaleToFill">
							</image>
						</view>
					</view>
				</view>
			</view>
		</view>
		<view class="button-wrap" @click="onSubmit">
			<button type="primary">确定</button>
		</view>
	</view>
</template>

<script>
	import moment from 'moment';
	let subNav = null;
	import NFC from '@/utils/nfc.js';
	import {
		mapGetters,
		mapMutations
	} from 'vuex';
	const notify = uni.requireNativePlugin('webo_ipis_notify');
	export default {
		data() {
			return {
				params: {
					"type": 1, //类型: 0-设备; 1-巡查点
					"cardNo": "", //设备或巡查点的ID
					"cardOriginId": "", //旧NFC卡号
					"cardId": "", //新NFC卡号
					"replaceTime": "", //更换时间
					"picture": [], //线场图片
				}
			}
		},
		onLoad() {
			uni.$off('onCardPopupConfirm');
			uni.$on('onCardPopupConfirm', (res) => {
				this.$utils.toast('更换成功!');
				this.params = {
					"type": 0, //类型: 0-设备; 1-巡查点
					"cardNo": "", //设备或巡查点的ID
					"cardOriginId": "", //旧NFC卡号
					"cardId": "", //新NFC卡号
					"replaceTime": "", //更换时间
					"picture": [], //线场图片
				}
				this.setCodeInfo({
					code: '',
					location: '',
					type: 0,
					id: '',
					name: '',
					deviceId: '',
					preture: '',
					cardNo: ''
				})
				this.$store.commit('app/SET_CARDINFO', [])
				setTimeout(() => {
					uni.switchTab({
						url: '../tabbar/index'
					})
				}, 1000)
			})
		},
		destroyed() {
			this.setCodeInfo({
				code: '',
				location: '',
				type: 0,
				id: '',
				name: '',
				deviceId: '',
				preture: ''
			})
		},
		computed: {
			...mapGetters({
				nfc_data: 'app/nfcData',
				getUsers: 'user/getUserInfo',
				nfcInfo: 'app/getNfcInfo',
				netWork: 'app/getNetWork'
			})
		},
		watch: {
			nfc_data(val) {
				if (val) {
					this.nfClock();
				} else {
					if (this.params.cardId == '' && val == "") {
						this.$utils.toast('未读取到内容!');
					}
				}
			},
		},
		onNavigationBarButtonTap(e) {
			if (e.text == '更换记录') {
				uni.navigateTo({
					url: './list'
				})
			}
		},
		methods: {
			...mapMutations({
				removeNfcData(commit) {
					commit('app/REMOVE_NFC_DATA')
				},
				setCodeInfo: 'app/SET_NFCINFO'
			}),
			// 扫码
			handleScanCode() {
				uni.scanCode({
					onlyFromCamera: true,
					scanType: ['qrCode'],
					success: (res => {
						if (res.result) {
							this.params.cardId = res.result
							this.$utils.onBeep();
						} else {
							this.$utils.toast('未读取到内容!');
						}
					}),
					fail: (error => {
						if (error.errMsg == 'scanCode:fail cancel') return
						this.$utils.toast('非法条码，请确认条码是否正确.');
					})
				});
			},
			// NFC
			async nfClock() {
				this.$utils.onBeep();
				this.params.cardId = this.nfc_data;
				this.removeNfcData();
			},
			// 拍照
			handlePhotograph() {
				uni.chooseImage({
					count: 1,
					sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
					sourceType: ['camera'],
					success: (res => {
						this.params.picture.unshift(res.tempFilePaths[0]);
					})
				});
			},
			// 删除图片
			delImg(index) {
				this.params.picture.splice(index, 1);
			},
			// 预览图片
			previewImg(img) {
				uni.previewImage({
					current: 0,
					urls: [img]
				})
			},
			// 查询更改设备信息
			getCardInfo() {
				if (this.nfcInfo.code == "") {
					this.$utils.toast('旧NFC为空!');
					return
				}

				if (this.params.cardId == '') {
					this.$utils.toast('新NFC为空!');
					return
				}

				if (this.params.picture.length == 0) {
					this.$utils.toast('现场图片为空!');
					return
				}
			},
			async onSubmit() {
				uni.showLoading({
					title: '卡片更换中...',
					mask: true
				});
				this.params.type = this.nfcInfo.type;
				this.params.cardOriginId = this.nfcInfo.code;
				this.params.cardNo = this.nfcInfo.id;
				if (this.nfcInfo.code == "") {
					this.$utils.toast('旧NFC为空!');
					return
				}
				if (this.params.cardId == '') {
					this.$utils.toast('新NFC为空!');
					return
				}
				if (this.params.picture.length == 0) {
					this.$utils.toast('现场图片为空!');
					return
				} else {
					let filse = []
					new Promise((resolve, reject) => {
						this.params.picture.forEach(async (item, index) => {
							await this.$utils.synchrodataFile(item, 0).then(res => {
								if (res.code == 'success') {
									filse.push(res.url)
									if (index == this.params.picture.length - 1) {
										resolve(filse);
									}
								} else {
									filse.push('')
									if (index == this.params.picture.length - 1) {
										resolve(filse);
									}
								}
							})
						})
					}).then(data => {
						this.params.replaceTime = moment().format('YYYY-MM-DD HH:mm:ss');
						let params = [JSON.parse(JSON.stringify(this.params))];
						params[0].picture = data.join(',');
						if (!this.netWork) {
							uni.hideLoading();
							this.$utils.toast('更换失败!', 'error');
							return
						}
						//提交之前先查询历史提交信息
						this.$request('/v3/ipis/card/replace', params, 'POST').then(res => {
							// if (res.code == 200) {
							uni.hideLoading();
							if (this.nfcInfo.type == 0) {
								this.$request('/v3/ipis/card/devices/' + res.data).then(
									res => {
										// if (res.code == 200) {
										this.$store.commit('app/SET_CARDINFO', {
											data: res.data,
											type: this.params.type
										})
										setTimeout(() => {
											subNav = uni.getSubNVueById(
												'card-popup')
											uni.$emit('onShowOperationPopup', '')
										}, 200)
										// }
									})
							} else {
								this.$utils.toast('更换成功!');
								setTimeout(() => {
									uni.switchTab({
										url: '../tabbar/index'
									})
								}, 1000)
							}
							// } else {
							// 	uni.hideLoading();
							// 	if (res.errInfo.id == 10002) {
							// 		this.$utils.toast('NFC卡一致', 'error');
							// 	} else if (res.errInfo.id == 10003) {
							// 		this.$utils.toast('新NFC已绑定', 'error');
							// 	} else {
							// 		this.$utils.toast('更换失败!', 'error');
							// 	}
							// }
						}).catch(error => {
							uni.hideLoading();
							this.$utils.toast(error.err.info, 'none');
							// if (error.errInfo.id == 10002) {
							// 	this.$utils.toast('NFC卡一致', 'error');
							// } else if (error.errInfo.id == 10003) {
							// 	this.$utils.toast('新NFC已绑定', 'error');
							// } else {
							// 	this.$utils.toast('更换失败!', 'error');
							// }
						})
					})
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.card-wrap {
		overflow-x: hidden;

		.card-group {
			padding-left: 15px;
			background-color: #FFFFFF;
			padding-bottom: 20px;
		}

		.card-group__top {
			padding-top: 15px;
		}

		.label-title {
			font-size: 17px;
			color: #000000;
			padding: 10px 0;
			margin-top: 10px;
		}

		.card-content {
			padding: 8px 15px 0 0;

			.list {
				display: flex;
				line-height: 25px;
				justify-content: space-between;
				padding: 8px 0;
				align-items: center;

				.img-warp {
					display: flex;
					flex-direction: row-reverse;
					flex-wrap: wrap;
				}

				.patrol-photo {
					margin-left: 6px;
					margin-bottom: 10px;
				}

				&>.list-label:first-child {
					width: 80px;
					color: #707070;
				}

				&>.list-label:last-child {
					flex: 1;
					flex-wrap: wrap;
					text-align: right;
				}
			}



			.list-input {
				background-color: #f5f5f5;
				padding-right: 10px;
				width: 60%;
				text-align: right;

				input {
					padding: 6px 0;
				}
			}

			.select-button {
				// width: 72px;
				padding: 0 10px;
				height: 25px;
				line-height: 25px;
				text-align: center;
				background-color: $uni-color-primary;
				border-radius: 12px;
				font-size: 12px;
				color: #ffffff;
			}
		}

		.img-wrap {
			margin-bottom: 10px;
			display: flex;
			flex-direction: row-reverse;

			.picture-wrap {
				position: relative;
				margin-left: 4px;

				.delete-icon {
					width: 16px;
					height: 16px;
					position: absolute;
					top: 5px;
					right: 5px;
					z-index: 2;
				}
			}

			.add-img {
				width: 90px;
				height: 80px;
				border: solid 1rpx rgba(229, 229, 229, 0.5);
				border-radius: 5px;
				display: flex;
				align-items: center;
				justify-content: center;
				margin-left: 10px;

				.increase {
					width: 32px;
					height: 32px;
				}
			}
		}

		.button-wrap {
			margin: 20px 15px
		}
	}
</style>