import store from '@/store';
const request = async (url, data, method = 'GET') => {
	const api = store.getters['app/apiUrl'];
	const token = uni.getStorageSync('token');
	console.log(api + url, '请求地址', token)
	return new Promise((resolve, reject) => {
		uni.request({
			url: api + url,
			data,
			method,
			timeout: 10000,
			header: {
				"X-Swms-Token": token
			},
			success: (res) => {
				console.log(res)
				store.commit('app/SET_NETWORK', true);
				let data = res.data;
				if (res.statusCode === 200) {
					resolve(data)
				} else if (res.statusCode === 401) {
					uni.showToast({
						mask: true,
						icon: 'none',
						title: data.err.info
					})
					// uni.reLaunch({
					// 	url: '/pages/user/login'
					// })
					reject(data)
				} else {
					reject(data)
				}
			},
			fail: (error) => {
				console.log(error);
				if (error.errMsg.includes('request:fail abort statusCode:-1')) {
					store.commit('app/SET_NETWORK', false);
				}
				reject(error)
			}
		})
	})
}
export default request;
