<template>
	<view class="alarm-info">
		<view class="alarm-info-top">
			<view class="content-title">
				告警信息
			</view>
			<view class="content-box">
				<view class="content-item">
					<text class="content-item--label">告警时间</text>
					<text class="content-item--value">{{filterTime(alarmInfo.verlayTime)}}</text>
				</view>
				<view class="content-item">
					<text class="content-item--label">告警等级</text>
					<text :class="['level'+alarmInfo.level]"
						class="content-item--value">{{filterLevel(alarmInfo.level)}}</text>
				</view>
				<view class="content-item">
					<text class="content-item--label">告警设备</text>
					<text class="content-item--value">{{alarmInfo.name||'—'}}</text>
				</view>
				<view class="content-item">
					<text class="content-item--label">告警位置</text>
					<text class="content-item--value">{{alarmInfo.orgNameFull||'—'}}</text>
				</view>
				<view class="content-item">
					<text class="content-item--label">告警分类</text>
					<text class="content-item--value">{{filterCategory(alarmInfo.category)}}</text>
				</view>
				<view class="content-item">
					<text class="content-item--label">告警内容</text>
					<text class="content-item--value">{{alarmInfo.reason||'—'}}</text>
				</view>
				<view class="content-item">
					<text class="content-item--label">告警图片</text>
					<view class="content-item--image">
						<image :src="fileUrl + alarmInfo.devInfo.typeUrl" mode=""></image>
					</view>
				</view>
			</view>
		</view>

		<view v-if="alarmInfo.status == 3" class="alarm-info-center">
			<view class="content-title">
				处理信息
			</view>
			<view class="content-box">
				<view class="content-item">
					<text class="content-item--label">警情核实</text>
					<text class="content-item--value">{{alarmShapeMap.get(alarmInfo.alarmShape)}}</text>
				</view>
				<view class="content-item">
					<text class="content-item--label">确警时间</text>
					<text class="content-item--value">{{filterLevel(alarmInfo.confirmTime)}}</text>
				</view>
				<view class="content-item">
					<text class="content-item--label">处理方式</text>
					<text class="content-item--value">{{modeMap.get(alarmInfo.mode)}}</text>
				</view>
			</view>
		</view>

		<view class="alarm-info-bottom">
			<view class="content-title">
				警情图片/视频
			</view>
			<view class="content-box">
				<view class="content-item">
					<text class="content-item--label">视频</text>
					<template v-if="videoArr.length">
						<view class="content-item--image" v-for="video in videoTemporaryArr" :key="video">
							<video v-if="video" :src="video"></video>
						</view>
					</template>
					<view v-else class="content-item--image">
						<image class="noData" src="@/static/alarm/icon7.png" mode=""></image>
					</view>
				</view>
				<view class="content-item">
					<text class="content-item--label">音频</text>
					<view class="content-item--image">
						<template v-if="audioArr.length">
							<swiper @change='changeImage' class="swiper" circular :indicator-dots="false"
								:autoplay="false" :interval="2000" :duration="500">
								<swiper-item class="swiper-item" v-for="audio in audioArr" :key="audio">
									<audio :controls="true" :src=" fileUrl+ audio"></audio>
								</swiper-item>
							</swiper>
							<view class="swiper-dot">
								<text>{{currentAudioIndex}}</text> / <text>{{audioArr.length}}</text>
							</view>
						</template>
						<template v-else>
							<image class="noData" src="@/static/alarm/icon10.png" mode=""></image>
						</template>
					</view>

				</view>
				<view class="content-item">
					<text class="content-item--label">图片</text>
					<view class="content-item--image">
						<template v-if='imageArr.length'>
							<swiper @change='changeImage' class="swiper" circular :indicator-dots="false"
								:autoplay="false" :interval="2000" :duration="500">
								<swiper-item @click="prevImage(image)" class="swiper-item" v-for="image in imageArr"
									:key="image">
									<image :src="fileUrl+ image" mode=""></image>
								</swiper-item>
							</swiper>
							<view class="swiper-dot">
								<text>{{currentImgIndex}}</text>/ <text>{{imageArr.length}}</text>
							</view>
						</template>
						<template v-else>
							<image class="noData" src="@/static/alarm/icon9.png" mode=""></image>
						</template>
					</view>
				</view>

			</view>
		</view>

		<view v-if="showBtn" class="alarm-info-footer">
			<view @click="upload('image')">
				<image src="@/static/alarm/icon14.png" mode=""></image>
				<text>图片</text>
			</view>
			<view @click="upload('video')">
				<image src="@/static/alarm/icon11.png" mode=""></image>
				<text>视频</text>
			</view>
			<view @click="upload('audio')">
				<image src="@/static/alarm/icon12.png" mode=""></image>
				<text>音频</text>
			</view>
			<view @click="upload('file')">
				<image src="@/static/alarm/icon13.png" mode=""></image>
				<text>文件</text>
			</view>
		</view>

	</view>
</template>

