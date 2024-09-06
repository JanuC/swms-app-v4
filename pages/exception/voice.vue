<template>
	<view class="ipis-mask">
		<view class="popup-warp">
			<view class="popup-body">
				<view class="popup-title">
					语音描述
				</view>
				<view v-if="audioPath == ''" class="popup-content">
					<block v-if="!recording && !playing && !hasRecord">
						<view class="page-body-time">
							<text class="time-big">{{formatedRecordTime}}</text>
						</view>
						<view class="page-body-buttons">
							<view class="page-body-button"></view>
							<view class="page-body-button record-button" @click="startRecord">
								<view class="button-play-record"></view>
							</view>
							<view class="page-body-button"></view>
						</view>
					</block>
					<block v-if="recording === true">
						<view class="page-body-time">
							<text class="time-big">{{formatedRecordTime}}</text>
						</view>
						<view class="page-body-buttons">
							<view class="page-body-button"></view>
							<view class="page-body-button record-button" @click="stopRecord">
								<view class="button-stop-record"></view>
							</view>
							<view class="page-body-button"></view>
						</view>
					</block>
					<block v-if="hasRecord === true && playing === false">
						<view class="page-body-time">
							<text class="time-big">{{formatedPlayTime}}</text>
							<text class="time-small">{{formatedRecordTime}}</text>
						</view>
						<view class="page-body-buttons">
							<view class="page-body-button" @click="playVoice">
								<image src="@/static/play.png" mode="heightFix"></image>
							</view>
							<view class="page-body-button" @click="clear">
								<image src="@/static/trash.png" mode="heightFix"></image>
							</view>
						</view>
					</block>
					<block v-if="hasRecord === true && playing === true">
						<view class="page-body-time">
							<text class="time-big">{{formatedPlayTime}}</text>
							<text class="time-small">{{formatedRecordTime}}</text>
						</view>
						<view class="page-body-buttons">
							<view class="page-body-button" @click="stopVoice">
								<image src="@/static/stop.png" mode="heightFix"></image>
							</view>
							<view class="page-body-button" @click="clear">
								<image src="@/static/trash.png" mode="heightFix"></image>
							</view>
						</view>
					</block>
				</view>

				<view v-if="audioPath !== ''" class="popup-content">
					<text>当前已有录音文件，是否重新录制</text>
				</view>

				<view class="popup-footer">
					<view class="button-wrapper cancel-button-wrapper" @click="onClose">
						<text class="popup-footer__button cancel-button">取消</text>
					</view>
					<view class="button-wrapper affirm-button-wrapper" @click="onConfirm">
						<text class="popup-footer__button affirm-button">确认</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	// #ifdef APP-PLUS
	import permision from "@/common/js/permission.js";
	// #endif
	import * as util from '@/common/js/util.js';
	let playTimeInterval = null;
	let recordTimeInterval = null;
	let recorderManager = null;
	let music = null;
	import {
		mapGetters
	} from 'vuex';
	export default {
		data() {
			return {
				recording: false, // 录音中
				playing: false, // 播放中
				hasRecord: false, // 是否有了一个
				tempFilePath: '',
				recordTime: 0,
				playTime: 0,
				formatedRecordTime: '00:00:00', // 录音的总时间
				formatedPlayTime: '00:00:00', // 播放录音的当前时间
				wavesurfer: null,
				audioPath: ''
			};
		},
		computed: {
			...mapGetters({
				isWarning: 'app/getWarning',
			})
		},
		watch: {
			isWarning(val) {
				console.log(val)
				if (val) {
					this.stopRecord();
				}
			}
		},
		onUnload: function() {
			this.end();
		},
		onLoad: function(e) {
			this.audioPath = e.audioPath;
			music = uni.createInnerAudioContext();
			music.onEnded(() => {
				clearInterval(playTimeInterval)
				var playTime = 0
				console.log('play voice finished')
				this.playing = false;
				this.formatedPlayTime = util.formatTime(playTime);
				this.playTime = playTime;
			});
			recorderManager = uni.getRecorderManager();
			recorderManager.onStart((res) => {
				console.log('recorder start', res);
				this.recording = true;
				recordTimeInterval = setInterval(() => {
					if (this.recordTime >= 60) {
						clearInterval(recordTimeInterval)
						recordTimeInterval = 0
					}
					this.recordTime += 1;
					this.formatedRecordTime = util.formatTime(this.recordTime);
				}, 1000)
			});
			recorderManager.onStop((res) => {
				console.log(this.recordTime, '时间')
				if (this.recordTime > 0) {
					console.log('on stop', res);
					music.src = res.tempFilePath;
					this.hasRecord = true;
					this.recording = false;
					clearInterval(recordTimeInterval)
				}
			});
			recorderManager.onError(() => {
				console.log('recorder onError');
			});

			// 进入页面开始录音
			this.startRecord();
		},
		methods: {
			onClose() {
				if (this.audioPath == '') {
					uni.$emit('onMusicSrc', {
						src: '',
						time: 0
					});
					uni.$off('onMusicSrc');
				}
				uni.navigateBack();
			},
			onConfirm() {
				if (this.audioPath !== '') {
					this.audioPath = ''
				} else {
					if (music.src) {
						console.log(music.src)
						uni.$emit('onMusicSrc', {
							src: music.src,
							time: this.recordTime
						});
						uni.$off('onMusicSrc');
						uni.navigateBack()
					} else {
						this.$utils.toast('录音未开始或未结束!')
					}
				}

			},
			async startRecord() { //开始录音
				// #ifdef APP-PLUS
				let status = await this.checkPermission();
				if (status !== 1) {
					return;
				}
				// #endif
				// TODO ios 在没有请求过权限之前无法得知是否有相关权限，这种状态下需要直接调用录音，但没有状态或回调判断用户拒绝
				recorderManager.start({
					format: 'mp3'
				});
			},
			// 停止录音
			stopRecord() {
				console.log('停止录音')
				if (this.recordTime == 0) {
					this.$utils.toast('录音时间太短!');
					this.recording = false;
					this.hasRecord = false;
					this.playing = false;
					this.hasRecord = false;
				}
				recorderManager.stop();
				clearInterval(recordTimeInterval);
			},
			playVoice() {
				console.log('play voice');
				this.playing = true;
				playTimeInterval = setInterval(() => {
					this.playTime += 1;
					this.formatedPlayTime = util.formatTime(this.playTime);
				}, 1000)
				music.play();
			},
			stopVoice() {
				console.log('停止播放')
				clearInterval(playTimeInterval)
				this.playing = false;
				this.formatedPlayTime = util.formatTime(0);
				this.playTime = 0;
				music.stop();
			},
			end() {
				music.stop();
				recorderManager.stop();
				clearInterval(recordTimeInterval)
				clearInterval(playTimeInterval);
				this.recording = false, this.playing = false, this.hasRecord = false;
				this.playTime = 0, this.recordTime = 0;
				this.formatedRecordTime = "00:00:00", this.formatedRecordTime = "00:00:00";
			},
			clear() {
				this.end();
				music.src = null;
			}
			// #ifdef APP-PLUS
			,
			async checkPermission() {
				let status = permision.isIOS ? await permision.requestIOS('record') :
					await permision.requestAndroid('android.permission.RECORD_AUDIO');

				if (status === null || status === 1) {
					status = 1;
				} else if (status === 2) {
					uni.showModal({
						content: "系统麦克风已关闭",
						confirmText: "确定",
						showCancel: false,
						success: function(res) {}
					})
				} else {
					uni.showModal({
						content: "需要麦克风权限",
						confirmText: "设置",
						success: function(res) {
							if (res.confirm) {
								permision.gotoAppSetting();
							}
						}
					})
				}
				return status;
			}
			// #endif
		}
	}
