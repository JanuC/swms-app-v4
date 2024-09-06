<template>
	<view class="content">
		<view class="cache-content">
			<image class="cache-icon" src="/static/broom_swms.png" mode="widthFix"></image>
			<view class="cache-data">
				<text>当前共有{{cacheSize}}缓存</text>
			</view>
			<view class="cache-tips">
				<text>APP运行时产生的缓存数据，清除不会影响APP使用</text>
			</view>
		</view>
		<view class="button-wrap">
			<button type="primary" :disabled="cacheSize <= '0B'" @click="handleClearCache">清除缓存</button>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				cacheSize: 0
			};
		},
		onLoad() {
			this.getCacheSize();
		},
		methods: {
			getCacheSize() {
				plus.cache.calculate((size) => {
					let sizeCache = parseInt(size);
					this.calculateCache(sizeCache)
				});
			},
			handleClearCache() {
				let that = this;
				let os = plus.os.name;
				if (this.cacheSize === '0B') return;
				uni.showLoading({
					mask: true,
					title: '正在清理...'
				});
				if (os == 'Android') {
					let main = plus.android.runtimeMainActivity();
					let sdRoot = main.getCacheDir();
					let files = plus.android.invoke(sdRoot, "listFiles");
					let len = files.length;
					for (let i = 0; i < len; i++) {
						let filePath = '' + files[i]; // 没有找到合适的方法获取路径，这样写可以转成文件路径  
						plus.io.resolveLocalFileSystemURL(filePath, function(entry) {
							if (entry.isDirectory) {
								entry.removeRecursively(function(entry) { // 递归删除其下的所有文件及子目录  
									uni.hideLoading();
									uni.showToast({
										mask: true,
										title: '缓存清理完成',
										duration: 2000
									});
									that.getCacheSize(); // 重新计算缓存  
								}, function(e) {
									console.log(e.message)
								});
							} else {
								entry.remove();
							}
						}, function(e) {
							console.log('文件路径读取失败')
						});
					}
				} else { // ios  
					plus.cache.clear(function() {
						uni.showToast({
							mask: true,
							title: '缓存清理完成',
							duration: 2000
						});
						that.getCacheSize();
					});
				}
			},
			// 计算缓存大小
			calculateCache(sizeCache) {
				if (sizeCache === 0) {
					this.cacheSize = "0B";
				} else if (sizeCache < 1024) {
					this.cacheSize = sizeCache + "B";
				} else if (sizeCache < 1048576) {
					this.cacheSize = (sizeCache / 1024).toFixed(2) + "KB";
				} else if (sizeCache < 1073741824) {
					this.cacheSize = (sizeCache / 1048576).toFixed(2) + "MB";
				} else {
					this.cacheSize = (sizeCache / 1073741824).toFixed(2) + "GB";
				}
			}
		}
	}
</script>

<style lang="scss">
	.cache-content {
		padding: 30px 0 38px 0;
		background-color: #FFFFFF;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		margin-bottom: 38px;

		.cache-icon {
			width: 54px;
			height: 54px;
			margin-bottom: 24px;
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
