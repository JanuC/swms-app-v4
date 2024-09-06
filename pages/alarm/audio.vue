<template>
	<view class="audio">
		<view class="audio-box">
			<view v-show="audioFile" class="audio-file">
				<view @click="playRecord" class="audio-content">
					<image v-show="status !== 4" src="@/static/alarm/icon5.png" mode=""></image>
					<image v-show="status == 4" src="@/static/alarm/icon4.png" mode=""></image>
					<text> {{ audioTimeText }}</text>
				</view>
			</view>
			<view class="audio-hand">
				<image @click="startRecord" v-show="status !== 2 " src="@/static/alarm/icon2.png" mode=""></image>
				<image @click="stopRecord" v-show="status == 2 " src="@/static/alarm/icon1.png" mode=""></image>
				<text v-show="status == 1"> 开始录音 </text>
				<text v-show="status == 2"> 结束录音 </text>
				<text v-show="status == 3 ||status == 4 "> 重新录音 </text>
			</view>
			<view class="audio-btn">
				<button @click="saveRecord" :disabled="!audioFile" type="primary">保存</button>
			</view>
		</view>
		<!-- 普通弹窗 -->
		<uni-popup :mask-click="false" ref="popup">
			<view @click="stopRecord" class="popup-content">
				<image src="@/static/alarm/icon6.png" mode=""></image>
				<text class="text">正在录音</text>
				<text>{{filterTimeText}}</text>
			</view>
		</uni-popup>
	</view>
</template>

<script>
	const recorderManager = uni.getRecorderManager();
	const innerAudioContext = uni.createInnerAudioContext();
	innerAudioContext.autoplay = true;

	export default {
		data() {
			return {
				status: 1, // 1 录音 2 录音中 3 录音结束 4 播放中
				audioFile: '', // 录音文件
				runTime: 0, // 音频时间
				audioTime: 0, //音频播放时间
				timer: 0, // 定时器,
				alarmId: '', //告警id
			}
		},
		computed: {
			filterTimeText() {
				return this.$utils.countTime(this.runTime)
			},
			audioTimeText() {
				return this.$utils.countTime(this.audioTime, "'")
			}
		},
		onLoad(options) {
			let {
				alarmId
			} = options;
			this.alarmId = alarmId
			recorderManager.onStop((res) => {
				console.log('recorder stop' + JSON.stringify(res));
				this.status = 3;
				this.audioFile = res.tempFilePath;
			});

			innerAudioContext.onEnded(() => {
				clearInterval(this.timer);
				this.audioTime = this.runTime;
				this.status = 3;
			})
		},
		destroyed() {
			innerAudioContext.destroy();
		},
		methods: {
			// 开始录音
			startRecord() {
				this.audioFile = '';
				this.runTime = 1;
				this.status = 2;
				this.timer = setInterval(() => {
					this.runTime += 1;
				}, 1000);
				recorderManager.start();
				this.openPopup();
			},
			// 结束录音
			stopRecord() {
				this.closePopup();
				this.audioTime = this.runTime;
				clearInterval(this.timer);
				recorderManager.stop();
			},
			// 播放录音
			playRecord() {
				innerAudioContext.src = this.audioFile;
				innerAudioContext.play();
				this.status = 4;
				this.audioTime = this.runTime
				this.timer = setInterval(() => {
					this.audioTime -= 1;
				}, 1000);
			},
			async saveRecord() {
				let fileRes = await this.$utils.uploadFile(this.audioFile);
				// 上传材料
				let reqData = {
					alarmId: this.alarmId,
					fileName: '',
					fileId: fileRes.fileId,
					type: 3 // 1 图片 2 视频 3 音频 4 其他
				}
				this.$request('/v3/acs/alarm/resource', reqData, 'post').then(res => {
					uni.navigateBack({
						delta: 1
					})
				}).catch(err => {
					console.log(err, '啥啊')
				})

			},
			openPopup() {
				this.$refs.popup.open()
			},
			closePopup() {
				this.$refs.popup.close()
			},
		}
	}
</script>

<style lang="scss" scoped>
	.audio {
		display: flex;
		align-items: flex-end;
		height: 100vh;
		flex-wrap: wrap;
		overflow: hidden;

		.audio-box {
			width: 100vw;
			height: 28vh;

			.audio-content {
				width: 80vw;
				height: 50rpx;
				background: $uni-active-color;
				margin-left: 30rpx;
				display: flex;
				align-items: center;
				padding-left: 20rpx;
				border-radius: 10rpx;
				margin-bottom: 30rpx;
				color: #fff;

				image {
					width: 40rpx;
					height: 40rpx;
					margin-right: 10rpx;
				}
			}

			.audio-btn {
				padding: 30rpx 20rpx 10rpx 20rpx;
			}

			.audio-hand {
				display: flex;
				flex-wrap: wrap;
				justify-content: center;
				height: 10vh;
				align-items: center;
				background-color: #fff;
				padding: 20rpx 0;

				image {
					width: 64rpx;
					height: 64rpx;
				}

				text {
					width: 100vw;
					text-align: center;
				}
			}
		}

		.popup-content {
			width: 240rpx;
			height: 260rpx;
			background: rgba(0, 0, 0, 0.6);
			text-align: center;
			border-radius: 10rpx;
			color: #fff;

			image {
				width: 70rpx;
				height: 70rpx;
				padding: 38rpx;
			}

			text {
				display: block;
				text-align: center;
			}

			.text {
				font-size: 14rpx;
			}
		}
	}
</style>
