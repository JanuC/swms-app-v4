const request = async (url, data, method = 'GET') => {

	const api = uni.getStorageSync('api_url');
	const token = uni.getStorageSync('token');
	
	console.log('请求地址', api + url, '参数', data)
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
				if (res.statusCode == 200) {
					resolve(res)
				} else {
					reject(res)
				}
			},
			fail: (error) => {
				console.log(error);
				reject(error)
			},
		})
	})
}
export default request;
