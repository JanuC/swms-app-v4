import store from '@/store/index.js';
import request from './request.js';
export default {
	/**
	 * 监听网络状态
	 */
	monitorNetwork() {
		return new Promise((resolve, reject) => {
			uni.getNetworkType({
				success: (res => {
					if (res.networkType != 'none') {
						const api = store.getters['app/apiUrl'];
						uni.request({
							url: api,
							timeout: 3000,
							success: (res) => {
								// console.log(res.statusCode);
								store.commit('app/SET_NETWORK', true);
								resolve(true)
							},
							fail: (error) => {
								console.log('当前网络不可用!', error);
								store.commit('app/SET_NETWORK', false);
								resolve(false)
							}
						});
					} else {
						store.commit('app/SET_NETWORK', false);
						resolve(false)
					}
				}),
				fail: (e => {
					console.log('监听网络状态失败', e)
					store.commit('app/SET_NETWORK', false);
					reject(e)
				})
			});
		})
	},
	/**
	 * 文件上传
	 * @param {Object} tempFilePaths 文件路径
	 * @param {Object} type 类型0--图片，2--音频，3--视频
	 */
	synchrodataFile(tempFilePaths, type, fileType = 0) {
		const user = uni.getStorageSync('userInfo');
		const token = uni.getStorageSync('token');
		const links = uni.getStorageSync('links');
		let timeout = type == 0 ? 5000 : 30000;
		console.log('文件上传超时时间', timeout, user, `${links.getUploadUrl}getUploadUrl`)
		const api = store.getters['app/apiUrl'];
		return new Promise((resolve, reject) => {
			request(`/v2/fms/file/getUploadUrl`).then(e => {
				console.log(api + e.data)
				let uploadUrl = e.data;
				uni.uploadFile({
					url: api + uploadUrl,
					timeout: timeout,
					filePath: tempFilePaths,
					name: 'file',
					formData: {
						'type': type
					},
					header: {
						"Content-Type": "multipart/form-data",
						"X-Swms-Token": token
					},
					success: (res) => {
						if (res.statusCode == 200) {
							let fileData = JSON
								.parse(res
									.data);
							console.log('文件上传成功!',fileData)
							resolve({
								code: 'success',
								url: fileData.data[0].fileId
							})
						} else {
							console.log('上传失败',
								uploadUrl, res)
							resolve({
								code: 'fail',
								url: tempFilePaths
							})
						}
					},
					fail: (error => {
						console.log('上传失败',
							uploadUrl,
							error, tempFilePaths)
						resolve({
							code: 'fail',
							url: tempFilePaths
						})
					})
				});
			})
		})
		// return new Promise((resolve, reject) => {
		// 	uni.request({
		// 		url: `${links.getUploadUrl}/v2/ags/getUploadUrl?currentAddr=${api_ip}`,
		// 		success: (res) => {
		// 			console.log('获取文件上传code成功', res)
		// 			// store.commit('app/SET_NETWORK', true);
		// 			if (res.data.code === 200) {
		// 				let data = res.data.data;
		// 				let uploadUrl = data.httpHost + data.path;
		// 				uni.uploadFile({
		// 					url: uploadUrl,
		// 					timeout: timeout,
		// 					filePath: tempFilePaths,
		// 					name: 'file',
		// 					formData: {
		// 						'type': type
		// 					},
		// 					header: {
		// 						"Content-Type": "multipart/form-data",
		// 						"X-Access-Token": token
		// 					},
		// 					success: (res) => {
		// 						if (res.statusCode == 200) {
		// 							let fileData = JSON
		// 								.parse(res
		// 									.data);
		// 							console.log('文件上传成功!',
		// 								uploadUrl,
		// 								fileData.data)
		// 							resolve({
		// 								code: 'success',
		// 								url: fileData
		// 									.data[0]
		// 									.fileId
		// 							})
		// 						} else {
		// 							console.log('上传失败',
		// 								uploadUrl, res)
		// 							resolve({
		// 								code: 'fail',
		// 								url: tempFilePaths
		// 							})
		// 						}
		// 					},
		// 					fail: (error => {
		// 						console.log('上传失败',
		// 							uploadUrl,
		// 							error, tempFilePaths)
		// 						resolve({
		// 							code: 'fail',
		// 							url: tempFilePaths
		// 						})
		// 					})
		// 				});
		// 			} else {
		// 				reject(res)
		// 			}
		// 		},
		// 		fail(error) {
		// 			console.log('获取文件上传code失败', error)
		// 			if (error.errMsg.includes('request:fail abort statusCode:-1')) {
		// 				// store.commit('app/SET_NETWORK', false);
		// 				resolve({
		// 					code: 'fail',
		// 					url: ''
		// 				})
		// 			}
		// 		},
		// 		complete: (res) => {
		// 			console.log(res, links.getUploadUrl, '文件上传结束!')
		// 		}
		// 	})
		// })
	},
	// 自动同步数据
	synchrodata(data, url) {
		return new Promise((resolve, reject) => {
			uni.request({
				url: this.$config.api + url,
				data: data,
				method: 'POST',
				success: (res) => {
					console.log('同步成功!', res);
					resolve(res)
				},
				fail: (error) => {
					reject(error)
				}
			});
		})
	},
	/**
	 * 提示
	 * @param {Object} content 提示类容
	 * @param {string} type 提示类容
	 */
	toast(content, type = 'none') {
		uni.showToast({
			title: content,
			icon: type
		})
	},
	/**
	 * 图片预览
	 * @param {Object} imgPath 图片地址
	 */
	previewImg(imgPath) {
		console.log('图片预览', imgPath)
		uni.previewImage({
			current: 0,
			urls: [imgPath],
			longPressActions: {
				success: function(data) {
					console.log('选中了第' + (data.tapIndex + 1) + '个按钮,第' + (data.index + 1) + '张图片');
				},
				fail: function(err) {
					console.log(err.errMsg);
				}
			}
		})
	},
	// 二维地图
	/**
	 * @param {Object} context canvas对象
	 * @param {String} src 图片url
	 * @param {Number} w 图片宽度
	 * @param {Number} h 图片高度
	 */
	drawImage(context, src, w, h, coordinate) {
		return new Promise((resolve, reject) => {
			let {
				windowWidth
			} = uni.getSystemInfoSync();
			let imgHeight = (windowWidth / this.actualWidth * this.actualHeight).toFixed(2);
			context.beginPath();
			context.drawImage(src, 0, 0, w, h);
			context.arc(coordinate[0] * windowWidth, coordinate[1] * imgHeight, 10, 0, 2 * Math.PI);
			context.setFillStyle('#aa0000')
			context.fill()
			context.draw(false, (res) => {
				console.log('绘制完成!');
				resolve(res)
			})
		})
	},
	actualWidth: 0,
	actualHeight: 0,
	/**
	 * @param {String} src
	 */
	getImageInfo(src) {
		return new Promise((resolve, reject) => {
			uni.getImageInfo({
				src: src,
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
	previewMap(context, src, coordinate) {
		uni.showLoading({
			title: '加载中...',
			mask: true
		})
		this.getImageInfo(src).then(data => {
			let {
				cw,
				ch
			} = data;
			this.drawImage(context, src, cw, ch, coordinate).then(c => {
				uni.canvasToTempFilePath({
					canvasId: 'canvas',
					success: (res) => {
						uni.previewImage({
							urls: [res.tempFilePath]
						});
						uni.hideLoading()
					},
					fail: (err) => {
						console.error(JSON.stringify(err))
						uni.hideLoading()
					}
				})
			});
		}).catch(err => {
			console.error(JSON.stringify(err))
			this.toast('获取地图信息失败!')
			uni.hideLoading()
		})
	},
	onBeep() {
		const innerAudioContext = uni.createInnerAudioContext();
		innerAudioContext.autoplay = true;
		innerAudioContext.src = '/static/2.mp3';
		innerAudioContext.onPlay(() => {
			console.log('开始播放');
		});
		innerAudioContext.onError((res) => {
			console.log(res.errMsg);
			console.log(res.errCode);
		});
		innerAudioContext.onEnded((res) => {
			innerAudioContext.destroy();
		})
	},
	imageError(e) {
		return '加载失败!'
	}
}

/**  
 * 函数防抖 (只执行最后一次点击)  
 * @param fn  
 * @param delay  
 * @returns {Function}  
 * @constructor  
 */
let timer1 = null; //防抖，  
let timer2 = null; //节流  
export const Debounce = (fn, t) => {
	let delay = t || 500;
	return function() {
		let args = arguments;
		// let timer1 = null  
		// console.log(timer1);  
		if (timer1) {
			clearTimeout(timer1);
		}
		timer1 = setTimeout(() => {
			fn.apply(this, args);
			timer1 = null;
		}, delay);
	}
};