</script>

<style>
	page {
		background: transparent;
	}

	.ipis-mask {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 9999;
		background-color: rgba(0, 0, 0, 0.4);
	}

	.popup-warp {
		position: absolute;
		left: 25px;
		right: 25px;
		top: 50%;
		transform: translate(0, -50%);
	}

	.popup-body {
		width: 100%;
		border-radius: 16rpx;
		background-color: #FFFFFF;
	}

	.popup-title {
		text-align: center;
		font-size: 19px;
		padding: 18px;
		color: #333333;
		border-bottom: 1rpx solid #e5e5e5;
	}

	.popup-content {
		text-align: center;
		line-height: 24px;
		font-size: 17px;
		padding: 20px;
		color: #333333;
	}

	.popup-footer {
		height: 59px;
		line-height: 59px;
		border-top: 1rpx solid #e5e5e5;
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
	}

	.affirm-button {
		color: #9E4A63;
	}

	.cancel-button {
		color: #666666;
	}

	.button-wrapper {
		flex: 1;
		height: 59px;
		align-items: center;
		justify-content: center;
		text-align: center;
	}

	.cancel-button-wrapper {
		border-right: 1rpx solid #e5e5e5;
	}

	/***/
	image {
		height: 35px;
	}

	.page-body-wrapper {
		justify-content: space-between;
		flex-grow: 1;
		margin-bottom: 300rpx;
	}

	.page-body-time {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.time-big {
		font-size: 30px;
		margin: 10px;
		color: #306dfe;
	}

	.time-small {
		font-size: 17px;
		color: #707070;
	}

	.page-body-buttons {
		margin-top: 60rpx;
		display: flex;
		justify-content: space-around;
	}

	.page-body-button {
		/* 	width: 120px;
		text-align: center; */
	}

	.record-button {
		width: 44px;
		height: 44px;
		display: flex;
		align-items: center;
		justify-content: center;
		border: solid 2px #878f8e;
		border-radius: 50%;
	}

	.button-play-record {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		background-color: #fa5151;
	}

	.button-stop-record {
		width: 25px;
		height: 25px;
		background-color: #fa5151;
		border-radius: 4px;
	}
</style>
