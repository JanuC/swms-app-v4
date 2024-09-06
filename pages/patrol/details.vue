<template>
	<view class="content patrol-wrap">
		<view class="list-wrap" v-show="showPage">
			<view class="task-card list-children">
				<view class="list-header">
					<text class="list-number">{{details.planName}}</text>
					<view class="list-status details-status">
						<image v-if="details.status == 0 || details.status == 1" class="status-icon"
							src="/static/status_1.png" mode="scaleToFill"></image>
						<image v-else-if="details.status == 2" class="status-icon" src="/static/status_2.png"
							mode="scaleToFill"></image>
						<image v-else-if="details.status == -1" class="status-icon" src="/static/status_3.png"
							mode="scaleToFill"></image>
						<image v-else-if="details.status == 3" class="status-icon" src="/static/transfer-icon.png"
							mode="scaleToFill"></image>
						<text v-if="details.status == 2" class="list-status__text2">
							已完成
						</text>
						<text v-if="details.status == 0 || details.status == 1" class="list-status__text1">
							未完成
						</text>
						<text v-if="details.status == 3" class="list-status__text1">
							转派中
						</text>
						<text v-if="details.status == -1" class="list-status__text3">
							逾期
						</text>
					</view>
				</view>
				<view class="list-content">
					<view class="list-content__item">
						<text class="list-left_text">开始时间</text>
						<view class="list-right__content">
							<text>{{details.startTime}}</text>
						</view>
					</view>
					<view class="list-content__item">
						<text class="list-left_text">截止时间</text>
						<view class="list-right__content">
							<text>{{details.endTime}}</text>
						</view>
					</view>
					<view class="list-content__item">
						<text class="list-left_text">任务进度</text>
						<view class="list-right__content">
							<view class="progress-bar">
								<view class="progress" :style="{width: (details.finishNum/details.total*100)+'%'}">
								</view>
							</view>
							<text>{{details.finishNum}}/{{details.total}}</text>
						</view>
					</view>
					<view :class="['list-content__item', showCeiling ? 'ceiling-button': '']"
						v-if="details.status == 0 || details.status == 1">
						<view class="scanit-wrap">
							<view class="scanit-button" @click="handleScanCode">
								扫一扫
							</view>
							<view class="scanit-tips">
								<text>温馨提示:可通过读取NFC或扫一扫</text>
							</view>
						</view>
					</view>
				</view>
			</view>
			<view v-show="devices.length" class="point-wrap" :class="[showCeiling?'devices-scroll':'']">
				<navigator
					:url="`/pages/patrol/device-details?taskId=${details.taskId}&id=${item.id}&status=${details.status}`"
					v-for="(item, index) in devices" :key="item.id" class="point-item" hover-class="none">
					<view style="width: 13px;">
						<image v-show="item.status != 0" class="status-icon" src="/static/status_2.png"
							mode="scaleToFill"></image>
						<image v-show="item.status == 0" class="status-icon" src="/static/default.png"
							mode="scaleToFill"></image>
					</view>
					<view class="point-name">
						<text :class="[item.status != 0 ? 'point-finish' : '']">{{item.deviceName|filterPoint}}</text>
						<image class="right-icon" src="/static/my_right.png" mode="scaleToFill"></image>
					</view>
				</navigator>
			</view>
			<view class="footer-wrap" v-if="details.status == 0 && devices.length">
				<view class="button-wrap">
					<button type="primary" @click="handleSubmit" :disabled="disabledSubmit">提交</button>
				</view>
			</view>
		</view>
		<DetailPageLoading v-if="!showPage" />
	</view>
</template>

