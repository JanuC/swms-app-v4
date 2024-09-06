<template>
	<view class="content patrol-wrap">
		<view class="list-wrap" v-show="showPage">
			<view class="list-children">
				<view class="list-header">
					<text class="list-number">{{details.name}}</text>
					<view class="list-status details-status">
						<image v-if="details.status == 0" class="status-icon" src="/static/status_1.png"
							mode="scaleToFill"></image>
						<image v-else-if="details.status == 2" class="status-icon" src="/static/status_2.png"
							mode="scaleToFill"></image>
						<image v-else-if="details.status == -1" class="status-icon" src="/static/status_3.png"
							mode="scaleToFill"></image>
						<image v-else-if="details.status == 3" class="status-icon" src="/static/transfer-icon.png"
							mode="scaleToFill"></image>
						<text v-if="details.status == 2" class="list-status__text2">
							已完成
						</text>
						<text v-if="details.status == 0" class="list-status__text1">
							未完成
						</text>
						<text v-if="details.status == 3" class="list-status__text4">
							转派中
						</text>
						<text v-if="details.status == -1" class="list-status__text3">
							逾期
						</text>
					</view>
				</view>
				<view class="list-content">
					<view class="list-content__item">
						<text class="list-left_text list-left_type">类<text class="letter-spacing__0">型</text></text>
						<view class="list-right__content">
							<text>{{details.type == '0' ? '无序巡查' : '有序巡查'}}</text>
						</view>
					</view>
					<view class="list-content__item">
						<text class="list-left_text list-left_type">拍<text class="letter-spacing__0">照</text></text>
						<view class="list-right__content">
							<text>{{details.takePhotos == '0' ? '否' : '是'}}</text>
						</view>
					</view>
					<view class="list-content__item align-items__end">
						<text class="list-left_text">限制班次</text>
						<view class="list-right__content list-right__tabs">
							<text class="list-tabs" v-for="classes in details.frequency"
								:key="classes">{{classes}}</text>
							<text v-if="details.frequency&&!details.frequency.length">无</text>
						</view>
					</view>
					<view class="list-content__item">
						<text class="list-left_text">开始时间</text>
						<view class="list-right__content">
							<text>{{details.createTime}}</text>
						</view>
					</view>
					<view class="list-content__item">
						<text class="list-left_text">截止时间</text>
						<view class="list-right__content">
							<text>{{details.deadline}}</text>
						</view>
					</view>
					<view class="list-content__item">
						<text class="list-left_text">任务进度</text>
						<view class="list-right__content">
							<view class="progress-bar">
								<view class="progress" :style="{width: (details.completed/details.total*100)+'%'}">
								</view>
							</view>
							<text>{{details.completed}}/{{details.total}}</text>
						</view>
					</view>
					<view :class="['list-content__item', showCeiling ? 'ceiling-button': '']"
						v-if="details.status == 0">
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
			<view v-show="points.length" class="point-wrap" :class="[showCeiling?'devices-scroll':'']">
				<view v-for="(item, index) in points" :key="item.id" class="point-item"
					@click="onJumpPoint(item.id, index)">
					<view style="width: 13px;">
						<image v-show="item.status != 0" class="status-icon" src="/static/status_2.png"
							mode="scaleToFill"></image>
						<image v-show="item.status == 0" class="status-icon" src="/static/default.png"
							mode="scaleToFill"></image>
					</view>
					<view class="point-name">
						<text :class="[item.status != 0 ? 'point-finish' : '']">{{item.name|filterPoint}}</text>
						<image class="right-icon" src="/static/my_right.png" mode="scaleToFill"></image>
					</view>
				</view>
			</view>
			<view class="footer-wrap" v-if="details.status == 0">
				<view class="button-wrap">
					<button type="primary" :disabled="disabledSubmit" @click="handleSubmit">提交</button>
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
	import NFC from '@/utils/nfc.js';
	import syncFunc from '@/utils/dataSync.js';
	import {
		generate_UUID
	} from "@/common/js/uuid.js";
	import DetailPageLoading from '@/components/DetailPageLoading/index.vue';
	export default {
		data() {
			return {
				id: '',
				details: {},
				points: [], // 点位数据
				nfcNumber: '',
				context: null,
				showCeiling: false,
				showPage: false
			}
		},
		components: {
			DetailPageLoading
		},
		computed: {
			...mapGetters({
				nfc_data: 'app/nfcData',
				netWork: 'app/getNetWork',
				getUsers: 'user/getUserInfo',
				getInspectionActivationNfc: 'app/getInspectionActivationNfc',
				getPointInfo: 'app/getPointInfo'
			}),
			disabledSubmit() {
				let filterData = this.points.filter(item => {
					return item.status == 0;
				});
				return filterData.length > 0;
			}
		},
		watch: {
			nfc_data(val) {
				if (this.getInspectionActivationNfc) {
					if (this.details.status == 0) {
						if (val) {
							this.nfClock();
						}
					}
				}
			},
			getPointInfo(val) {
				this.points.forEach(item => {
					if (item.id === val.id) item.status = val.status
				})
				this.onTaskProgress();
			}
		},
		async onNavigationBarButtonTap(e) {
			let isNetwork = await this.$utils.monitorNetwork();
			if (isNetwork) {
				if (this.details.status == 0) {
					let isAction = this.points.some(item => {
						return item.localStatus == 0
					})
					if (isAction) {
						uni.showLoading({
							mask: true,
							title: '数据同步中...'
						})
						await syncFunc.handleInspectionSync().then(res => {
							console.log('巡查任务状态同步结束', res)
						});
						this.getDetails(this.id);
						uni.hideLoading();
						return true;
					} else {
						uni.navigateTo({
							url: `/pages/transfer/redeploy?taskNumber=${this.details.taskNumber}&type=1&taskId=${this.details.taskId}`
						})
					}
				} else {
					this.$utils.toast('该任务不能转派');
					return true;
				}
			} else {
				this.$utils.toast('无网络不能转派');
				return true;
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
			this.setInspectionActivationNfc(true);
		},
		onHide() {
			this.setInspectionActivationNfc(false);
		},
		// 监听页面滚动
		onPageScroll(res) {
			let obj = uni.createSelectorQuery().select('.patrol-wrap');
			obj.boundingClientRect((data) => {
				let height = data.height + 31;
				if (height > 900) {
					this.showCeiling = res.scrollTop > 180 ? true : false;
				}
			}).exec();
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
				setInspectionTask: 'app/SET_INSPECTION_TASK',
				setInspectionActivationNfc: 'app/SET_INSPECTION_ACTIVATION_NFC'
			}),
			// 查询详情
			getDetails(id) {
				let selectList =
					`select * from ipis_inspection_list where taskId="${id}" AND userid="${this.getUsers.id}"`;
				let selectPoint =
					`select * from ipis_inspection_locations where taskId="${id}" AND userid="${this.getUsers.id}" ORDER BY weight ASC`;
				this.$db.selectSQL(selectList).then(res => {
					if (res.length > 0) {
						this.details = res[0];
						this.details.frequency = JSON.parse(this.details.frequency);
						console.log('巡查详情', res)
						if (this.details.status == 0) {
							let currentTime = new Date().getTime();
							let deadline = Date.parse(this.details.deadline);
							this.details.status = currentTime < deadline ? this.details.status : -1;
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
						this.$db.selectSQL(selectPoint).then(points => {
							this.points = points;
							setTimeout(() => {
								this.showPage = true;
							}, 1000)
						})
					}
				})
			},
			// NFC打卡
			async nfClock() {
				if (this.details.status == 0) {
					this.$utils.onBeep();
					this.nfcNumber = this.nfc_data.toString();
					let nfcData = this.points.map(item => {
						return item.nfc
					})
					let index = nfcData.indexOf(this.nfcNumber);
					if (index >= 0) {
						let frequency = this.details.frequency;
						let type = this.details.type;
						let weight = this.points[index].weight;
						let status = index == 0 ? 1 : this.points[index - 1].status;
						let mapType = typeof this.points[index].map;
						this.points[index].map = mapType == 'string' ? JSON.parse(this.points[index].map) : this
							.points[index].map;
						let isCard = await syncFunc.isPunchcard(frequency, type, weight, status,
							'inspection-tips-popup');
						if (this.nfcNumber == nfcData[index]) {
							if (isCard) {
								if (this.details.takePhotos == 1) {
									this.handlePhotos(index);
								} else {
									this.points[index].status = 1;
									this.points[index].sitePhotos = [];
									this.points[index].incompleteReason = "";
									if (this.points[index].localFilePath != '') {
										uni.removeSavedFile({
											filePath: this.points[index].localFilePath,
											complete: (res) => {
												this.points[index]
													.localFilePath = "";
												this.points[index]
													.fileStatus = -1;
											}
										});
									}
									await syncFunc.handleInspectionPoint(this.points[index]);
									await syncFunc.handleInspectionPoint(this.points[index]).then(
									() => {
										let filterData = this.points.filter(item => {
											return item.status != 0;
										});
										this.details.completed = filterData.length;
									}).catch(() => {
										this.points[index].status = 0
									});
								}
							}
						} else {
							let uuid = generate_UUID();
							this.setPopupId(uuid);
							let params = {
								content: '巡查点信息错误或者NFC卡无效,请检查巡查点信息',
								affirmButtonText: '知道了'
							}
							this.setPopupData(params);
							uni.getSubNVueById('inspection-tips-popup').show('zoom-fade-out', 250);
						}
						// this.removeNfcData();
					} else {
						let uuid = generate_UUID();
						this.setPopupId(uuid);
						let params = {
							content: 'NFC卡无效,请检查巡查点信息',
							affirmButtonText: '知道了'
						}
						this.setPopupData(params);
						uni.getSubNVueById('inspection-tips-popup').show('zoom-fade-out', 250);
						// this.removeNfcData();
					}
					this.removeNfcData();
				}
			},
			// 扫码打卡
			async handleScanCode() {
				uni.scanCode({
					onlyFromCamera: true,
					scanType: ['qrCode'],
					success: (async res => {
						let filterPoint = this.points.find(item => item.nfc == res.result);
						let index = this.points.findIndex(item => item.nfc == res.result)
						if (index > -1) {
							let frequency = this.details.frequency;
							let type = this.details.type;
							let weight = this.points[index].weight;
							let status = index == 0 ? 1 : this.points[index - 1].status;
							let mapType = typeof this.points[index].map;
							this.points[index].map = mapType == 'string' ? JSON.parse(this.points[
									index].map) : this
								.points[index].map;
							let isCard = await syncFunc.isPunchcard(frequency, type, weight,
								status, 'inspection-tips-popup');
							if (isCard) {
								if (this.details.takePhotos == 1) {
									this.handlePhotos(index);
								} else {
									this.points[index].status = 1;
									this.points[index].sitePhotos = [];
									this.points[index].incompleteReason = "";
									if (this.points[index].localFilePath != '') {
										uni.removeSavedFile({
											filePath: this.points[index]
												.localFilePath,
											complete: (res) => {
												this.points[index]
													.localFilePath = "";
												this.points[index]
													.fileStatus = -1;
											}
										});
									}
									await syncFunc.handleInspectionPoint(this.points[index]).then(
										() => {
											let filterData = this.points.filter(item => {
												return item.status != 0;
											});
											this.details.completed = filterData.length;
										}).catch(() => {
										this.points[index].status = 0
									});
								}
								this.$utils.onBeep();
							}
						} else {
							let uuid = generate_UUID();
							this.setPopupId(uuid);
							let params = {
								content: '巡查点信息错误,请检查巡查点信息',
								affirmButtonText: '知道了'
							}
							this.setPopupData(params);
							uni.getSubNVueById('inspection-tips-popup').show('zoom-fade-out', 250);
						}
					})
				});
			},
			// 提交任务
			async handleSubmit() {
				// 过滤未打卡数据
				let currentTime = new Date().getTime();
				let deadline = Date.parse(this.details.deadline);
				if (currentTime < deadline) {
					let filterData = this.points.filter(item => {
						return item.status == 0;
					});
					if (filterData.length <= 0) {
						uni.showLoading({
							title: '任务提交中...',
							mask: true
						});
						let isNetwork = await this.$utils.monitorNetwork();
						let params = {
							"id": this.details.taskId, // 巡查任务id
							"type": "0", // 0-巡查 1- 巡检
							"time": moment().format('YYYY-MM-DD HH:mm:ss') // app端提交时间
						}
						this.setInspectionTask({
							id: this.details.taskId,
							status: 2,
							completed: this.details.completed
						})
						if (isNetwork) {
							this.$request(`/v1/inspection/task/stateConfirm`, params, 'POST').then(res => {
								// if (res.code == 200) {
								uni.hideLoading()
								this.onShowTipsPopup('success')
								let updateTaskSql =
									`UPDATE ipis_inspection_list SET status="2" WHERE taskId="${res.data}" AND userid="${this.getUsers.id}"`;
								this.$db.executeSQL(updateTaskSql);
								// } else {
								// 	console.log('任务提交失败!')
								// 	uni.hideLoading();
								// 	this.onShowTipsPopup('fail');
								// }
							}).catch(error => {
								console.log(error)
								console.log('任务提交失败2!')
								let uuid = generate_UUID();
								let insertSQL =
									`REPLACE INTO ipis_task values("${uuid}","${params.id}", "${params.type}", "${params.time}", "${this.getUsers.id}")`;
								this.$db.executeSQL(insertSQL);
								uni.hideLoading();
								this.onShowTipsPopup('fail');
							})
						} else {
							let uuid = generate_UUID();
							let insertSQL =
								`REPLACE INTO ipis_task values("${uuid}","${params.id}", "${params.type}", "${params.time}", "${this.getUsers.id}")`;
							this.$db.executeSQL(insertSQL);
							uni.hideLoading();
							console.log('任务提交失败3!')
							this.onShowTipsPopup('fail');
						}
						let updateTaskSql =
							`UPDATE ipis_inspection_list SET status="2" WHERE taskId="${params.id}" AND userid="${this.getUsers.id}"`;
						this.$db.executeSQL(updateTaskSql);
					} else {
						this.$utils.toast('有巡查点未打卡，无法提交!')
					}
				} else {
					let updateTaskSql =
						`UPDATE ipis_inspection_list SET status="-1" WHERE taskId="${this.details.taskId}" AND userid="${this.getUsers.id}"`;
					this.$db.executeSQL(updateTaskSql);
					this.$utils.toast('任务已逾期，无法提交!')
				}
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
				uni.getSubNVueById('inspection-tips-popup').show('zoom-fade-out', 250);
			},
			async handlePhotos(index) {
				uni.chooseImage({
					count: 1,
					sizeType: ['compressed'],
					sourceType: ['camera'],
					success: (res => {
						let tempFilePaths = res.tempFilePaths[0]
						uni.saveFile({
							tempFilePath: tempFilePaths,
							success: (async res => {
								let savedFilePath = res.savedFilePath;
								this.points[index].localFilePath = savedFilePath;
								this.points[index].status = 1;
								this.points[index].fileStatus = 0;
								this.points[index].sitePhotos = [];
								this.points[index].incompleteReason = "";
								await syncFunc.handleInspectionPoint(this.points[
									index]).then(
									() => {
										let filterData = this.points.filter(
											item => {
												return item.status != 0;
											});
										this.details.completed = filterData
											.length;
									}).catch(() => {
									this.points[index].status = 0
								});
							})
						});
					})
				});
			},
			onJumpPoint(id, index) {
				let previousStatus = index > 0 ? this.points[index - 1].status : 1;
				let frequency = this.details.frequency.join();
				uni.navigateTo({
					url: `/pages/inspection/pointDetails?id=${id}&status=${this.details.status}&completed=${this.details.completed}&frequency=${frequency}&type=${this.details.type}&previousStatus=${previousStatus}&takePhotos=${this.details.takePhotos}&taskId=${this.details.taskId}`
				})
			},
			// 更新任务进度
			async onTaskProgress() {
				console.log('更新任务进度')
				let filterData = this.points.filter(item => {
					return item.status != 0;
				});
				this.details.completed = filterData.length;
				this.setInspectionTask({
					id: this.details.taskId,
					status: this.details.status,
					completed: this.details.completed
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
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
</style>