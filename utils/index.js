import store from '@/store/index.js';
import request from './request.js';
export default {
	/**
	 * 文件上传
	 * @param {Object} tempFilePaths 文件路径
	 * @param {Object} type 类型0--图片，2--音频，3--视频
	 */
	synchrodataFile(tempFilePaths, type = 0) {
		const api = store.getters['app/apiUrl'];
		const token = uni.getStorageSync('token');
		let timeout = type == 0 ? 5000 : 30000;
		let uploadUrl = api + '/v1/file/add';
		// console.log('文件上传超时时间', timeout, uploadUrl)
		return new Promise((resolve, reject) => {
			uni.uploadFile({
				url: uploadUrl,
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
						let fileData = JSON.parse(res.data);
						console.log('文件上传成功!', fileData)
						resolve({
							code: 'success',
							url: fileData.url
						})
					} else {
						console.log('上传失败', res)
						resolve({
							code: 'fail',
							url: tempFilePaths
						})
					}
				},
				fail: (error) => {
					console.log('上传失败', error)
					resolve({
						code: 'fail',
						url: tempFilePaths
					})
				},
				complete: (e) => {
					console.log(e, '文件上传结束!')
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
	 * @param {Object} imgPaths 图片地址
	 */
	previewImg(imgPaths, current = 0) {
		uni.previewImage({
			current: current,
			urls: imgPaths,
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


	// 计算时间
	countTime(time, type = ':') {
		let Sec = 60;
		let min = 60 * 60;
		let hours = 60 * 60 * 24;

		let text = "";
		let secText = 0;
		let minText = 0;
		let hoursText = 0;

		if (time < Sec) {
			text = type == "'" ? time : text = `00 : 00 : ${countTimeText(time)}`
		} else if (time < min) {
			minText = Math.floor(time / Sec);
			secText = time - (minText * Sec);
			text = type == "'" ? minText + "'" + secText :
				`00 : ${countTimeText(minText)} : ${countTimeText(secText)}`
		} else if (time < hours) {
			hoursText = Math.floor(time / min);
			minText = Math.floor((time - (hoursText * min)) / Sec);
			secText = time - hoursText * min - minText * Sec;
			text = type == "'" ? hoursText + "'" + minText + "'" + secText :
				`${countTimeText(hoursText)} : ${countTimeText(minText)} : ${countTimeText(secText)}`
		}
		return text;
	},

	/**
	 * 文件上传
	 * @param {Object} fileUrl
	 */
	async uploadFile(fileUrl) {

		uni.showLoading({
			title: '资源上传中'
		});

		const api = uni.getStorageSync('api_url');
		const token = uni.getStorageSync('token');

		let uploadUrl = await new Promise((resolve) => {
			request('/v2/fms/file/getUploadUrl').then(res => {
				resolve(res.data.data)
			})
		});

		// 文件上传
		return new Promise((resolve, reject) => {
			uni.uploadFile({
				url: api + uploadUrl, //仅为示例，非真实的接口地址
				filePath: fileUrl,
				name: 'file',
				header: {
					"X-Swms-Token": token
				},
				success: (uploadFileRes) => {
					uni.showToast({
						title: '上传成功',
						icon: 'success'
					})
					resolve(JSON.parse(uploadFileRes.data).data[0]);
				},
				fail(err) {
					console.log('上传失败')
					uni.showToast({
						title: '上传失败',
						icon: 'error'
					})
				},
				complete() {
					uni.hideLoading();
				}
			});
		})

	}

}

function countTimeText(text) {
	return text.toString().length == 1 ? '0' + text : text
}
