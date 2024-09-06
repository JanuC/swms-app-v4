<template>
	<view class="content">
		<view class="cache-content">
			<image class="logo-icon" src="/static/logo_icon_swms.png" mode="widthFix"></image>
			<view class="version">
				<text>V {{version}}</text>
			</view>
			<view class="cache-data">
				<text>{{tips}}</text>
			</view>
			<!-- 		<view class="cache-tips">
				<text>设备号：{{deviceId}}</text>
			</view> -->
		</view>
		<view class="button-wrap">
			<button v-if="!isVersion" type="primary" @click="handleSynchrodata">检查更新</button>
			<button v-else type="primary" :disabled="updating"
				@click="downloadFile">{{updating ? '正在更新' : '立即更新'}}</button>
		</view>
	</view>
</template>

<script>
	// import {
	// 	version
	// } from '@/package.json';
	import {
		mapGetters
	} from 'vuex';
	export default {
		data() {
			return {
				deviceId: '',
				version: "",
				tips: '您当前已是最新版本',
				isVersion: false,
				downloadUrl: '',
				updating: false,
				links: uni.getStorageSync('links')
			};
		},
		computed: {
			...mapGetters({
				getUsers: 'user/getUserInfo',
				getApiUrl: 'app/apiUrl'
			})
		},
		async onLoad() {
			const {
				deviceId
			} = uni.getSystemInfoSync();
			console.log(uni.getSystemInfoSync())
			console.log(plus.runtime.version);
			this.deviceId = deviceId;
			this.version = plus.runtime.version.toString();
			await this.handleSynchrodata();
		},
		onShow() {
			console.log('onShow')
		},
		methods: {
			handleSynchrodata() {
				uni.showLoading({
					title: '版本检测中...',
					mask: true
				})
				this.$request('/v1/sys-config/appVersion/').then(res => {
					let version = res.data.version.toString();
					console.log('当前版本', this.version, '线上版本', res.data.version, this.links.preview + res
						.data.apkUrl)
					if (version > this.version) {
						this.isVersion = true;
						this.tips = '发现新版本V' + res.data.version;

						this.downloadUrl = res.data.apkUrl.includes('http') ? res.data.apkUrl : this.links
							.preview + res.data.apkUrl;
						// this.downloadUrl = this.getApiUrl + `/v1/sys-config/apk/${res.data.apkUrl}`
					}
					uni.hideLoading();
				}).catch(error => {
					uni.hideLoading();
				})
			},
			// 更新
			downloadFile() {
				let dtask = plus.downloader.createDownload(this.downloadUrl, {}, function(d, status) {
					if (status == 200) {
						// console.log(dtask.getAllResponseHeaders())
						this.updating = false;
						plus.runtime.install(plus.io.convertLocalFileSystemURL(d.filename), {}, {}, function(
							error) {
							uni.showToast({
								title: '安装失败',
								mask: false,
								duration: 1500
							});
						})
					} else {
						uni.showToast({
							title: '更新失败',
							mask: false,
							duration: 1500
						});
					}
				});
				// 开始下载
				dtask.start();
				let showLoading = plus.nativeUI.showWaiting("正在下载...");
				let prg = 0;
				// 监听事件
				dtask.addEventListener("statechanged", (task, status) => {
					switch (task.state) {
						case 1:
							showLoading.setTitle("正在下载...");
							this.updating = true;
							break;
						case 2:
							showLoading.setTitle("已连接到服务器");
							break;
						case 3:
							// prg = parseInt((parseFloat(task.downloadedSize) / parseFloat(task.totalSize)) * 100);
							// console.log(task.downloadedSize, task.totalSize)
							// showLoading.setTitle("版本更新,正在下载" + prg + "% ");
							// console.log('"版本更新,正在下载')
							showLoading.setTitle("正在下载...");
							this.updating = true;
							break;
						case 4:
							// 下载完成
							plus.nativeUI.closeWaiting();
							this.updating = false;
							break;
					}
				});
				// // 暂停下载
				// dtask.pause();
				// // 恢复下载
				// dtask.resume();
				// // 取消下载
				// dtask.abort();
			},
		}
	}
</script>

<style lang="scss">
	.cache-content {
		// height: 436rpx;
		padding: 30px 0 38px 0;
		background-color: #FFFFFF;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		margin-bottom: 38px;

		.logo-icon {
			width: 65px;
			height: 65px;
			margin-bottom: 6px;
		}

		.version {
			font-size: 14px;
			color: $uni-color-primary;
			margin-bottom: 27rpx;
		}

		.cache-data {
			font-size: 18px;
			color: #333333;
			margin-bottom: 7px;
		}

		.cache-tips {
			font-size: 13px;
			color: #999999;
		}
	}
</style>
