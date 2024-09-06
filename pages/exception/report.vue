<template>
	<view class="content card-wrap">
		<view class="card-group card-group__top">
			<view class="label-title border-bottom__1">
				<text>描述</text>
				<view @click="gotoVoice" class="select-button">
					<text>语音描述</text>
				</view>
			</view>
			<view class="card-content">
				<textarea v-if="fromData.descriptionType == 0" class="textarea" @blur="bindTextAreaBlur"
					v-model="fromData.descrition" placeholder="请输入" maxlength="300"
					placeholder-class="input-placeholder" />
				<view v-else class="audio-wrap">
					<view class="audio-play">
						<view v-if="!isPlaying" class="page-body-button" @click="playVoice">
							<text class="current-time">{{maxTime}}秒</text>
							<image class="play-icon" src="@/static/play1.png"></image>
						</view>
						<view v-else class="page-body-button" @click="stopVoice">
							<text class="current-time">{{currentTime}}秒</text>
							<image class="stop-icon" src="@/static/stop1.png"></image>
						</view>
					</view>
					<image class="delete-audio" src="/static/delete.png" mode="scaleToFill" @click="onDeleteAudio">
					</image>
				</view>
			</view>
		</view>
		<view class="card-group">
			<view class="label-title border-bottom__1">
				<text>位置</text>
			</view>
			<view class="card-content">
				<input class="input" type="text" maxlength="30" v-model="fromData.location" placeholder="请输入"
					placeholder-class="input-placeholder" />
			</view>
		</view>
		<view class="card-group">
			<view class="label-title border-bottom__1">
				<text>现场图片</text>
			</view>
			<view class="card-content">
				<view class="scene-picture">
					<view class="img-wrap" v-for="(img, index) in localPicture">
						<image class="delete-icon" src="/static/delete.png" mode="scaleToFill"
							@click="onDeletePhoto(index)"></image>
						<image class="patrol-photo" :src="img" mode="scaleToFill"></image>
					</view>
					<view v-if="localPicture.length < 3" class="add-img" @click="handlePhotograph">
						<image class="increase" src="/static/increase.png" mode="scaleToFill"></image>
					</view>
				</view>
			</view>
		</view>
		<view class="button-wrap">
			<button type="primary" :loading="submit_loading" :disabled="submit_loading" @click="onSubmit">上报</button>
		</view>
	</view>
</template>

