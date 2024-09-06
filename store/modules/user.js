export default {
	namespaced: true,
	state: {
		token: uni.getStorageSync('token'),
		tokenExpired: uni.getStorageSync('token_expired'),
		userInfo: uni.getStorageSync('userInfo'),
		showDots: uni.getStorageSync('showDots'),
	},
	getters: {
		isTokenValid(state) {
			return !!state.token && state.tokenExpired > Date.now()
		},
		getUserInfo(state) {
			return state.userInfo
		},
		getMenuData(state) {
			return state.userInfo.menuView
		},
		getToken(state) {
			return state.token
		},
		getShowDots(state) {
			return state.showDots
		}
	},
	mutations: {
		SET_TOKEN: (state, {
			token,
			tokenExpired
		}) => {
			state.token = token
			state.tokenExpired = tokenExpired
			uni.setStorageSync('token', token)
			uni.setStorageSync('token_expired', tokenExpired)
		},
		REMOVE_TOKEN: (state) => {
			state.token = ''
			state.tokenExpired = 0
			state.userInfo = {}
			uni.removeStorageSync('token')
			uni.removeStorageSync('token_expired')
			uni.removeStorageSync('userInfo')
		},
		SET_USER_INFO: (state, userInfo) => {
			state.userInfo = userInfo
			uni.setStorageSync('userInfo', userInfo)
		},
		SET_SHOW_DOTS: (state, val) => {
			console.log('SET_SHOW_DOTS', val);
			uni.setStorageSync('showDots', val);
			state.showDots = val;
		}
	},
	actions: {
		setShowDots({
			commit
		}, val) {
			commit('SET_SHOW_DOTS', val)
		},
	}
}
