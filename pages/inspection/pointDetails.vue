<template>
	<view class="content point-details">
		<view class="point-title">
			<view class="point-name">
				<text>{{details.name}}</text>
			</view>
			<view v-if="taskStatus && taskStatus == 0 && details.status != 1" class="abnormal-button"
				@click="handlePhotograph">
				<text>无法巡查</text>
			</view>
		</view>
		<view class="point-content">
			<view class="point-info__item" v-if="details.status != 0">
				<image v-if="details.fileStatus == 0" class="patrol-photo" :src="details.localFilePath"
					mode="scaleToFill" @click="onPicturePreview(details.localFilePath)">
				</image>
				<image v-else-if="details.fileStatus == 1" class="patrol-photo"
					@click="onPicturePreview(links.preview+details.sitePhotos[0])"
					:src="links.preview+details.sitePhotos[0]" mode="scaleToFill">
				</image>
			</view>
			<view class="point-info__item" v-if="details.status && details.status != 0">
				<text class="label">巡查结果：</text>
				<text class="content normal-result" v-if="details.status==1">正常巡查</text>
				<text class="content abnormal-result" v-else>异常巡查</text>
			</view>
			<view class="point-info__item" v-if="details.status && details.status == -1">
				<text class="label">说明：</text>
				<text class="content">{{details.incompleteReason}}</text>
			</view>
			<view class="point-info__item" v-if="details.status && details.status != 0">
				<text class="label">时间：</text>
				<text class="content">{{details.time}}</text>
			</view>
			<view class="point-info__item">
				<text class="label">NFC：</text>
				<text class="content">{{details.nfc}}</text>
			</view>
			<view class="point-info__item oint-info__location">
				<view>
					<text class="label">位置：</text>
					<text class="content">{{details.location}}</text>
				</view>
				<view v-if="details.map && details.map.length>0" @click="onJumpMap(details.map)">
					<image class="map-icon" src="@/static/map_swms.png" mode="heightFix"></image>
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
	import syncFunc from '@/utils/dataSync.js';
	import NFC from '@/utils/nfc.js';
	export default {
		data() {
			return {
				details: {},
				taskStatus: 1,
				nfcNumber: '',
				takePhotos: 0,
				frequency: '',
				type: '',
				previousStatus: '',
				taskId: '',
				links: uni.getStorageSync('links')
			}
		},
		computed: {
			...mapGetters({
				getUsers: 'user/getUserInfo',
				nfc_data: 'app/nfcData'
			})
		},
		onLoad(option) {
			if (option.status != 0) {
				// #ifdef APP-PLUS
				let webView = this.$mp.page.$getAppWebview();
				// 修改buttons
				webView.setTitleNViewButtonStyle(0, {
					width: '0',
				});
				// #endif
			}
			this.taskId = option.taskId;
			this.taskStatus = option.status;
			this.takePhotos = option.takePhotos;
			this.frequency = option.frequency != '' ? option.frequency.split(',') : [];
			this.type = option.type;
			this.previousStatus = option.previousStatus;
			this.getPointDetails(option.id);
			NFC.listenNFCStatus();
		},
		onNavigationBarButtonTap(e) {
			this.handlePointScanCode()
		},
		watch: {
			nfc_data(val) {
				if (this.taskStatus == 0) {
					if (val) {
						this.nfClock();
					}
				}
			},
		},
		onUnload() {
			uni.$off('onDescriptionPopupConfirm');
		},
		methods: {
			...mapMutations({
				removeNfcData(commit) {
					commit('app/REMOVE_NFC_DATA')
				},
			}),
			getPointDetails(id) {
				let select = `SELECT * FROM ipis_inspection_locations WHERE id="${id}"`;
				this.$db.selectSQL(select).then(res => {
					if (res.length) {
						this.details = res[0];
						this.details.map = JSON.parse(this.details.map);
						this.details.sitePhotos = JSON.parse(this.details.sitePhotos);
						console.log(this.details)
					}
				})
			},
			// 手动打卡-异常巡查-1
			async handlePhotograph() {
				let isCard = await syncFunc.isPunchcard(this.frequency, this.type, this
					.details.weight, this.previousStatus, 'point-details-popup');
				if (isCard) {
					uni.chooseImage({
						count: 1,
						sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
						sourceType: ['camera'],
						success: (res => {
							let tempFilePaths = res.tempFilePaths[0];
							uni.$emit('onShowDescriptionPopup', '请填写无法巡查说明');
							uni.$on("onDescriptionPopupConfirm", (explain) => {
								uni.saveFile({
									tempFilePath: tempFilePaths,
									success: (res) => {
										let savedFilePath = res.savedFilePath;
										this.details.localFilePath = savedFilePath;
										this.details.status = -1;
										this.details.fileStatus = 0;
										this.details.incompleteReason = explain;
										syncFunc.handleInspectionPoint(this
											.details);
									}
								});
							})
						})
					});
				}
			},
			// NFC打卡
			async nfClock() {
				this.$utils.onBeep();
				// if (this.details.status != 0) {
				this.nfcNumber = this.nfc_data.toString();
				if (this.nfcNumber == this.details.nfc) {
					let isCard = await syncFunc.isPunchcard(this.frequency, this.type, this
						.details.weight, this.previousStatus, 'point-details-popup');
					if (isCard) {
						if (this.takePhotos == 1) {
							this.handlePhotos();
						} else {
							this.details.status = 1;
							this.details.sitePhotos = [];
							this.details.incompleteReason = "";
							let mapType = typeof this.details.map;
							this.details.map = mapType === 'string' ? JSON.parse(this.details.map) : this.details.map;
							if (this.details.localFilePath != '') {
								uni.removeSavedFile({
									filePath: this.details.localFilePath,
									complete: (res) => {
										this.details.localFilePath = "";
										this.details.fileStatus = -1;
									}
								});
							}
							syncFunc.handleInspectionPoint(this.details);
						}
					}
					this.removeNfcData();
				} else {
					uni.$emit('onErrorPopup', {
						content: '巡查点信息错误或者NFC卡无效,请检查巡查点信息',
						buttonNumber: 1,
						affirmButtonText: '知道了'
					});
					uni.getSubNVueById('point-tips-popup').show('zoom-fade-out', 250);
					this.removeNfcData();
				}
				// }
			},
			// 扫码打卡
			async handlePointScanCode() {
				uni.scanCode({
					onlyFromCamera: true,
					scanType: ['qrCode'],
					success: (async res => {
						if (this.details.nfc == res.result) {
							let isCard = await syncFunc.isPunchcard(this.frequency, this.type, this
								.details.weight, this.previousStatus, 'point-details-popup');
							if (isCard) {
								if (this.takePhotos == 1) {
									this.handlePhotos();
								} else {
									let mapType = typeof this.details.map;
									this.details.status = 1;
									this.details.sitePhotos = [];
									this.details.incompleteReason = "";
									this.details.map = mapType === 'string' ? JSON.parse(this.details.map) : this.details.map;
									if (this.details.localFilePath != '') {
										uni.removeSavedFile({
											filePath: this.details.localFilePath,
											complete: (res) => {
												this.details.localFilePath = "";
												this.details.fileStatus = -1;
											}
										});
									}
									this.$utils.onBeep();
									syncFunc.handleInspectionPoint(this.details);
								}
							}
						} else {
							uni.$emit('onErrorPopup', {
								content: '巡查点信息错误,请检查巡查点信息',
								buttonNumber: 1,
								affirmButtonText: '知道了'
							});
							uni.getSubNVueById('point-tips-popup').show('zoom-fade-out', 250);
						}
					})
				});
			},
			async handlePhotos() {
				uni.chooseImage({
					count: 1,
					sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
					sourceType: ['camera'],
					success: (res => {
						let tempFilePaths = res.tempFilePaths[0]
						uni.saveFile({
							tempFilePath: tempFilePaths,
							success: (res) => {
								let savedFilePath = res.savedFilePath;
								this.details.localFilePath = savedFilePath;
								this.details.status = 1;
								this.details.fileStatus = 0;
								this.details.sitePhotos = [];
								this.details.incompleteReason = "";
								let mapType = typeof this.details.map;
								this.details.map = mapType === 'string' ? JSON.parse(this.details.map) : this.details.map;
								syncFunc.handleInspectionPoint(this.details);
							}
						});
					})
				});
			},
			// 地图跳转
			async onJumpMap(data) {
				let dataType = typeof data;
				let dataObj = dataType == 'string' ? JSON.parse(data) : data;
				let isNetwork = await this.$utils.monitorNetwork();
				if (isNetwork) {
					let mapType, pageUrl;
					if (dataObj.length === 1) {
						mapType = dataObj[0].mapType;
					} else {
						let amap = dataObj.filter(item => item.mapType == -1);
						mapType = amap[0].mapType;
					}
					if (mapType) {
						pageUrl = mapType == -1 ? '/pages/map/amap' : '/pages/map/cmap';
						uni.setStorageSync('maps', {
							maps: dataObj,
							type: 2
						});
						uni.navigateTo({
							url: pageUrl
						});
					}
				} else {
					this.$utils.toast('当前状态无法查看地图!')
				}
			},
			// 照片预览
			onPicturePreview(imgUrl) {
				this.$utils.previewImg(imgUrl);
			},
			// 图片加载失败
			onImageError(e) {
				this.imageText = this.$utils.imageError(e);
				console.log(this.imageText, e)
			},
		}
	}
</script>

<style lang="scss" scoped>
	.point-details {
		background-color: #FFFFFF;
	}
</style>