<script>
	import moment from 'moment';
	import {
		generate_UUID
	} from "@/common/js/uuid.js";
	import syncFunc from '@/utils/dataSync.js';
	import {
		Debounce
	} from '@/utils/index.js'
	import {
		mapGetters,
		mapMutations
	} from 'vuex';
	export default {
		data() {
			return {
				fromData: {
					"descriptionType": 0, //描述类型: 0-文字描述;1-语音描述
					"descrition": "", //描述内容: 文字描述直接是文字内容,语音描述为语音文件ID
					"location": "", //位置信息
					"picture": "", //现场图片: 如果有多张图片, 文件ID用英文的分号隔开
					"reportTime": "", //报告时间: 由APP端生成发送时间, 避免离线情况，
				},
				localPicture: [], // 本地图片
				localAudio: '',
				audioContext: '',
				isPlaying: false,
				isPlayEnd: false,
				currentTime: 0,
				maxTime: 0,
				duration: 100,
				timeLeft: 0,
				submit_loading: false
			}
		},
		computed: {
			...mapGetters({
				getUsers: 'user/getUserInfo',
				netWork: 'app/getNetWork'
			})
		},
		onNavigationBarButtonTap(e) {
			uni.navigateTo({
				url: '/pages/exception/list'
			});
		},
		onShow() {
			uni.$on('onMusicSrc', (data) => {
				this.fromData.descriptionType = 1;
				// this.currentTime = data.time;
				this.maxTime = data.time
				if (data.src !== '') {
					uni.saveFile({
						tempFilePath: data.src,
						success: (res) => {
							this.localAudio = res.savedFilePath;
							this.audioContext.src = res.savedFilePath;
						}
					});
				} else {
					this.onDeleteAudio()
				}

			})
		},
		onLoad() {
			uni.hideLoading();
			this.audioContext = null;
			this.createAudio();
		},
		onUnload() {
			if (this.audioContext != null && this.isPlaying) {
				this.stop();
			}
			uni.$off('onTipsPopupConfirm');
		},
		methods: {
			...mapMutations({
				setPopupId: 'app/SET_POPUP_ID',
				setPopupData: 'app/SET_POPUP_DATA'
			}),
			bindTextAreaBlur(e) {
				console.log(e.detail.value)
			},
			// 上报
			async onSubmit() {
				if (!this.fromData.descrition && this.fromData.descriptionType == 0) {
					this.$utils.toast('请输入描述信息!')
				} else if (!this.fromData.location) {
					this.$utils.toast('请输入位置信息!')
				} else if (!this.localPicture.length) {
					this.$utils.toast('请拍摄现场照片!')
				} else {
					this.submit_loading = true;
					uni.showLoading({
						title: '上报中...',
						mask: true
					});
					let isNetwork = await this.$utils.monitorNetwork();
					this.fromData.reportTime = moment().format('YYYY-MM-DD HH:mm:ss');
					let params = JSON.parse(JSON.stringify(this.fromData))
					if (this.localAudio == '') {
						params.descriptionType = 0;
						params.duration = '0'
					} else {
						params.descriptionType = 1;
						params.duration = this.maxTime.toString()
					}
					this.offlineStorage(params).then(async res => {
						if (res) {
							if (isNetwork) {
								await syncFunc.reportException().then(res => {
									if (res) {
										this.$utils.toast('上报成功!');
										setTimeout(() => {
											uni.navigateBack({
												delta: 1
											});
											uni.hideLoading();
											this.submit_loading = false;
										}, 1000);
									} else {
										setTimeout(() => {
											this.onShowTipsPopup('fail');
											uni.hideLoading();
											this.submit_loading = false;
										}, 200)
									}
								}).catch(error => {
									setTimeout(() => {
										this.onShowTipsPopup('fail');
										uni.hideLoading();
										this.submit_loading = false;
									}, 200)
								})
							} else {
								setTimeout(() => {
									this.onShowTipsPopup('fail');
									this.submit_loading = false;
								}, 200);
								uni.hideLoading();
							}
						}
					})
				}
			},
			// 离线存储上报信息
			offlineStorage(data) {
				return new Promise((resolve, reject) => {
					let uuid = generate_UUID();
					let insertSQL =
						`INSERT INTO ipis_exception values("${uuid}","${data.descriptionType}", "${data.descrition}", "${data.location}", '${data.picture}', "${data.reportTime}", '${JSON.stringify(this.localPicture)}', "${this.localAudio}", "${this.getUsers.id}", 0, "${data.duration}")`;
					this.$db.executeSQL(insertSQL).then(res => {
						console.log('成功', res)
						resolve(true)
					}).catch(error => {
						console.log('失败', error)
						resolve(false)
					});
				})
			},
			// 拍照
			handlePhotograph() {
				uni.chooseImage({
					count: 1,
					sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
					sourceType: ['camera'],
					success: (res => {
						let tempFilePaths = res.tempFilePaths[0]
						uni.saveFile({
							tempFilePath: tempFilePaths,
							success: (res) => {
								this.localPicture.push(res.savedFilePath);
							}
						});
					})
				});
			},
			// 跳转录音页面
			gotoVoice() {
				uni.navigateTo({
					url: './voice?audioPath=' + this.localAudio
				})
			},
			onShowTipsPopup(type) {
				let uuid = generate_UUID();
				this.setPopupId(uuid);
				let params = {
					taskSubmitTips: type,
					confirmType: 3
				}
				this.setPopupData(params);
				uni.$on('onTipsPopupConfirm', () => {
					uni.navigateBack({
						delta: 1
					});
				});
				uni.getSubNVueById('exception-tips-popup').show('zoom-fade-out', 250);
			},
			onDeletePhoto(index) {
				this.localPicture.splice(index, 1);
			},
			onDeleteAudio() {
				this.fromData.descriptionType = 0;
				this.localAudio = '';
				this.audioContext.src = '';
			},
			createAudio() {
				var innerAudioContext = this.audioContext = uni.createInnerAudioContext();
				innerAudioContext.autoplay = false;
				innerAudioContext.src = "";
				innerAudioContext.onPlay(() => {
					console.log('开始播放');
				});
				innerAudioContext.onTimeUpdate((e) => {
					this.currentTime = Math.round(innerAudioContext.currentTime) || 0;
					this.duration = innerAudioContext.duration || 0;
				});
				innerAudioContext.onEnded(() => {
					// this.currentTime = 0;
					this.isPlaying = false;
					this.isPlayEnd = true;
				});
				innerAudioContext.onError((res) => {
					this.isPlaying = false;
					console.log(res.errMsg);
					console.log(res.errCode);
				});
				innerAudioContext.onCanplay((res) => {
					console.log(innerAudioContext.duration)
					console.log(res)
				})
				return innerAudioContext;
			},
			playVoice() {
				console.log(this.audioContext.src)
				if (this.isPlaying) {
					this.pause();
					return;
				}
				this.isPlaying = true;
				this.audioContext.play();
				this.isPlayEnd = false;
			},
			pause() {
				this.audioContext.pause();
				this.isPlaying = false;
			},
			stopVoice() {
				this.audioContext.stop();
				this.isPlaying = false;
				this.currentTime = 0;
			},
			handleSwitch(id) {
				this.activeTabbar = id;
				this.params.status = id;
			},
		}
	}
