<template>
	<view class="content device-devices" :style="{'margin-bottom':pageup+'px'}" id="device-page">
		<view class="device-list" id="device-list" v-show="deviceList.length > 1 && showDevice">
			<view :class="['device-name', item.status!==0?'device-success':'', activeId==item.id?'active-device':'']"
				v-for="item in deviceList" :key="item.id" @click="getDevicedevices(item.id)">
				{{item.deviceName}}
			</view>
		</view>
		<view class="device-content" :style="{'margin-top': marginTop+'px'}">
			<view class="device-info">
				<view class="point-title">
					<view class="point-name">
						<text>{{devices.deviceName}}</text>
					</view>
					<view v-if="taskStatus == 0">
						<view v-if="devices.deviceStatus == 0" class="abnormal-button" @click="devicesNotComplete">
							<text>无法巡检</text>
						</view>
						<view v-else class="abnormal-button" @click="resetDeviceStatus">
							<text>可巡检</text>
						</view>
					</view>
				</view>
				<view class="point-content check-item">
					<view class="point-info__item" v-if="devices.imgs && devices.imgs.length > 0">
						<view class="device-img" v-for="item in devices.imgs">
							<image class="patrol-photo" :src="links.swmsFileInternet + item" mode="scaleToFill"
								@error="onImageError" @click="onPicturePreview(links.swmsFileInternet + item)"
								v-if="!imageText">
							</image>
							<view class="patrol-photo" v-else>{{imageText}}</view>
						</view>
					</view>
					<view class="point-info__item">
						<text class="label">类型：</text>
						<text class="content">{{devices.deviceType}}</text>
					</view>
					<view class="point-info__item">
						<text class="label">NFC：</text>
						<text class="content">{{devices.nfcNumber}}</text>
					</view>
					<view class="point-info__item oint-info__location">
						<view>
							<text class="label">位置：</text>
							<text class="content">{{devices.installLocation}}</text>
						</view>
						<view hover-class="none" v-if="devices.map && devices.map.length>0"
							@click="onJumpMap(devices.map)">
							<image class="map-icon" src="@/static/map_swms.png" mode="heightFix"></image>
						</view>
					</view>
				</view>
			</view>
			<view class="check-item">
				<view v-if="devices.deviceStatus == -1" class="single-item device-abnormal">
					<view class="items-content">
						<view class="form-input">
							<text class="input-label">说明:</text>
							<input type="text" v-model="explain" placeholder-class="input-placeholder" placeholder="请输入"
								:maxlength="150" auto-blur @blur="updateExplain" disabled />
						</view>
						<view class="form-input form-photo">
							<text class="input-label">照片:</text>
							<image v-if="uploadFiles.length<=0" class="patrol-photo" :src="localFilePath"
								mode="scaleToFill" @click="onPicturePreview(localFilePath)">
							</image>
							<image v-else class="patrol-photo" :src="links.preview+uploadFiles[0]" mode="scaleToFill"
								@click="onPicturePreview(links.preview+uploadFiles[0])">
							</image>
						</view>
					</view>
				</view>
				<view v-else>
					<block v-if="items.length>0 && taskStatus==0">
						<view class="single-item" v-for="(item, index) in items" :key="item.id">
							<view class="item-title">
								<text :style="{color:item.status==-1?'#f2b549':''}">{{index+1}}.{{item.name}}</text>
								<image v-if="item.hasSpecs" @click="openStandard(item.specs)" class="status-icon"
									src="@/static/specification_swms.png" mode="widthFix">
								</image>
							</view>
							<view class="items-wrap">
								<block v-if="item.itemsId!=-1">
									<view class="item-select" v-if="devices.scanCodeStatus != 0">
										<block v-if="item.itemType == 7">
											<text class="form-item__label"></text>
											<view :class="['select-button', item.isNormal==3?'active-button':'']"
												@click="onPhotoInspection(index)">
												<text>拍照巡检</text>
											</view>
										</block>
										<block v-else>
											<view :class="['select-button', item.isNormal==1?'active-button':'']"
												@click="handleInspection(1, index)">
												<text>可巡检</text>
											</view>
											<view :class="['select-button', item.isNormal==-1?'active-button':'']"
												@click="handlePhotograph(index)">
												<text>无法巡检</text>
											</view>
										</block>
									</view>
									<view class="item-select disabled-select" v-else>
										<view v-if="item.itemType == 7" class="select-button">
											<text>拍照巡检</text>
										</view>
										<block v-else>
											<view class="select-button">
												<text>可巡检</text>
											</view>
											<view class="select-button">
												<text>无法巡检</text>
											</view>
										</block>
									</view>
								</block>
								<view class="items-content" v-if="item.status == -1">
									<view class="form-input">
										<text class="input-label">说明:</text>
										<input type="text" v-model="item.explain" placeholder-class="input-placeholder"
											disabled placeholder="请输入" :maxlength="150" auto-blur
											@blur="explainUpdate(index)" />
									</view>
									<view class="form-input form-photo">
										<text class="input-label">照片:</text>
										<image v-if="item.fileStatus==0" class="patrol-photo" :src="item.localFilePath"
											mode="scaleToFill" @click="onPicturePreview(item.localFilePath)">
										</image>
										<image v-else class="patrol-photo" :src="links.preview+item.uploadFiles[0]"
											mode="scaleToFill"
											@click="onPicturePreview(links.preview+item.uploadFiles[0])">
										</image>
									</view>
								</view>
								<view v-if="item.itemsId==-1&&item.status!=-1" class="items-content">
									<radio-group @change="radioChange($event, index)"
										class="form-radio form-item__label">
										<label class="radio" v-for="radioValue in item.options" :key="radioValue.id">
											<radio :value="radioValue.id"
												:disabled="devices.scanCodeStatus == 0 || abnormal"
												:checked="radioValue.id === item.res" />
											{{radioValue.optionName}}
										</label>
									</radio-group>
									<view class="form-input">
										<text class="input-label">备注:</text>
										<input type="text" v-model="item.remakes" placeholder-class="input-placeholder"
											placeholder="请输入" auto-blur :disabled="devices.scanCodeStatus == 0"
											:maxlength="150" @blur="verifyInput($event, -1, index)" />
									</view>
								</view>
								<view v-if="item.isNormal!=0 && item.status!=-1" class="items-content">
									<radio-group v-if="item.itemType == 6" @change="radioChange($event, index)"
										class="form-radio form-radio__item form-item__label">
										<label class="radio" v-for="radioValue in item.options" :key="radioValue.id">
											<radio :value="radioValue.id" :disabled="devices.scanCodeStatus == 0"
												:checked="radioValue.id === item.res" />
											{{radioValue.optionName}}
										</label>
									</radio-group>
									<view v-else-if="item.itemType == 7">
										<view class="form-input form-photo">
											<text class="input-label form-item__remark">照片777:</text>
											<image v-if="item.fileStatus==0" class="patrol-photo"
												:src="item.localFilePath" mode="scaleToFill"
												@click="onPicturePreview(item.localFilePath)">
											</image>
											<image v-else class="patrol-photo" :src="links.preview+item.uploadFiles[0]"
												mode="scaleToFill"
												@click="onPicturePreview(links.preview+item.uploadFiles[0])">
											</image>
										</view>
									</view>
									<view v-else class="form-input">
										<text
											class="input-label form-item__label">{{item.itemType != 0?'数值:':'文字:'}}</text>
										<input type="text" v-model="item.res" placeholder-class="input-placeholder"
											:placeholder="`请输入${item.itemType == 0 ? '文字' : (item.itemType == 1 ? '整数' : (item.itemType == 2 ? '0.0' : (item.itemType == 3 ? '0.00' : (item.itemType == 4 ? '0.000' : (item.itemType == 5 ? '0.0000' : '')))))}`"
											auto-blur :disabled="devices.scanCodeStatus == 0"
											:maxlength="item.itemType == 0 ? item.limit : 16"
											@blur="verifyInput($event, item.itemType, index)"
											@keyboardheightchange="onkeyboardheightchange" />
									</view>
									<view class="form-input">
										<text class="input-label form-item__remark">备注:</text>
										<input type="text" v-model="item.remakes" placeholder-class="input-placeholder"
											placeholder="请输入" auto-blur :disabled="devices.scanCodeStatus == 0"
											:maxlength="150" @blur="verifyInput($event, -1, index)"
											@keyboardheightchange="onkeyboardheightchange" />
									</view>
								</view>
							</view>
						</view>
					</block>
					<block v-else>
						<view class="single-item" v-for="(item, index) in items" :key="item.id">
							<view class="item-title">
								<text :style="{color:item.status==-1?'#f2b549':''}">{{index+1}}.{{item.name}}</text>
								<image v-if="item.hasSpecs" @click="openStandard(item.specs)" class="status-icon"
									src="@/static/specification_swms.png" mode="widthFix">
								</image>
							</view>
							<view class="items-wrap">
								<view class="items-content" v-if="item.status == -1">
									<view class="form-input">
										<text class="input-label">说明:</text>
										<input type="text" v-model="item.explain" disabled
											placeholder-class="input-placeholder" placeholder="请输入" :maxlength="150" />
									</view>
									<view class="form-input form-photo">
										<text class="input-label">照片:</text>
										<image v-if="item.fileStatus==0" class="patrol-photo" :src="item.localFilePath"
											mode="scaleToFill" @click="onPicturePreview(item.localFilePath)">
										</image>
										<image v-else class="patrol-photo" :src="links.preview+item.uploadFiles[0]"
											mode="scaleToFill"
											@click="onPicturePreview(links.preview+item.uploadFiles[0])">
										</image>
									</view>
								</view>
								<view v-if="item.itemsId==-1&&item.status!=-1&&item.res" class="items-content">
									<radio-group class="form-radio">
										<label class="radio" v-for="radioValue in item.options" :key="radioValue.id">
											<radio :value="radioValue.id" disabled
												:checked="radioValue.id === item.res" />
											{{radioValue.optionName}}
										</label>
									</radio-group>
									<view class="form-input" v-if="item.remakes">
										<text class="input-label">备注:</text>
										<input type="text" v-model="item.remakes" placeholder-class="input-placeholder"
											placeholder="请输入" disabled />
									</view>
								</view>
								<view v-if="item.itemsId!=-1 && item.status!=-1" class="items-content">
									<radio-group v-if="item.itemType == 6&&item.res" class="form-radio">
										<label class="radio" v-for="radioValue in item.options" :key="radioValue.id">
											<radio :value="radioValue.id" disabled
												:checked="radioValue.id === item.res" />
											{{radioValue.optionName}}
										</label>
									</radio-group>
									<view
										v-else-if="item.itemType == 7&&(item.localFilePath || item.uploadFiles.length>0)">
										<view class="form-input form-photo">
											<text class="input-label">照片:</text>
											<image v-if="item.fileStatus==0" class="patrol-photo"
												:src="item.localFilePath" mode="scaleToFill"
												@click="onPicturePreview(item.localFilePath)">
											</image>
											<image v-else class="patrol-photo" :src="links.preview+item.uploadFiles[0]"
												mode="scaleToFill" @error="onImageError" lazy-load
												@click="onPicturePreview(links.preview+item.uploadFiles[0])">
											</image>
										</view>
									</view>
									<view v-else-if="item.res" class="form-input">
										<text class="input-label">{{item.itemType != 0?'数值:':'文字:'}}</text>
										<input type="text" v-model="item.res" placeholder-class="input-placeholder"
											disabled />
									</view>
									<view class="form-input" v-if="item.remakes">
										<text class="input-label">备注:</text>
										<input type="text" v-model="item.remakes" placeholder-class="input-placeholder"
											disabled />
									</view>
								</view>
							</view>
						</view>
					</block>
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
	import moment from 'moment';
	import syncFunc from '@/utils/dataSync.js';
	import NFC from '@/utils/nfc.js';
	export default {
		data() {
			return {
				id: '',
				deviceList: [],
				activeId: '',
				devices: {},
				items: [],
				taskId: '',
				scanCodeStatus: 0,
				explain: '',
				uploadFiles: [],
				localFilePath: '',
				onlineGps: '',
				taskStatus: '',
				imageText: '',
				abnormal: false,
				showItems: false,
				pageup: 0,
				marginTop: 0,
				showDevice: true,
				links: uni.getStorageSync('links')
			}
		},
		computed: {
			...mapGetters({
				nfc_data: 'app/nfcData',
				getUsers: 'user/getUserInfo'
			})
		},
		watch: {
			nfc_data(val) {
				if (this.taskStatus == 0 && this.devices.scanCodeStatus == 0) {
					if (val) {
						this.nfClock();
					}
				}
			},
		},
		onPageScroll(e) {
			uni.hideKeyboard()
		},
		onLoad(option) {
			console.log(option)
			if (this.nfc_data) {
				this.removeNfcData();
			}
			this.taskId = option.taskId;
			this.taskStatus = option.status;
			if (option.nfc) {
				this.getDeviceList(option.nfc);
			} else if (option.id) {
				this.id = option.id;
				this.getDevicedevices(option.id);
			}
			NFC.listenNFCStatus();
		},
		onUnload() {
			uni.$off('onTipsPopupSave');
			uni.$off('onDescriptionPopupConfirm');
		},
		onNavigationBarButtonTap(e) {
			this.handleScanCode()
		},
		onBackPress(event) {
			if (event.from == 'backbutton') {
				if (this.taskStatus == 0) {
					syncFunc.handlePatrolSync();
				}
			}
		},
		methods: {
			...mapMutations({
				removeNfcData(commit) {
					commit('app/REMOVE_NFC_DATA')
				},
				setDeviceInfo: 'app/SET_DEVICE_INFO'
			}),
			onkeyboardheightchange(e) {
				let height = e.detail.height;
				if (height > 0) {
					this.showDevice = false;
				} else {
					this.showDevice = true;
				}
				console.log(height)
			},
			// 查询当前设备信息
			getDevicedevices(id) {
				if (this.taskStatus == 0) {
					syncFunc.handlePatrolSync();
				}
				this.activeId = id;
				let select =
					`SELECT * FROM ipis_patrol_devices WHERE taskId="${this.taskId}" AND id="${id}" AND userid="${this.getUsers.id}"`;
				this.$db.selectSQL(select).then(res => {
					if (res.length) {
						this.devices = res[0];
						this.devices.map = JSON.parse(this.devices.map);
						this.devices.imgs = JSON.parse(this.devices.imgs);
						this.onlineGps = this.devices.onlineGps;
						console.log('设备详情', this.devices);
						if (this.devices.scanCodeStatus == 1 || this.taskStatus != 0) {
							// #ifdef APP-PLUS
							let webView = this.$mp.page.$getAppWebview();
							// 修改buttons
							webView.setTitleNViewButtonStyle(0, {
								width: '0',
							});
							// #endif
						}
						let selectItems =
							`SELECT * FROM ipis_patrol_items where taskId="${this.taskId}" AND associateId="${id}" AND userid="${this.getUsers.id}"`;
						this.$db.selectSQL(selectItems).then(items => {
							console.log(items)
							let data = items.map(i => {
								i.options = JSON.parse(i.options);
								i.uploadFiles = JSON.parse(i.uploadFiles);
								i.isNormal = (i.itemType == 7 && i.status == 1) ? 3 : ((i.status ==
									1 && i.itemsId != -1) ? 1 : (i.status == -1 ? -1 : i
									.isNormal));
								i.oldNormal = i.isNormal;
								return i;
							})
							this.items = data;
							if (this.devices.deviceStatus == -1) {
								this.explain = this.items[0].explain;
								this.uploadFiles = this.items[0].uploadFiles;
								this.localFilePath = this.items[0].localFilePath;
							}
							this.showItems = true;
							console.log('巡检项', this.items)
							let status = this.items.some(item => item.status == -1);
							let index = this.items.findIndex(item => item.itemsId == -1);
							if (status) { // 异常
								this.$set(this.items[index], 'res', '-2');
								this.abnormal = true;
							} else { // 正常
								this.abnormal = false;
							}
							uni.hideLoading();
						});
					}
				})
			},
			// 查询扫码后的所有设备
			async getDeviceList(nfc) {
				let onlineGps = await this.onPosition();
				let select =
					`SELECT * FROM ipis_patrol_devices WHERE taskId="${this.taskId}" AND nfcNumber="${nfc}" AND userid="${this.getUsers.id}"`;
				this.$db.selectSQL(select).then(async res => {
					console.log('设备列表', res)
					for (let item of res) {
						if (item.scanCodeStatus == 0) {
							item.map = JSON.parse(item.map);
							console.log('*****item', item)
							console.log('*****onlineGps', onlineGps)
							if (onlineGps && onlineGps.length == 0) {
								let coordinate = [];
								if (item.map.length > 0) {
									let map = item.map.filter(i => i.mapType == -1);
									if (map.length > 0) {
										coordinate = map[0].coordinate;
									}
								}
								item.onlineGps = JSON.stringify(coordinate);
							} else {
								item.onlineGps = JSON.stringify(onlineGps);
							}
							await this.updateDevicesStatus(item);
						}
					}
					this.deviceList = res;
					let id = this.id == '' ? res[0].id : this.id;
					await this.getDevicedevices(id);
					if (this.deviceList.length > 1) {
						setTimeout(() => {
							const query = uni.createSelectorQuery().in(this);
							query.select('#device-list').boundingClientRect(data => {
								this.marginTop = data.height + 10;
							}).exec();
						}, 500)
					}
				})
			},
			// NFC
			nfClock() {
				if (this.devices.status == 0) {
					this.nfcNumber = this.nfc_data.toString();
					if (this.nfcNumber != this.devices.nfcNumber) {
						uni.$emit('onErrorPopup', {
							content: '该二维码/卡片不在巡检任务中，请核实',
							buttonNumber: 1,
							affirmButtonText: '知道了'
						});
						uni.getSubNVueById('device-tips-popup').show('zoom-fade-out', 250);
					} else {
						this.getDeviceList(this.nfcNumber);
					}
					this.removeNfcData();
				}
			},
			handleScanCode() {
				uni.scanCode({
					onlyFromCamera: true,
					scanType: ['qrCode'],
					success: (res => {
						if (res.result != this.devices.nfcNumber) {
							uni.$emit('onErrorPopup', {
								content: '该二维码/卡片不在巡检任务中，请核实',
								buttonNumber: 1,
								affirmButtonText: '知道了'
							});
							uni.getSubNVueById('device-tips-popup').show('zoom-fade-out', 250);
						} else {
							this.getDeviceList(res.result);
						}
					})
				});
			},
			// 更新设备扫码状态
			async updateDevicesStatus(data) {
				return new Promise(async (resolve, reject) => {
					let {
						id,
						onlineGps
					} = data;
					let updateSql =
						`UPDATE ipis_patrol_devices SET scanCodeStatus="1",onlineGps="${onlineGps}" WHERE id="${id}"`;
					this.onlineGps = onlineGps;
					await this.$db.executeSQL(updateSql);
					resolve();
				})
			},
			// 打卡获取定位
			onPosition() {
				return new Promise((resolve, reject) => {
					let gps_point = uni.getStorageSync('gps_point');
					let timeDifference = 0;
					let currentTime = Date.now();
					if (gps_point && gps_point.time) {
						timeDifference = (currentTime - gps_point.time) / 1000;
						console.log('时间差', timeDifference, currentTime, gps_point.time)
					}
					console.log('巡检打卡获取', gps_point)
					// if (timeDifference > 10) {
					// 	resolve([])
					// } else {
					let mapLocation = gps_point.mapLocation !== undefined ? gps_point.mapLocation : []
					resolve(mapLocation);
					// }
				})
			},
			// 更新设备当前定位
			async updateDeviceLocation(data) {
				let onlineGps = await this.onPosition();
				return new Promise(async (resolve, reject) => {
					let {
						id
					} = data;
					let updateSql =
						`UPDATE ipis_patrol_devices SET onlineGps='${JSON.stringify(onlineGps)}' WHERE id="${id}"`;
					this.onlineGps = JSON.stringify(onlineGps);
					await this.$db.executeSQL(updateSql);
					uni.hideLoading();
					resolve();
				})
			},
			// 巡检项无法巡检
			handlePhotograph(index) {
				uni.chooseImage({
					count: 1,
					sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
					sourceType: ['camera'],
					success: (res => {
						let tempFilePaths = res.tempFilePaths[0]
						uni.$emit('onShowDescriptionPopup', '请填写无法巡检说明');
						uni.$on("onDescriptionPopupConfirm", (explain) => {
							uni.saveFile({
								tempFilePath: tempFilePaths,
								success: (res) => {
									let url = res.savedFilePath;
									this.items[index].oldNormal = -1;
									this.items[index].localFilePath = url;
									this.items[index].fileStatus = 0;
									this.items[index].status = -1;
									this.items[index].localStatus = 0;
									this.items[index].explain = explain
									this.items[index].res = '';
									this.items[index].remakes = "";
									this.items[index].commitTime = moment().format(
										'YYYY-MM-DD HH:mm:ss');
									let device = this.items.every(item => item
										.status != 0);
									if (device) {
										this.devices.status = 1;
										this.devices.commitTime = moment().format(
											'YYYY-MM-DD HH:mm:ss');
									}
									this.items[index].isNormal = -1;
									this.onUpdateDeviceStatus();
									this.updateItems(this.items[index]);
									this.updateDevices(this.devices);
								}
							});
						})
					}),
					fail: () => {
						console.log(this.items[index].oldNormal, this.items[index].isNormal)
						this.items[index].isNormal = this.items[index].oldNormal;
					}
				});
			},
			// 设备无法巡检
			async devicesNotComplete() {
				await this.updateDeviceLocation(this.devices);
				uni.getSubNVueById('device-tips-popup').show('zoom-fade-out', 250);
				uni.$emit('onErrorPopup', {
					content: '数据将会被清空',
					affirmButtonText: '确定',
					buttonNumber: 2,
					confirmType: 2
				});
				uni.$on("onTipsPopupSave", (data) => {
					uni.$off('onTipsPopupSave');
					if (data == 'confirm') {
						uni.chooseImage({
							count: 1,
							sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
							sourceType: ['camera'],
							success: (res => {
								let tempFilePaths = res.tempFilePaths[0]
								uni.$emit('onShowDescriptionPopup', '请填写无法巡检说明');
								uni.$on("onDescriptionPopupConfirm", (explain) => {
									uni.saveFile({
										tempFilePath: tempFilePaths,
										success: (res) => {
											let url = res.savedFilePath;
											if (this.items.length > 0) {
												for (let item of this
														.items) {
													item.localFilePath =
														url;
													item.fileStatus = 0;
													item.explain = explain;
													item.status = -1;
													item.localStatus = 0;
													item.commitTime =
														moment()
														.format(
															'YYYY-MM-DD HH:mm:ss'
														);
													item.res = "";
													item.remakes = "";
													this.updateItems(item);
												}
												this.explain = explain;
												this.localFilePath = url;
												this.uploadFiles = this
													.items[
														0]
													.uploadFiles;
												let device = this.items
													.every(
														item => item
														.status != 0);
												if (device) {
													this.devices.status =
														1;
													this.devices
														.commitTime =
														moment()
														.format(
															'YYYY-MM-DD HH:mm:ss'
														);
													this.devices
														.deviceStatus = -1;
													this.updateDevices(this
														.devices);
												}
											}
										}
									});
								})
							}),
							fail: () => {
								console.log('失败')
							}
						});
					}
				})
			},
			// 重置设备状态
			resetDeviceStatus() {
				uni.$emit('onErrorPopup', {
					content: '数据将会被清空',
					affirmButtonText: '确定',
					buttonNumber: 2,
					confirmType: 2
				});
				uni.$on("onTipsPopupSave", (data) => {
					uni.$off('onTipsPopupSave');
					if (data == 'confirm') {
						for (let item of this.items) {
							item.localFilePath = '';
							item.fileStatus = -1;
							item.explain = '';
							item.status = 0;
							item.localStatus = -1;
							item.commitTime = '';
							item.res = "";
							item.remakes = "";
							item.isNormal = 0;
							item.oldNormal = 0;
							item.uploadFiles = [];
							this.updateItems(item);
						}
						this.devices.status = 0;
						this.devices.deviceStatus = 0;
						this.devices.commitTime = "";
						this.updateDevices(this.devices);
						this.abnormal = false;
					}
				});
				uni.getSubNVueById('device-tips-popup').show('zoom-fade-out', 250);
			},
			// 打开操作规范
			openStandard(data) {
				uni.$emit('onshownormpopup', {
					content: decodeURIComponent(data)
				});
			},
			// 选择巡检
			async handleInspection(type, index) {
				this.items[index].isNormal = type;
				this.items[index].oldNormal = type;
				if (this.items[index].localFilePath != '') {
					uni.removeSavedFile({
						filePath: this.items[index].localFilePath,
						complete: (res) => {
							this.items[index].localFilePath = "";
							this.items[index].fileStatus = -1;
						}
					});
				}
				this.items[index].status = 0;
				this.items[index].localStatus = -1;
				this.items[index].explain = '';
				this.items[index].commitTime = '';
				this.items[index].uploadFiles = [];
				this.devices.status = 0;
				this.devices.commitTime = '';
				this.onUpdateDeviceStatus();
				await this.updateItems(this.items[index]);
				await this.updateDevices(this.devices);
			},
			// 拍照巡检
			onPhotoInspection(index) {
				uni.chooseImage({
					count: 1,
					sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
					sourceType: ['camera'],
					success: (res => {
						let tempFilePaths = res.tempFilePaths[0]
						uni.saveFile({
							tempFilePath: tempFilePaths,
							success: (res) => {
								let url = res.savedFilePath;
								this.items[index].localFilePath = url;
								this.items[index].fileStatus = 0;
								this.items[index].status = 1;
								this.items[index].localStatus = 0;
								this.items[index].commitTime = moment().format(
									'YYYY-MM-DD HH:mm:ss');
								let device = this.items.every(item => item
									.status != 0);
								if (device) {
									this.devices.status = 1;
									this.devices.commitTime = moment().format(
										'YYYY-MM-DD HH:mm:ss');
								}
								this.items[index].isNormal = 3;
								this.updateItems(this.items[index]);
								this.updateDevices(this.devices);
							}
						});

					}),
					fail: () => {
						console.log('失败')
					}
				});
			},
			// 单选
			radioChange(evt, index) {
				let value = evt.target.value;
				this.items[index].res = value;
				this.items[index].status = 1;
				this.items[index].localStatus = 0;
				this.items[index].commitTime = moment().format('YYYY-MM-DD HH:mm:ss');
				let device = this.items.every(item => item.status != 0);
				if (device) {
					this.devices.status = 1;
					this.devices.commitTime = moment().format('YYYY-MM-DD HH:mm:ss');
				} else {
					this.devices.status = 0;
				}
				this.updateItems(this.items[index]);
				this.updateDevices(this.devices);
			},
			// 动态更新设备状态
			onUpdateDeviceStatus() {
				let status = this.items.some(item => item.status == -1);
				let index = this.items.findIndex(item => item.itemsId == -1);
				if (status) { // 异常
					this.$set(this.items[index], 'res', '-2');
					this.abnormal = true;
				} else { // 正常
					this.abnormal = false;
				}
				this.items[index].status = this.items[index].res != '' ? 1 : 0;
				this.items[index].localStatus = this.items[index].res != '' ? 0 : -1;
				this.items[index].commitTime = moment().format('YYYY-MM-DD HH:mm:ss');
				let device = this.items.every(item => item.status != 0);
				if (device) {
					this.devices.status = 1;
					this.devices.commitTime = moment().format('YYYY-MM-DD HH:mm:ss');
				} else {
					this.devices.status = 0;
				}
				this.updateItems(this.items[index]);
				this.updateDevices(this.devices);
			},
			// 验证输入
			verifyInput(event, type, index) {
				let value = event.target.value;
				//  0--文字、1--整数、2--0.0、3--0.00、4--0.000、5--0.0000
				type = Number(type);
				switch (type) {
					case -1: // 备注
						break;
					case 0: // 文字
						if (value == '') {
							this.items[index].status = 0;
						} else {
							this.items[index].status = 1;
						}
						break;
					case 1: // 整数
						let regular_1 = /^-$|^-?[1-9][0-9]*$/;
						let isverify_1 = regular_1.test(value);
						if (!isverify_1) {
							this.$utils.toast('请输入整数!')
							this.items[index].res = '';
							this.items[index].status = 0;
						} else {
							this.items[index].status = 1;
						}
						break;
					case 2: // 0.0
						let regular_2 = /^(\.*)(\d+)(\.?)(\d{0,1}).*$/g;
						let isverify_2 = regular_2.test(value);
						if (!isverify_2) {
							this.$utils.toast('请输入保留小数点一位的数字!')
							this.items[index].res = '';
							this.items[index].status = 0;
						} else {
							this.items[index].res = value.replace(regular_2, '$2$3$4');
							this.items[index].status = 1;
						}
						break;
					case 3: // 0.00
						let regular_3 = /^(\.*)(\d+)(\.?)(\d{0,2}).*$/g;
						let isverify_3 = regular_3.test(value);
						if (!isverify_3) {
							this.$utils.toast('请输入保留小数点二位的数字!')
							this.items[index].res = '';
							this.items[index].status = 0;
						} else {
							this.items[index].res = value.replace(regular_3, '$2$3$4');
							this.items[index].status = 1;
						}
						break;
					case 4: // 0.000
						let regular_4 = /^(\.*)(\d+)(\.?)(\d{0,3}).*$/g;
						let isverify_4 = regular_4.test(value);
						if (!isverify_4) {
							this.$utils.toast('请输入保留小数点三位的数字!')
							this.items[index].res = '';
							this.items[index].status = 0;
						} else {
							this.items[index].res = value.replace(regular_4, '$2$3$4');
							this.items[index].status = 1;
						}
						break;
					case 5: // 0.0000
						let regular_5 = /^(\.*)(\d+)(\.?)(\d{0,4}).*$/g;
						let isverify_5 = regular_5.test(value);
						if (!isverify_5) {
							this.$utils.toast('请输入保留小数点四位的数字!')
							this.items[index].res = '';
							this.items[index].status = 0;
						} else {
							this.items[index].res = value.replace(regular_5, '$2$3$4');
							this.items[index].status = 1;
						}
						break;
					default:
						break;
				}
				this.items[index].localStatus = 0;
				this.items[index].commitTime = moment().format('YYYY-MM-DD HH:mm:ss');
				let device = this.items.every(item => {
					return item.status != 0;
				});
				if (device) {
					this.devices.status = 1;
					this.devices.commitTime = moment().format('YYYY-MM-DD HH:mm:ss');
				} else {
					this.devices.status = 0;
				}
				this.updateItems(this.items[index]);
				this.updateDevices(this.devices);
			},
			// 更新巡检项数据
			updateItems(data) {
				let {
					id,
					localFilePath,
					fileStatus,
					commitTime,
					status,
					explain,
					remakes,
					res,
					localStatus,
					isNormal,
					uploadFiles
				} = data;
				let updateItemsSql =
					`UPDATE ipis_patrol_items SET localFilePath="${localFilePath}",fileStatus="${fileStatus}",commitTime="${commitTime}",status="${status}",explain="${explain}",remakes="${remakes}",res="${res}",localStatus="${localStatus}",isNormal="${isNormal}",onlineGps="${this.onlineGps}",uploadFiles='${JSON.stringify(uploadFiles)}' WHERE id="${id}" AND userid="${this.getUsers.id}"`;
				this.$db.executeSQL(updateItemsSql);
			},
			// 更新设备
			updateDevices(data) {
				let {
					id,
					status,
					scanCodeStatus,
					commitTime,
					deviceStatus
				} = data;
				let updateDeviceSql =
					`UPDATE ipis_patrol_devices SET localStatus="0",scanCodeStatus="${scanCodeStatus}",status="${status}",commitPersonId="${this.getUsers.id}",commitPerson="${this.getUsers.userName}",commitTime="${commitTime}",deviceStatus="${deviceStatus}" WHERE id="${id}" AND userid="${this.getUsers.id}"`;
				this.$db.executeSQL(updateDeviceSql);
				if (this.deviceList.length > 1) {
					let index = this.deviceList.findIndex(item => item.id == id);
					this.deviceList[index].status = status;
				}
				this.setDeviceInfo({
					id,
					status
				});
			},
			// 设备更新说明
			updateExplain(event) {
				let value = event.target.value;
				for (let item of this.items) {
					item.explain = value;
					item.localStatus = 0;
					item.commitTime = moment().format('YYYY-MM-DD HH:mm:ss');
					this.updateItems(item);
				}
			},
			// 巡检项更新说明
			explainUpdate(index) {
				this.items[index].localStatus = 0;
				this.updateItems(this.items[index]);
			},
			// 照片预览
			onPicturePreview(imgUrl) {
				console.log('照片预览', imgUrl)
				this.$utils.previewImg(imgUrl);
			},
			// 图片加载失败
			onImageError(e) {
				this.imageText = this.$utils.imageError(e);
				console.log(this.imageText, e)
			},
			// 地图跳转
			async onJumpMap(data) {
				let isNetwork = await this.$utils.monitorNetwork();
				if (isNetwork) {
					let mapType, pageUrl;
					if (data.length === 1) {
						mapType = data[0].mapType;
					} else {
						let amap = data.filter(item => item.mapType == -1);
						mapType = amap[0].mapType;
					}
					if (mapType) {
						pageUrl = mapType == -1 ? '/pages/map/amap' : '/pages/map/cmap';
						uni.setStorageSync('maps', {
							maps: data,
							type: 1
						});
						uni.navigateTo({
							url: pageUrl
						});
					}
				} else {
					this.$utils.toast('当前状态无法查看地图!')
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.device-devices {
		overflow: hidden;

		.device-list {
			position: fixed;
			top: 0;
			left: 0;
			right: 0;
			z-index: 99;
			background-color: #fff;
			padding: 15px 10px 7px 15px;
			display: flex;
			flex-wrap: wrap;
			box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.08);

			.device-name {
				height: 25px;
				line-height: 25px;
				text-align: center;
				padding: 0 13px;
				background-color: #f5f5f5;
				border-radius: 12px;
				font-size: 12px;
				color: #999999;
				margin: 0 8px 8px 0;
			}

			.device-success {
				background-color: rgba(0, 181, 120, 0.14);
				color: #00b578;
			}

			.active-device {
				background-color: $uni-color-primary;
				color: #FFFFFF;
			}
		}

		.device-content {
			background-color: #FFFFFF;

			.device-info {
				border-bottom: 3px solid #fafafa;

				.point-info__item {
					display: flex;
					align-items: center;
					flex-flow: wrap;
				}

				.device-img {
					margin-right: 10px;
					margin-bottom: 5px;

					&:last-child {
						margin-right: 0;
					}
				}
			}

			.check-item {
				.single-item {
					padding: 0 0 0 18px;

					.items-wrap {
						margin-left: 17px;
						border-bottom: 1px solid #E5E5E5;
						overflow: hidden;
					}

					.item-title {
						font-size: 17px;
						color: #333333;
						padding: 10px 0;
					}

					.status-icon {
						width: 14px;
						margin-left: 9px;
					}

					.item-select {
						display: flex;
						padding: 10px 0 18px 0;

						.select-button {
							width: 72px;
							height: 25px;
							line-height: 25px;
							text-align: center;
							background-color: #e7f1ff;
							border-radius: 13px;
							font-size: 12px;
							color: $uni-color-primary;
							margin-right: 10px;
						}

						.active-button {
							background-color: $uni-color-primary;
							color: #ffffff;
						}
					}

					.disabled-select {
						.select-button {
							background-color: #ededed;
							color: #888888;
						}
					}

					.items-content {
						padding-right: 16px;

						.form-radio {
							color: #888888;
							margin-bottom: 8px;

							.radio {
								margin-right: 15px;
								font-size: 15px;
								margin-bottom: 10px;
							}
						}

						.form-input {
							display: flex;
							align-items: center;
							margin-bottom: 21px;

							.input-label {
								font-size: 14px;
								color: #888888;
								margin-right: 7px;
							}

							.input-placeholder {
								font-size: 14px;
								color: #b2b2b2;
							}

							uni-input {
								background-color: #f5f5f5;
								height: 33px;
								padding: 0 6px;
								border-radius: 2px;
								font-size: 14px;
								flex: 1;
							}
						}

						.form-photo {
							align-items: flex-start;
						}
					}
				}

				.device-abnormal {
					padding: 20px 0 40px 18px;
				}
			}
		}

		.form-item__label {
			&::before {
				content: "*";
				color: #f56c6c;
				margin-right: 4px;
			}
		}

		.form-item__remark {
			&::before {
				content: "*";
				color: #f56c6c;
				margin-right: 4px;
				opacity: 0;
			}
		}

		.form-radio__item {
			display: flex;
			flex-flow: wrap;
		}
	}
</style>