<script>
	import moment from 'moment';
	import {
		mapGetters
	} from 'vuex'
	export default {
		data() {
			return {
				alarmInfo: {
					"id": "",
					"status": 0,
					"mute": 0,
					"type": 1,
					"reason": "",
					"content": "",
					"shape": 1,
					"devId": "",
					"category": "",
					"level": '',
					"confId": "",
					"linkageDev": "",
					"verlayTime": '',
					"createTime": '',
					"alarmCount": 1,
					"confirmTime": '',
					"overdueTime": '',
					"eta": '',
					"devInfo": {},
					"linkageDevs": [],
					"resources": [],
				},
				alarmShapeMap: new Map([
					[1, '警情'],
					[2, '非警情'],
				]),
				modeMap: new Map([
					[1, '现场处理'],
					[2, '远程核实'],
					[3, '其他处理'],
				]),
				video: '',
				image: '',
				imageArr: [], //图片信息
				currentImgIndex: 1, // 当前索引
				videoArr: [], //视频信息
				videoTemporaryArr: [], //视频临时信息
				audioArr: [], //音频信息
				currentAudioIndex: 1, // 当前索引
			}
		},
		onLoad(options) {
			let {
				id
			} = options;
			this.alarmInfo.id = id;

		},
		onShow() {
			// 延迟200ms 获取上传的材料数据
			setTimeout(() => {
				this.getAlarmResource()
			}, 500)
		},
		computed: {
			...mapGetters({
				fileUrl: 'system/getFileUrl'
			}),
			showBtn() {
				return Boolean(this.alarmInfo.status < 2);
			}
		},
		methods: {
			// 预览图片
			prevImage(img) {
				uni.previewImage({
					urls: this.imageArr.map(item => this.fileUrl + item),
					longPressActions: {
						itemList: ['发送给朋友', '保存图片', '收藏'],
						success: function(data) {
							console.log('选中了第' + (data.tapIndex + 1) + '个按钮,第' + (data.index + 1) + '张图片');
						},
						fail: function(err) {
							console.log(err.errMsg);
						},
						complete() {
							console.log('预览图片')
						}
					}
				});
			},
			// 切换图片
			changeImage(option) {
				this.currentImgIndex = option.detail.current + 1;
			},
			// 切换音频
			changeAudio(option) {
				this.currentAudioIndex = option.detail.current + 1;
			},
			// 处理时间
			filterTime(time) {
				if (!time) return '—'
				return moment(new Date(time)).format('YYYY-MM-DD HH:mm:ss')
			},
			// 处理分类
			filterCategory(val) {
				return this.$store.state.alarm.categoryData[val] || '—';
			},
			// 处理告警等级
			filterLevel(val) {
				return this.$store.state.alarm.levelData[val] || '—';
			},
			// 处理告警状态
			filterStatus(val) {
				return this.$store.state.alarm.statusData[val] || '—';
			},
			// 打开弹窗
			toggle(type) {
				// open 方法传入参数 等同在 uni-popup 组件上绑定 type属性
				this.$refs.popup.open(type)
			},
			clostPopup() {
				this.$refs.popup.close('bottom')
			},
			/**
			 * 上传文件
			 * @param {Object} type image video
			 */
			upload(type) {
				let objFun = {
					image: () => {
						return new Promise((resolve, reject) => {
							uni.chooseImage({
								count: 1,
								extension: ['jpeg', 'png', 'jpg', 'webg'],
								sourceType: ['camera'],
								success(res) {
									console.log(res, '图片信息')
									resolve({
										file: res.tempFilePaths[0],
										type: 1
									})
								},
								fail(err) {
									reject(err)
								}
							})
						})
					},
					video: () => {
						return new Promise((resolve, reject) => {
							uni.chooseVideo({
								sourceType: ['camera'],
								success: (res) => {
									resolve({
										file: res.tempFilePath,
										type: 2
									});
								},
								fail: (err) => {
									console.log('视频选择失败')
								}
							})
						})
					},
					audio: () => {
						return new Promise((resolve, reject) => {
							uni.navigateTo({
								url: '/pages/alarm/audio?alarmId=' + this.alarmInfo.id,
								success() {
									console.log('跳转页面')
									resolve()
								},
								fail(err) {
									console.log('跳转页面', err)
									reject()
								}
							})
						})
					},
					file: () => {
						return new Promise((resolve, reject) => {
							plus.gallery.pick((data) => {
								resolve({
									file: data,
									type: data.endsWith('.mp4') ? 2 : 1
								})
							}, (err) => {
								console.log(err)
								reject()
							}, {
								filter: 'none',
								maximum: 1,
								permissionAlert: true,
							});
						})
					}
				}
				objFun[type]().then(async res => {
					if (type == 'audio') return;

					let fileRes = await this.$utils.uploadFile(res.file);
					// 上传材料
					let reqData = {
						alarmId: this.alarmInfo.id,
						fileName: '',
						fileId: fileRes.fileId,
						type: res.type // 1 图片 2 视频 3 音频 4 其他
					}

					this.$request('/v3/acs/alarm/resource', reqData, 'post').then(res => {
						this.$utils.toast('材料上传成功');
						this.getAlarmResource();
					}).catch(err => {
						console.log(err, '材料上传失败')
					})

				}).catch(err => {
					console.log(err);
					this.$utils.toast('选择文件失败');
				})
			},

			/**
			 * 获取告警材料
			 */
			getAlarmResource() {
				// this.imageArr = [];
				// this.videoArr = [];
				// this.audioArr = [];
				this.$request('/v3/acs/alarm/' + this.alarmInfo.id).then(res => {
					this.alarmInfo = res.data.data;
					this.alarmInfo.name = this.alarmInfo.devInfo.name;
					this.alarmInfo.orgNameFull = this.alarmInfo.devInfo.orgNameFull;
					this.alarmInfo.resources && this.alarmInfo.resources.map(async (item) => {
						// 1 图片 2 视频 3 音频 4 其他
						if (item.type == 1 && !this.imageArr.includes(item.url)) {
							this.imageArr.push(item.url)
						}
						if (item.type == 2 && !this.videoArr.includes(item.url)) {
							let videoUrl = await new Promise((resolve, reject) => {
								uni.downloadFile({
									url: this.fileUrl + item.url,
									success: (res) => {
										if (res.statusCode === 200) {
											resolve(res.tempFilePath)
										} else {
											reject()
										}
									},
									fail() {
										reject()
									}
								})
							})
							this.videoTemporaryArr.push(videoUrl);
							this.videoArr.push(item.url)
						}
						if (item.type == 3 && !this.audioArr.includes(item.url)) {
							this.audioArr.push(item.url)
						}
					})
					this.$forceUpdate()
				})
			}

		}
	}
