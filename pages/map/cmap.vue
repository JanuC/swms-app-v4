<template>
	<view class="c-map">
		<canvas class="canvas-element" canvas-id="canvas" id="canvas"></canvas>
		<image style="width: 100%;" :src="imgUrl" mode="widthFix" @click="onPreviewImage"></image>
		<view class="button-wrap">
			<text class="map-button" @click="onJumpAmap">高德地图</text>
			<text class="map-button active-button">2D地图</text>
		</view>
	</view>
</template>

<script>
	import {
		mapGetters
	} from 'vuex';
	export default {
		data() {
			return {
				context: null,
				mapSrc: '',
				coordinate: [],
				actualWidth: 0,
				actualHeight: 0,
				imgUrl: '',
				maps: [],
				type: '',
				links: uni.getStorageSync('links')
			}
		},
		computed: {
			...mapGetters({
				getUsers: 'user/getUserInfo'
			})
		},
		onLoad(option) {
			// uni.$on('toCmapData', res => {
			// 	console.log(res)
			// 	this.maps = res.data;
			// 	this.type = res.type;
			// 	let cmap = this.maps.filter(item => item.mapType == 0);
			// 	this.mapSrc = this.getUsers.links.preview + cmap[0].mapPic;
			// 	this.coordinate = cmap[0].coordinate
			// 	this.previewImage()
			// });
			this.context = uni.createCanvasContext('canvas', this);
			uni.getStorage({
				key: 'maps',
				success: (res) => {
					this.maps = res.data.maps;
					this.type = res.data.type;
					let cmap = this.maps.filter(item => item.mapType == 0);
					this.mapSrc = this.links.preview + cmap[0].mapPic;
					this.coordinate = cmap[0].coordinate;
					this.previewImage()
				}
			});
		},
		onUnload() {
			// uni.$off('toCmapData');
			uni.hideLoading();
		},
		methods: {
			drawImage(w, h) {
				return new Promise((resolve, reject) => {
					let {
						windowWidth
					} = uni.getSystemInfoSync();
					let imgHeight = (windowWidth / this.actualWidth * this.actualHeight).toFixed(2);
					this.$nextTick(() => {
						this.context.beginPath();
						this.context.drawImage(this.mapSrc, 0, 0, w, h);
						this.context.arc(this.coordinate[0] * windowWidth, this.coordinate[1] * imgHeight,
							10, 0, 2 *
							Math.PI);
						this.context.setFillStyle('red');
						this.context.fill();
						this.context.draw(false, (res) => {
							uni.hideLoading();
							resolve(true);
						})
					})
				})
			},
			getImageInfo() {
				return new Promise((resolve, reject) => {
					uni.getImageInfo({
						src: this.mapSrc,
						success: (image) => {
							let {
								width,
								height
							} = image;
							let {
								windowWidth,
								windowHeight
							} = uni.getSystemInfoSync();
							let wScale = width / windowWidth;
							let cw = windowWidth;
							let ch = parseInt((height / wScale).toFixed());
							this.actualWidth = width;
							this.actualHeight = height;
							resolve({
								cw,
								ch
							})
						},
						fail: (error) => {
							reject(error)
						}
					});
				})
			},
			previewImage() {
				uni.showLoading({
					title: '加载中...',
					mask: true
				});
				this.getImageInfo().then(data => {
					let {
						cw,
						ch
					} = data;
					this.drawImage(cw, ch).then(res => {
						uni.canvasToTempFilePath({
							canvasId: 'canvas',
							success: (res) => {
								this.imgUrl = res.tempFilePath;
							},
							fail: (err) => {
								console.error(JSON.stringify(err))
							}
						})
					});
				})
			},
			onPreviewImage() {
				uni.previewImage({
					urls: [this.imgUrl]
				});
			},
			onJumpAmap() {
				console.log(this.maps);
				if (this.maps.length > 1) {
					uni.redirectTo({
						url: `/pages/map/amap`
					});
				} else {
					if (this.type == 1) {
						let tips = '该设备未配置高德地图';
						this.$utils.toast(tips);
					} else if (this.type == 2) {
						let tips = '该点位未配置高德地图';
						this.$utils.toast(tips);
					}
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.c-map {
		width: 100vw;
		height: 100vh;
		display: flex;
		align-items: center;

		.button-wrap {
			position: absolute;
			padding: 0 46px;
			bottom: 16px;
			left: 0;
			right: 0;
			display: flex;
			flex-direction: row;
			align-items: center;
			justify-content: space-between;

			.map-button {
				width: 90px;
				height: 30px;
				line-height: 30px;
				text-align: center;
				box-shadow: 0px 1px 3px 0px rgba(0, 0, 0, 0.08);
				border-radius: 15px;
				font-size: 15px;
				background-color: #ffffff;
				color: #333333;
			}

			.disabled-button {
				background-color: #ededed;
				color: #8d8d8d;
			}

			.active-button {
				background-color: $uni-color-primary;
				color: #ffffff;
			}
		}
	}
</style>
