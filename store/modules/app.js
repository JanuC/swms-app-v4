export default {
	namespaced: true,
	state: {
	},
	getters: {
		apiUrl(state) {
			return uni.getStorageSync('api_url')
		},
		apiIp(state) {
			return uni.getStorageSync('api_ip')
		},
		apiPort(state) {
			return uni.getStorageSync('api_port')
		},
	},
	mutations: {
		SET_API_URL(state, url) {
			uni.setStorageSync('api_url', url);
		},
		SET_API_IP(state, ip) {
			uni.setStorageSync('api_ip', ip);
		},
		SET_API_PORT(state, port) {
			uni.setStorageSync('api_port', port);
		}
	},
	actions: {
	}
}
