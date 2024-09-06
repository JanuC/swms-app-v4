<template>
	<view class="wrap" @touchstart="touchStart" @touchend="touchEnd">
		<HeaderTabBar @onActive="tabbarToggle"></HeaderTabBar>
		<view class="content">
			<view class="search-bar" v-if="!selectOrgans.length">
				<uni-search-bar placeholder="搜索" radius="100" bgColor="#ecedef" cancelButton="none"
					v-model="searchValue" @blur="blur" @focus="focus" @input="input" @clear="clear" @confirm="search" />
			</view>
			<!-- 面包屑导航 -->
			<SlidingBreadcrumbs v-if="selectOrgans.length" :selectOrgans="selectOrgans" @onOrgansId="getOrgansId" />
			<!-- 数据列表 -->
			<scroll-view class="organ-content" scroll-y="true">
				<view v-if="showType == 1" class="organ-item" v-for="item in organs" @tap="setListData(item)">
					<view class="organ-item__content">
						<view class="organ-name">
							<text>{{item.name}}</text>
							<text>（{{item.hasPicture}}/{{item.total}}）</text>
						</view>
						<image v-if="item.children != 0" class="right-image" src="@/static/right_1.png"
							mode="aspectFill"></image>
					</view>
				</view>
				<view v-if="showType == 2" class="organ-item" v-for="item in devices"
					@tap="onUnfold(item.devId, item.picture, item.typeId)">
					<view class="organ-item__content">
						<view class="organ-name">
							<text class="organ-name__text">{{item.name}}</text>
							<uni-icons v-if="item.picture!=null && item.picture.length" type="checkmarkempty"
								color="#9f4b63"></uni-icons>
						</view>
						<view class="right-operate">
							<view class="photo-num-show" v-if="item.picture!=null && item.picture.length">
								<text class="photo-num">
									{{item.picture.length}}张
								</text>
								<image :class="['right-image', devId==item.devId?'down-image':'']"
									src="@/static/right_1.png" mode="aspectFill"></image>
							</view>
							<view class="add-button" v-else
								@tap.stop="onAddPhoto(item.devId, item.picture, item.typeId)">
								<image class="add-image" src="@/static/add.png" mode="aspectFill"></image>
							</view>
						</view>
					</view>
					<view :class="['photo-content',devId==item.devId?'photo-content__unfold':'']"
						v-if="item.picture!=null&&item.picture.length>0">
						<DeviceImage v-for="(img, index) in item.picture" :index="index" :picture="item.picture"
							:url="file_url+img" :devId="item.devId" @onPreview="onPhotoPreview"
							@onDialog="openDeleteDialog" />
						<view v-if="item.picture.length < 3" class="add-photo__wrap"
							@tap.stop="onAddPhoto(item.devId, item.picture, typeId)">
							<image class="add-photo" src="@/static/add_photo.png" mode="scaleToFill"></image>
						</view>
					</view>
				</view>
				<view class="no-data" v-if="showType == 2 && devices.length <= 0">
					<text>暂无设备!</text>
				</view>
			</scroll-view>
		</view>

		<!-- 弹窗 -->
		<uni-popup ref="popup" type="share">
			<view class="popup-wrap">
				<view class="popup-button popup-photograph" @tap="onPopupPhotograph('camera')">
					<text class="popup-title">拍照</text>
					<text class="popup-tips">请横置拍照</text>
				</view>
				<view class="popup-button popup-photo-album" @tap="onPopupPhotograph('album')">
					<text class="popup-title">相册</text>
				</view>
				<view class="popup-button popup-cancel" @tap="onClose">
					<text class="popup-title">取消</text>
				</view>
			</view>
		</uni-popup>
		<DialogTips ref="deletepopup" content="是否要删除照片？" @onConfirm="dialogConfirm" />
	</view>
</template>