</script>

<style lang="scss" scoped>
	.card-wrap {
		.card-group {
			padding-left: 15px;
			background-color: #FFFFFF;
		}

		.label-title {
			font-size: 17px;
			color: #000000;
			padding: 10px 0;
			display: flex;
			align-items: center;
			justify-content: space-between;
		}

		.select-button {
			width: 72px;
			height: 25px;
			line-height: 25px;
			text-align: center;
			background-color: $uni-color-primary;
			border-radius: 12px;
			font-size: 12px;
			color: #ffffff;
			margin-right: 15px;
		}

		.card-content {
			padding: 8px 15px 0 0;
			overflow: hidden;

			.textarea {
				width: 100%;
				height: 100px;
				padding: 10px;
				box-sizing: border-box !important;
				background-color: #f5f5f5;
			}

			.input {
				height: 40px;
				background-color: #f5f5f5;
				padding-left: 10px;
			}
		}

		.scene-picture {
			display: flex;
			// justify-content: space-between;
			flex-wrap: wrap;
			padding: 10px 0 20px;

			.img-wrap {
				width: 100px;
				height: 80px;
				position: relative;
				margin-bottom: 10px;
				margin-right: 10px;
			}

			.add-img {
				width: 100px;
				height: 80px;
				border: solid 1rpx rgba(229, 229, 229, 0.5);
				border-radius: 5px;
				display: flex;
				align-items: center;
				justify-content: center;

				.increase {
					width: 32px;
					height: 32px;
				}
			}
		}

		.button-wrap {
			margin: 20px 15px
		}

		.delete-icon {
			width: 15px;
			height: 15px;
			position: absolute;
			top: 5px;
			right: 5px;
			z-index: 2;
		}
	}

	.audio-wrap {
		height: 30px;
		line-height: 30px;
		border-radius: 15px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		background-color: #000000;
		padding: 0 20px;
		margin: 20px 0;

		.audio-play {
			display: flex;
			align-items: center;
		}

		.page-body-button {
			display: flex;
			align-items: center;

			.play-icon,
			.stop-icon {
				width: 20px;
				height: 20px;
			}
		}

		.current-time {
			font-size: 12px;
			color: #FFFFFF;
			margin-right: 10px;
		}

		.delete-audio {
			width: 20px;
			height: 20px;
		}
	}
</style>