<script>
	import {
		mapGetters,
		mapMutations
	} from 'vuex';
	import moment from 'moment';
	import syncFunc from '@/utils/dataSync.js';
	import {
		generate_UUID
	} from "@/common/js/uuid.js";
	import NFC from '@/utils/nfc.js';
	import patrol from './patrol.js';
	import DetailPageLoading from '@/components/DetailPageLoading/index.vue';
	export default {
		data() {
			return {
				details: {},
				devices: [],
				items: [],
				nfcNumber: '',
				showCeiling: false,
				id: '',
				showPage: false
			}
		},
		components: {
			DetailPageLoading
		},
		computed: {
			...mapGetters({
				nfc_data: 'app/nfcData',
				getUsers: 'user/getUserInfo',
				getActivationNfc: 'app/getActivationNfc',
				getDeviceInfo: 'app/getDeviceInfo'
			}),
			disabledSubmit() {
				let filterData = this.devices.filter(item => {
					return item.status == 0;
				});
				return filterData.length > 0;
			}
		},
		watch: {
			nfc_data(val) {
				if (this.getActivationNfc) {
					if (this.details.status == 0) {
						if (val) {
							this.nfClock();
						}
					}
				}
			},
			getDeviceInfo(val) {
				this.devices.forEach(item => {
					if (item.id === val.id) item.status = val.status
				})
				this.onTaskProgress();
			}
		},
		async onNavigationBarButtonTap(e) {
			let isNetwork = await this.$utils.monitorNetwork();
			if (isNetwork) {
				if (this.details.status == 0) {
					let isAction = this.items.some(item => {
						return item.localStatus == 0;
					})
					if (isAction) {
						uni.showLoading({
							mask: true,
							title: '数据同步中...'
						})
						await syncFunc.handlePatrolSync().then(res => {
							console.log('巡检任务状态同步结束-----------', res)
						});
						this.getDetails(this.id);
						uni.hideLoading();
						return true;
					} else {
						uni.navigateTo({
							url: `/pages/transfer/redeploy?taskNumber=${this.details.taskNumber}&type=2&taskId=${this.details.taskId}`
						})
					}
				} else {
					this.$utils.toast('该任务不能转派')
				}
			} else {
				this.$utils.toast('无网络不能转派')
			}
		},
		onLoad(option) {
			if (this.nfc_data) {
				this.removeNfcData();
			}
			this.id = option.id;
			this.getDetails(this.id);
			NFC.listenNFCStatus();
		},
		onShow() {
			this.setActivationNfc(true);
		},
		onHide() {
			this.setActivationNfc(false);
		},
		// 监听页面滚动
		onPageScroll(res) {
			this.showCeiling = res.scrollTop > 180 ? true : false;
		},
		onUnload() {
			uni.$off('onTipsPopupConfirm');
		},
		methods: {
			...mapMutations({
				removeNfcData(commit) {
					commit('app/REMOVE_NFC_DATA')
				},
				setPopupId: 'app/SET_POPUP_ID',
				setPopupData: 'app/SET_POPUP_DATA',
				setActivationNfc: 'app/SET_ACTIVATION_NFC',
				setPatrolTask: 'app/SET_PATROL_TASK'
			}),
			// 查询设备详情
			getDetails(id) {
				let selectList = `select * from ipis_patrol_list where taskId="${id}" AND userid="${this.getUsers.id}"`;
				let selectDevices =
					`SELECT deviceName,status,nfcNumber,id,scanCodeStatus FROM ipis_patrol_devices where taskId="${id}" AND userid="${this.getUsers.id}"`;
				this.$db.selectSQL(selectList).then(res => {
					if (res.length > 0) {
						this.details = res[0];
						if (this.details.status == 0) {
							let currentTime = new Date().getTime();
							let deadline = Date.parse(this.details.endTime);
							this.details.status = currentTime < deadline ? this.details.status : -1
						} else {
							let pages = getCurrentPages();
							let page = pages[pages.length - 1];
							// #ifdef APP-PLUS
							let currentWebview = page.$getAppWebview();
							let titleNView = currentWebview.getStyle().titleNView;
							titleNView.buttons = [];
							currentWebview.setStyle({
								titleNView: titleNView
							});
							// #endif
						}
						this.$db.selectSQL(selectDevices).then(async devices => {
							console.log('设备', devices)
							this.devices = devices;
							this.onTaskProgress();
							setTimeout(() => {
								this.showPage = true;
							}, 1000)
						})
					}
				})
			},
			// NFC
			nfClock() {
				if (this.details.status == 0) {
					this.nfcNumber = this.nfc_data.toString();
					let devices = this.devices.filter(item => this.nfcNumber == item.nfcNumber)
					if (devices.length <= 0) {
						let uuid = generate_UUID();
						this.setPopupId(uuid);
						let params = {
							content: '请对目标设备进行扫描二维码或者NFC打卡后，才可完成巡检任务',
							affirmButtonText: '知道了'
						}
						this.setPopupData(params);
						uni.getSubNVueById('task-tips-popup').show('zoom-fade-out', 250);
					} else {
						this.handleNfcResult(this.nfcNumber);
					}
					this.removeNfcData();
				}
				// }
			},
			// 扫码只允许通过相机扫码
			handleScanCode() {
				uni.scanCode({
					onlyFromCamera: true,
					scanType: ['qrCode'],
					success: (res => {
						let devices = this.devices.filter(item => res.result == item.nfcNumber)
						if (devices.length <= 0) {
							let uuid = generate_UUID();
							this.setPopupId(uuid);
							let params = {
								content: '请对目标设备进行扫描二维码或者NFC打卡后，才可完成巡检任务',
								affirmButtonText: '知道了'
							}
							this.setPopupData(params);
							uni.getSubNVueById('task-tips-popup').show('zoom-fade-out', 250);
						} else {
							this.handleNfcResult(res.result);
						}
					})
				});
			},
			// 处理打卡成功结果
			handleNfcResult(nfc) {
				this.$utils.onBeep();
				uni.navigateTo({
					url: `/pages/patrol/device-details?nfc=${nfc}&taskId=${this.details.taskId}&status=${this.details.status}`
				})
			},
			// 提交任务
			async handleSubmit() {
				let currentTime = new Date().getTime();
				let deadline = Date.parse(this.details.endTime);
				if (currentTime < deadline) {
					uni.showLoading({
						title: '任务提交中...',
						mask: true
					})
					let isPerform = this.devices.every(item => {
						return item.status != 0;
					})
					if (isPerform) {
						let isNetwork = await this.$utils.monitorNetwork();
						let params = {
							"id": this.details.taskId, // 巡查任务id
							"type": "1", // 0-巡查 1- 巡检
							"time": moment().format('YYYY-MM-DD HH:mm:ss') // app端提交时间
						}
						this.setPatrolTask({
							id: this.details.taskId,
							status: 2,
							finishNum: this.details.finishNum
						})
						if (isNetwork) {
							await syncFunc.handlePatrolSync();
							console.log(params)
							this.$request(`/v1/inspection/task/stateConfirm`, params, 'POST').then(res => {
								console.log(res)
								// if (res.code == 200) {
									uni.hideLoading()
									this.onshowtipspopup('success')
									let updateTaskSql =
										`UPDATE ipis_patrol_list SET status="2" WHERE taskId="${res.data}" AND userid="${this.getUsers.id}"`;
									this.$db.executeSQL(updateTaskSql);
								// } else {
								// 	uni.hideLoading();
								// 	this.onshowtipspopup('fail');
								// 	console.log('失败1')
								// }
							}).catch(error => {
								uni.hideLoading();
								this.onshowtipspopup('fail');
								console.log('失败2', error)
							})
						} else {
							let uuid = generate_UUID();
							let insertSQL =
								`REPLACE INTO ipis_task values("${uuid}","${params.id}", "${params.type}", "${params.time}", "${this.getUsers.id}")`;
							this.$db.executeSQL(insertSQL);
							uni.hideLoading();
							this.onshowtipspopup('fail');
							console.log('失败3')
						}
						let updateTaskSql =
							`UPDATE ipis_patrol_list SET status="2" WHERE taskId="${params.id}" AND userid="${this.getUsers.id}"`;
						this.$db.executeSQL(updateTaskSql);
					} else {
						this.$utils.toast('任务未完成不能提交!');
					}
				} else {
					let updateTaskSql =
						`UPDATE ipis_patrol_list SET status="-1" WHERE taskId="${this.details.taskId}" AND userid="${this.getUsers.id}"`;
					this.$db.executeSQL(updateTaskSql);
					this.$utils.toast('任务已逾期，无法提交!')
				}
			},
			onshowtipspopup(type) {
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
				uni.getSubNVueById('task-tips-popup').show('zoom-fade-out', 250);
			},
			// 更新任务进度
			async onTaskProgress() {
				console.log('更新任务进度')
				let filterData = this.devices.filter(item => {
					return item.status != 0;
				})
				this.details.finishNum = filterData.length;
				this.setPatrolTask({
					id: this.details.taskId,
					status: this.details.status,
					finishNum: this.details.finishNum
				})
				let updateTaskSql =
					`UPDATE ipis_patrol_list SET finishNum="${this.details.finishNum}" WHERE id="${this.details.id}" AND userid="${this.getUsers.id}"`;
				await this.$db.executeSQL(updateTaskSql);
			}
		}
	}
</script>

<style lang="scss">
	.patrol-wrap {
		overflow: hidden;
		height: 100%;
		background-color: #F5F5F5;

		.list-wrap {
			margin-top: 12px;

			.list-left_type {
				letter-spacing: 30px;
			}
		}
	}

	.task-card {
		margin-top: 12px;
	}
</style>
