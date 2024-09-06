export default {
	namespaced: true,
	state: {
		fileUrl: '',
	},
	getters: {
		getFileUrl(state) {
			return state.fileUrl
		},
	},
	mutations: {
		SET_FILEURL(state, data) {
			state.fileUrl = data
		},
		
	},
	actions: {}
}
