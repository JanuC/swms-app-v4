<!-- 静默告警 -->
<template>
	<view class="warning-wrap">
		<view class="footer-wrap">
			<!-- 	
			<button @tap="playVoice">播放录音</button>
			<button class="button-style" type="default" @click="videoCapture">打开摄像头</button>
			<button class="button-style" type="default">关闭</button> -->
			<button class="button-style" type="default" @click="startRecord">开始录音</button>
			<button class="button-style" type="default" @click="endRecord">结束录音</button>
			<button type="default" @click="chooseVideo">视频</button>
		</view>
	</view>
</template>

<script>
	// #ifdef APP-PLUS
	import permision from "@/common/js/permission.js"
	// #endif
	const recorder = plus.audio.getRecorder();
	const cmr = plus.camera.getCamera();
	import {
		generate_UUID
	} from "@/common/js/uuid.js";
	import moment from 'moment';
	import {
		mapGetters
	} from 'vuex';
	export default {
		data() {
			return {
				voicePath: '',
				videoPath: '',
				params: {
					"alarmId": generate_UUID(), // APP生成的告警ID, 主要用于告警处理后的消息通知
					"reportTime": "", // 上报时间:由APP成功,避免离线情况上报时间不一致
					"audioFileId": "", //音频文件ID
					"vedioFileId": "", //视频文件ID
					"gps": {
						"userId": "60c3471b8b49d100a2f6a0b2", //人员id
						"macId": "013b80b655d445c5a01ee7917717a549", //设备标识
						"mapLocation": "[11,11]",
						"crossBorder": 1, //是否越界
						"uploadTime": "2021-06-11 00:00:00" // app 自己的时间--上传时间
					}
				}
			};
		},
		computed: {
			...mapGetters({
				getUsers: 'user/getUserInfo'
			})
		},
		onLoad() {
			console.log(plus.runtime.getProperty())
			const {
				deviceId
			} = uni.getSystemInfoSync();
			let gps = {
				"userId": this.getUsers.id, //人员id
				"macId": deviceId, //设备标识
				"mapLocation": "[11,11]",
				"crossBorder": 1, //是否越界
				"uploadTime": moment().format('YYYY-MM-DD HH:mm:ss') // app 自己的时间--上传时间
			}
			uni.getLocation({
				type: 'gcj02',
				success: (res) => {
					let mapLocation = [res.longitude, res.latitude];
					gps.mapLocation = JSON.stringify(mapLocation);
					this.params.gps = gps;
					this.reportWarning();
				},
				complete: (res) => {
					console.log(res)
					let mapLocation = [res.longitude, res.latitude];
					gps.mapLocation = JSON.stringify(mapLocation);
					this.params.gps = gps;
					this.reportWarning();
				}
			});
		},
		methods: {
			// 音视频文件上传
			multimediaUpload(filePath, type) {
				this.$utils.synchrodataFile(filePath, type).then(res => {
					console.log(res)
					if (res.code == 'success') {
						if (type == 2) {
							this.params.audioFileId = res.url;
						} else if (type == 3) {
							this.params.vedioFileId = res.url;
						}
						this.reportWarning();
					}
				})
			},
			// 静默告警上报
			reportWarning() {
				this.params.reportTime = moment().format('YYYY-MM-DD HH:mm:ss');
				console.log(this.params)
				this.$request('/v1/alarms/gps', this.params, 'POST').then(res => {
					console.log(res);
				})
			},
			// 视频采集
			chooseVideo() {
				uni.chooseVideo({
					count: 1,
					sourceType: ['camera', 'album'],
					success: (res) => {
						this.multimediaUpload(res.tempFilePath, 3)
					}
				});
			},
			async startRecord() {
				// #ifdef APP-PLUS
				let status = await this.checkPermission();
				if (status !== 1) {
					return;
				}
				// #endif
				// 获取当前录音设备
				if (recorder == null) {
					console.log("Device not ready!");
					return;
				}
				console.log(recorder)
				recorder.record({
					filename: "_doc/audio/"
				}, (file => {
					console.log("Audio record success!", file);
					this.voicePath = file;
					this.multimediaUpload(file, 2);
				}), (e => {
					console.log("Audio record failed: " + e.message);
				}));
				setTimeout(() => {
					this.endRecord()
				}, 600000)
			},
			endRecord() {
				console.log('录音结束');
				recorder.stop();
			},
			playVoice() {
				console.log('播放录音');
				let p = plus.audio.createPlayer(this.voicePath);
				p.play(function() {
					console.log("Audio play success!");
				}, function(e) {
					console.log("Audio play error: " + e.message);
				});
			},
			videoCapture() {
				// 	// #ifdef APP-PLUS
				//   let wv = plus.webview.create("/pages/warning/video.html", "custom-webview", {
				// 		plusrequire: "none", //禁止远程网页使用plus的API，有些使用mui制作的网页可能会监听plus.key，造成关闭页面混乱，可以通过这种方式禁止
				// 		'uni-app': 'none', //不加载uni-app渲染层框架，避免样式冲突
				// 		top: uni.getSystemInfoSync().statusBarHeight +
				// 			44 //放置在titleNView下方。如果还想在webview上方加个地址栏的什么的，可以继续降低TOP值
				// 	})
				// 	// wv.loadData("./video.html")
				// 	var currentWebview = this.$scope
				// .$getAppWebview(); //此对象相当于html5plus里的plus.webview.currentWebview()。在uni-app里vue页面直接使用plus.webview.currentWebview()无效，非v3编译模式使用this.$mp.page.$getAppWebview()
				// 	currentWebview.append(wv); //一定要append到当前的页面里！！！才能跟随当前页面一起做动画，一起关闭
				// 	setTimeout(function() {
				// 		console.log(wv.getStyle())
				// 	}, 1000); //如果是首页的onload调用时需要延时一下，二级页面无需延时，可直接获取
				// 	// #endif
				let res = cmr.supportedVideoResolutions[0];
				let fmt = cmr.supportedVideoFormats[0];
				console.log("Resolution: " + res + ", Format: " + fmt);
				cmr.startVideoCapture((path => {
					console.log("Capture video success: " + path);
					this.videoPath = path;
				}), (error => {
					console.log("Capture video failed: " + error.message);
				}), {
					resolution: res,
					format: fmt,
					filename: '_doc/video/',
					videoMaximumDuration: 5
				});
			},
			// 停止拍摄
			stopCapture() {
				console.log('停止拍摄');
				cmr.stopVideoCapture();
			},
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
		}
	}
</script>

<style>
	.warning-wrap {
		position: fixed;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
		background-color: rgba(0, 0, 0, .3);
	}

	.footer-wrap {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		display: flex;
		flex-direction: column;
		justify-content: center;
	}

	.button-style {
		width: 100%;
		margin-top: 20px;
	}
</style>