<script>
	// 调用组织机构树 设备类型树

	import HeaderTabBar from '@/components/HeaderTabBar.vue';
	import SlidingBreadcrumbs from '@/components/SlidingBreadcrumbs.vue';
	import DialogTips from '@/components/DialogTips.vue';
	import DeviceImage from '@/components/DeviceImage.vue';
	import moment from 'moment';
	import lodash from 'lodash';
	import {
		mapGetters
	} from 'vuex';
	export default {
		components: {
			HeaderTabBar,
			SlidingBreadcrumbs,
			DialogTips,
			DeviceImage
		},
		data() {
			return {
				tabbarId: 0,
				organs: [],
				devices: [],
				selectOrgans: [],
				organName: '',
				parentId: '',
				showType: 1, // 显示类型 1 机构 2 设备
				devId: -1, // 当前需要删除图片的设备iD
				typeId: 0, // 设备类型id
				organId: 0, // 组织节点id
				picture: [], // 当前需要上传的图片
				apiUrl: '/v3/dms/device?tree=5',
				options: {},
				searchValue: '',
				currentCount: 0,
				deviceTypeId: -1,

				devTypeMap: new Map(), // 设备类型map
				organMap: new Map(), // 组织机构map
			}
		},
		computed: {
			...mapGetters({
				isTokenValid: 'user/isTokenValid',
				file_url: 'system/getFileUrl'
			})
		},
		onLoad() {
			if (this.isTokenValid) {
				this.getOrganTree();
			}
		},
		onBackPress(event) {
			if (event.from === 'backbutton') {
				let id = 0,
					length = this.selectOrgans.length,
					isback = true;
				if (length === 0) {
					isback = false;
				} else if (length === 1) {
					id = this.selectOrgans[0].id;
				} else {
					id = this.selectOrgans[length - 2].id;
				}
				this.searchValue = '';
				this.getOrgansId(id);
				return isback;
			}
		},
		methods: {
			/**
			 * 标签切换回调返回选中的标签
			 * @param {Object} val
			 */
			tabbarToggle(val) {
				if (this.tabbarId == val) return;
				this.searchValue = '';
				this.tabbarId = val;
				this.apiUrl = val === 0 ? '/v3/dms/device?tree=5' : '/v3/dms/device?tree=4';
				this.selectOrgans = [];
				this.getOrganTree();
			},
			/**
			 * 获取组织结构
			 * @param {Object} parentId
			 */
			getOrganTree(parentId) {
				uni.showLoading({
					mask: true,
					title: '努力加载中...'
				});
				return new Promise((resolve, reject) => {
					this.$request(this.apiUrl).then(res => {
						const {
							data
						} = res.data;
						this.devId = -1;
						this.deviceTypeId = -1;
						this.showType = 1;
						this.organs = data;

						this.getChildrenData(data, this.tabbarId);
						resolve(true);

						uni.hideLoading()
					}).catch(error => {
						console.log(error)
						reject(error);
						uni.hideLoading()
						this.$utils.toast('未知错误!');
					})
				})
			},

			// 统计设备安装图片
			getDeviceBingPicture() {
				this.$request(this.apiUrl).then(res => {
					const {
						data
					} = res.data
					this.getChildrenData(data, this.tabbarId);
				}).catch(error => {
					console.log(error)
				})
			},

			/**
			 * 过滤数据 生成map 对象
			 * @param {Object} data array
			 * @param {Object} type 0 组织机构数据 1 设备类型数据
			 */
			getChildrenData(data, type) {
				data.forEach(item => {
					// nodeType == 1 为机构节点
					if (item.nodeType == 1) {
						type == 1 ? this.devTypeMap.set(item.id, item.children || []) : this.organMap.set(item.id,
							item.children || [])
					}

					if (item.children) {
						this.getChildrenData(item.children, type)
					}
				})
			},

			/**
			 * 设置列表数据
			 * @param {Object} data
			 * @param {Object} source 来源 list 列表 Bread 面包屑
			 */
			setListData(data, source = 'list') {
				// 默认展示节点
				this.showType = 1;
				let list = []
				if (this.tabbarId == 1) {
					list = this.devTypeMap.get(data.id) || [];
				} else {
					list = this.organMap.get(data.id) || [];
				}

				if (!list.length) return;

				// 设置面包屑
				if (data.nodeType == 1 && source == 'list') {
					this.selectOrgans.push({
						"id": data.id,
						"name": data.name,
					});
					this.organId = data.id;
				}

				if (source == 'Bread') {
					let i = this.selectOrgans.findIndex(item => item.id == data.id);
					this.selectOrgans = this.selectOrgans.filter((item, index) => index <= i);
				}


				if (list[0].nodeType == 1) {
					this.organs = list;
					this.showType = 1;
				} else {
					this.devices = list;
					this.showType = 2
				}
			},

			/**
			 * 获取设备
			 * @param {Object} options
			 * type 0-全部设备，1-监控视频，2-图像火灾设备，3-人脸识别设备
			 * organId 节点id
			 * organType 节点类型，0-组织结构，1-设备类型
			 */
			getDevice() {
				uni.showLoading({
					mask: true,
					title: '努力加载中...'
				})
				return new Promise((resolve, reject) => {
					let typeId = this.typeId;
					let params = this.tabbarId == 1 ? {
						typeId: typeId || '',
						install: 1,
						keyword: this.searchValue
					} : {
						orgId: this.organId || '',
						keyword: this.searchValue
					}
					this.$request('/v3/dms/device', params).then(res => {
						// console.log(res)
						const {
							data
						} = res;
						if (res.statusCode === 200) {
							this.devices = data.data;
							resolve(true);
						} else {
							this.$utils.toast(data.err.info);
							resolve(false);
						}
						uni.hideLoading()
					}).catch(error => {
						console.log(error)
						reject(error)
						uni.hideLoading()
						this.$utils.toast('未知错误!');
					})
				})
			},
			/**
			 * 显示设备
			 * @param {Object} deviceTypeId
			 */
			showDevice(deviceTypeId) {
				this.showType = 2;
				this.organs.forEach(item => {
					if (item.deviceTypeId === deviceTypeId) {
						this.devices = item.childrens;
					}
				})
			},
			/**
			 * 处理设备类型分组
			 * @param {Object} data
			 */
			handleGrouping(data) {
				this.organs = [];
				data.forEach((item) => {
					let deviceFilter = data.filter(
						(el) => el.deviceTypeId === item.deviceTypeId
					);
					if (this.organs.length === 0) {
						let deviceDefend = deviceFilter.filter(el => el.picture !== null);
						this.organs.push({
							id: item.deviceTypeId,
							deviceTypeId: item.deviceTypeId,
							name: item.deviceTypeName,
							children: deviceFilter.length,
							devices: deviceFilter.length,
							deviceDefend: deviceDefend.length,
							childrens: deviceFilter
						});
					} else {
						let isDeviceType = this.organs.some((el) => el.deviceTypeId === item.deviceTypeId);
						if (!isDeviceType) {
							let deviceDefend = deviceFilter.filter(el => el.picture !== null);
							this.organs.push({
								id: item.deviceTypeId,
								deviceTypeId: item.deviceTypeId,
								name: item.deviceTypeName,
								children: deviceFilter.length,
								devices: deviceFilter.length,
								deviceDefend: deviceDefend.length,
								childrens: deviceFilter
							});
						}
					}
				});
				if (this.deviceTypeId !== -1) this.showDevice(this.deviceTypeId);
				// console.log('处理设备类型分组', this.organs);
			},
			/**
			 * 面包屑回调
			 * @param {Object} id
			 */
			getOrgansId(id) {
				let index = this.selectOrgans.findIndex(item => item.id == id);
				if (index !== -1) {
					this.setListData(this.selectOrgans[index], 'Bread');
				}
			},
			/**
			 * 选择照片
			 * @param {Object} sourceType
			 */
			onPopupPhotograph(sourceType) {
				let count = 3 - this.currentCount;
				uni.chooseImage({
					count: count,
					sizeType: ['compressed'], // 原图'original'
					sourceType: [sourceType], // 从相册选择
					success: (res) => {
						this.onClose();
						this.onPhotoUpload(res.tempFilePaths);
					},
					fail: (error) => {
						console.log(error);
					}
				});
			},
			/**
			 * 从相册选择图片
			 */
			selectGalleryPick() {
				plus.gallery.pick((e) => {
					this.onPhotoUpload(e.files)
				}, (e) => {
					console.log("取消选择图片");
				}, {
					filter: "image",
					multiple: true,
					maximum: 3
				});
			},
			/**
			 * 照片上传
			 * @param {Object} data
			 */
			async onPhotoUpload(data) {
				uni.showLoading({
					mask: true,
					title: '上传中...'
				})
				let options = {
					"devId": this.devId,
					"picture": [],
				}
				if (this.picture !== null) {
					this.picture.forEach(img => {
						options.picture.push(img)
					})
				}
				for (let item of data) {
					try {
						let result = await this.$utils.uploadFile(item);
						options.picture.push(result.fileId)
					} catch {
						console.log('失败')
					}
				}
				await this.onDeviceDefend(options);
				uni.hideLoading();
			},
			/**
			 * 关联图片到设备
			 * @param {Object} options
			 */
			onDeviceDefend(options) {
				return new Promise((resolve, reject) => {
					this.$request(`/v3/dms/device/${options.devId}?type=4`, options, 'PUT').then(res => {
						const {
							data
						} = res;
						if (res.statusCode === 200) {

							if (options.picture.length == 1) {
								this.getDeviceBingPicture()
							}

							let params = {
								type: this.typeId,
								organId: this.organId,
								organType: this.tabbarId,
								keyword: this.searchValue
							}
							this.getDevice(params);

							resolve(true);
						} else {
							this.$utils.toast(data.err.info);
							resolve(false);
						}
					}).catch(error => {
						console.log(error)
						reject(error);
						this.$utils.toast('未知错误!');
					})
				})
			},
			/**
			 * 图片预览
			 * @param {Object} imgPaths
			 */
			onPhotoPreview(imgPaths, current) {
				let imgs = imgPaths.map(item => this.file_url + item);
				this.$utils.previewImg(imgs, current);
			},
			/**
			 * 展开
			 * @param {Object} picture
			 */
			onUnfold(id, picture, typeId) {
				// console.log(picture)
				if (picture === null || picture.length <= 0) return;
				if (this.devId === id) {
					this.devId = -1;
				} else {
					this.devId = id;
				}
				this.typeId = typeId
			},
			/**
			 * 删除dialog
			 * @param {Object} id
			 * @param {Object} data
			 * @param {Object} index
			 */
			openDeleteDialog(id, data, index) {
				this.options = {
					id,
					data,
					index
				}
				this.devId = id;
				this.$refs.deletepopup.dialogOpen();
			},
			/**
			 * 确认删除
			 */
			dialogConfirm() {
				this.onDeletePhoto(this.options.id, this.options.data, this.options.index);
			},
			/**
			 * 图片删除
			 * @param {Object} id
			 * @param {Object} data
			 * @param {Object} index
			 */
			async onDeletePhoto(id, data, index) {
				let options = {
					"devId": id,
					"picture": [],
				}
				data.splice(index, 1);
				data.forEach(img => {
					options.picture.push(img)
				})
				let res = await this.onDeviceDefend(options);
				if (res) {
					this.$utils.toast('删除成功!');
					if (data.length == 0) {
						this.getDeviceBingPicture()
					}
				}
				this.$refs.deletepopup.dialogClose();
			},
			/**
			 * 添加照片
			 * @param {Object} id
			 * @param {Object} data
			 */
			onAddPhoto(id, data, typeId) {
				this.$refs.popup.open();
				this.devId = id;
				this.currentCount = data === null ? 0 : data.length;
				this.picture = data;
				this.typeId = typeId;
			},
			/**
			 * 关闭选择图片popup
			 */
			onClose() {
				this.$refs.popup.close();
			},
			/**
			 * 键盘搜索触发
			 * @param {Object} e
			 */
			search(e) {
				if (e.value === '') return;
				this.typeId = '';
				this.organId = '';
				this.showType = 2;
				this.getDevice();
			},
			/**
			 * 输入类容触发
			 * @param {Object} e
			 */
			input: lodash.debounce(function(e) {
				if (e !== "") {
					this.showType = 2;
					this.getDevice();
				} else {
					this.showType = 1;
					this.getOrganTree();
				}
			}, 1000),
			blur(e) {
				console.log('blur', e)
			},
			/**
			 * 清除
			 * @param {Object} e
			 */
			clear(e) {
				this.getOrganTree();
			},
			focus(e) {
				console.log('focus', e)
			},
			/**
			 * 触摸开始
			 * @param {Object} e
			 */
			touchStart(e) {
				// console.log(e)
			},
			/**
			 * 触摸结束
			 * @param {Object} e
			 */
			touchEnd(e) {
				// console.log(e)
			}
		}
	}
