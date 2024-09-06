export default {
	namespaced: true,
	state: {
		// 告警状态
		statusData: {
			0: '未处理',
			1: '处理中',
			2: '已处理',
			3: '已逾期',
		},
		// 告警等级数据
		levelData: uni.getStorageSync('alarmLevelData') ? JSON.parse(uni.getStorageSync('alarmLevelData')) : {},
		// 告警分类数据
		categoryData: uni.getStorageSync('alarmCategoryData') ? JSON.parse(uni.getStorageSync('alarmCategoryData')) : {},
	},
	getters: {},
	mutations: {
		SET_LEVELDATA(state, data) {
			state.levelData = {}
			data.length && data.forEach(item => {
				state.levelData[item.code] = item.name
			})

			uni.setStorageSync('alarmLevelData', JSON.stringify(state.levelData))
		},
		SET_CATEGORYDATE(state, data) {
			state.categoryData = {}
			data.length && data.forEach(item => {
				state.categoryData[item.code] = item.name
			})
			uni.setStorageSync('alarmCategoryData', JSON.stringify(state.categoryData))
		},
	},
}