</script>

<style lang="scss" scoped>
	.alarm-info {
		padding: 20rpx 30rpx;

		>view {
			background-color: #ffffff;
			border-radius: 16rpx;
			margin-bottom: 20rpx;
			padding: 30rpx 30rpx 16rpx 30rpx;
		}

		.alarm-info-footer {
			padding-bottom: 30rpx;
			display: flex;
			justify-content: space-between;


			image {
				width: 50rpx;
				height: 50rpx;
				display: block;
				margin: auto;
				margin-bottom: 8rpx;

			}
		}


		.content-title {
			font-family: PingFang-SC-Bold;
			font-size: 28rpx;
			font-weight: normal;
			font-stretch: normal;
			line-height: 35.79rpx;
			letter-spacing: 0rpx;
			color: #333333;
			margin-bottom: 50rpx;
		}

		.content-item {
			display: flex;
			margin-bottom: 20rpx;
			flex-wrap: wrap;

			.content-item--label {
				font-family: PingFang-SC-Medium;
				font-size: 28rpx;
				font-weight: normal;
				font-stretch: normal;
				line-height: 35.79rpx;
				letter-spacing: 0rpx;
				color: #999999;
				margin-right: 30rpx;
			}

			.content-item--value {
				font-family: PingFang-SC-Medium;
				font-size: 28rpx;
				font-weight: normal;
				font-stretch: normal;
				line-height: 35.79rpx;
				letter-spacing: 0rpx;
				color: #333333;
			}

			.content-item--image {
				background-color: #eeeeee;
				width: 100%;
				height: 354rpx;
				display: flex;
				justify-content: center;
				align-items: center;
				margin-top: 20rpx;
				position: relative;

				.swiper-dot {
					position: absolute;
					left: 0;
					bottom: 0;
					background: rgba(0, 0, 0, 0.5);
					width: 66rpx;
					height: 38rpx;
					border-radius: 0rpx 20rpx 0rpx 0rpx;
					color: #ffffff;
					font-family: PingFang-SC-Medium;
					font-size: 24rpx;
					font-weight: normal;
					font-stretch: normal;
					line-height: 35.79rpx;
					letter-spacing: 0rpx;
					color: #ffffff;
					z-index: 10;
					text-indent: 10rpx;
				}

				video {
					width: 100%;
					height: 100%;
				}

				>image {
					max-width: 80%;
					max-height: 80%;
				}

				.noData {
					max-height: 21%;
					max-width: 40%;
				}

				/deep/uni-audio {
					width: 80%;

					.uni-audio-default {
						width: 100% !important;
						min-width: auto !important;
					}
				}

				.swiper {
					width: 100%;
					height: 100%;
				}

				.swiper-item {
					height: 100%;
					width: 100%;
					display: flex;
					justify-content: center;
					align-items: center;
				}

				.swiper-list {
					margin-top: 40rpx;
					margin-bottom: 0;
				}
			}
		}

		.popup-content {
			background-color: #eee;

			.popup-content-item {
				height: 114rpx;
				text-align: center;
				line-height: 114rpx;
				background: #ffffff;
				font-family: PingFang-SC-Medium;
				font-size: 28rpx;
				font-weight: normal;
				font-stretch: normal;
				letter-spacing: 0rpx;
				color: #333333;
			}

			.popup-content-item:first-child,
			.popup-content-item:nth-child(2) {
				margin-bottom: 2rpx;
			}

			.popup-content-item:last-child {
				height: 166rpx;
				margin-top: 10rpx;
				font-size: 28rpx;
				font-weight: normal;
				font-stretch: normal;
				letter-spacing: 0rpx;
				color: #f33649;
			}
		}
	}
</style>