</script>

<style lang="scss">
	.wrap {
		height: 100vh;
		overflow: hidden;

		.content {
			margin-top: 15rpx;
			background-color: #FFFFFF;
			overflow: hidden;

			.search-bar {
				position: relative;
				z-index: 9;

				.placeholder {
					margin-left: 27rpx;
					font-size: 28rpx;
					color: #959aa0;
				}
			}

		}
	}

	// 机构
	.organ-content {
		width: 100%;
		border-top: solid 1rpx #e5e5e5;
		position: absolute;
		top: calc(var(--status-bar-height) + 240rpx);
		bottom: 0;
		background-color: #FFFFFF;

		.organ-item {
			margin-left: 30rpx;
			border-bottom: solid 1px #e5e5e5;

			&:last-child {
				// border-bottom: none;
			}

			.organ-name {
				font-size: 34rpx;
				color: #000000;
			}

			.organ-name__text {
				margin-right: 15rpx;
			}
		}

		.organ-item__content {
			height: 95rpx;
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding-right: 30rpx;

			.right-operate {
				height: 100%;
				display: flex;
				align-items: center;

				.photo-num-show {
					display: flex;
					align-items: center;
				}

				.photo-num {
					font-size: 26rpx;
					color: #878787;
					margin-right: 10rpx;
				}

				.down-image {
					transform: rotate(90deg);
				}
			}
		}

		.photo-content {
			display: flex;
			align-items: center;
			height: 0;
			overflow: hidden;
			transition: all 0.3s;
		}

		.photo-content__unfold {
			height: auto;
			margin: 20rpx 0;
			transition: all 0.3s;
		}
	}

	.popup-wrap {
		width: 100%;
		background-color: #FFFFFF;
		border-radius: 10rpx 10rpx 0 0;

		.popup-button {
			height: 114rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			border-bottom: 1px solid #e5e5e5;
		}

		.popup-photograph {
			flex-direction: column;
		}

		.popup-photo-album {}

		.popup-cancel {
			border-bottom: none;
			border-top: 16rpx solid #f2f4f5;
		}

		.popup-title {
			font-size: 36rpx;
			color: #333333;
		}

		.popup-tips {
			font-size: 24rpx;
			color: #999999;
		}
	}

	.no-data {
		height: 200rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #999999;
	}
</style>
