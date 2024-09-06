<<<<<<< HEAD
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
=======
import utils from "../../utils/index.js"
export default {
	namespaced: true,
	state: {
		api_url: uni.getStorageSync('api_url'),
		inited: false,
		navMenu: [],
		active: '',
		appName: process.env.VUE_APP_NAME || '',
		nfc_data: '',
		api_ip: uni.getStorageSync('api_ip'),
		api_port: uni.getStorageSync('api_port'),
		mqttMsg: '',
		isTimeout: false, // 是否请求超时
		nfcInfo: {
			code: '',
			location: '',
			type: 0,
			id: '',
			name: '',
			deviceId: '',
			preture: '',
			cardNo: ''
		}, // 卡号更换是否选择nfc卡号
		cardInfo: {
			data: [],
			type: 0
		}, //nfc历史更换信息
		netWorkStatus: true, //网络状态/ 判断是否能连接到服务器
		reportLoading: false, // 判断是否在上传本地离线数据
		popupId: '', // 监听弹窗
		popupData: {}, // 弹窗数据
		isWarning: false, // 是否静默告警
		activationNfc: true, // 激活巡检NFC
		inspectionActivationNfc: true, // 激活巡查NFC
		deviceInfo: { // 完成的设备信息
			id: '',
			status: ''
		},
		patrolTask: { // 巡检任务列表信息
			id: '',
			status: '',
			finishNum: 0
		},
		pointInfo: { // 点位信息
			id: '',
			status: ''
		},
		inspectionTask: { // 巡查任务列表信息
			id: '',
			status: '',
			completed: ''
		},
		patrolSyncStatus: false, // 巡检同步状态默认false没有同步,true同步中
	},
	getters: {
		apiUrl(state) {
			return state.api_url
		},
		apiIp(state) {
			return state.api_ip
		},
		apiPort(state) {
			return state.api_port
		},
		nfcData(state) {
			return state.nfc_data
		},
		getMqttMsg(state) {
			return state.mqttMsg
		},
		getGpsPoint(state) {
			return state.gpsPoint;
		},
		getRequestStatus(state) {
			return state.isTimeout
		},
		getNfcInfo(state) {
			return state.nfcInfo
		},
		getNetWork(state) {
			return state.netWorkStatus
		},
		getReportLoading(state) {
			return state.reportLoading
		},
		getPopupId(state) {
			return state.popupId
		},
		getPopupData(state) {
			return state.popupData
		},
		getWarning(state) {
			return state.isWarning
		},
		getActivationNfc(state) {
			return state.activationNfc;
		},
		getDeviceInfo(state) {
			return state.deviceInfo;
		},
		getPatrolTask(state) {
			return state.patrolTask;
		},
		getPointInfo(state) {
			return state.pointInfo;
		},
		getInspectionTask(state) {
			return state.inspectionTask;
		},
		getInspectionActivationNfc(state) {
			return state.inspectionActivationNfc;
		},
		getPatrolSyncStatus(state) {
			return state.patrolSyncStatus;
		}
	},
	mutations: {
		SET_POPUP_ID(state, popupId) {
			state.popupId = popupId;
		},
		SET_POPUP_DATA(state, data) {
			state.popupData = data;
		},
		SET_APP_NAME(state, appName) {
			state.appName = appName
		},
		SET_NAV_MENU(state, navMenu) {
			state.inited = true
			state.navMenu = navMenu
		},
		TOGGLE_MENU_ACTIVE(state, url) {
			state.active = url
		},
		SET_NFC_DATA(state, nfc_data) {
			state.nfc_data = nfc_data
		},
		REMOVE_NFC_DATA(state) {
			state.nfc_data = ''
		},
		SET_API_URL(state, url) {
			state.api_url = url
			uni.setStorageSync('api_url', url);
		},
		SET_API_IP(state, ip) {
			state.api_ip = ip
			uni.setStorageSync('api_ip', ip);
		},
		SET_API_PORT(state, port) {
			state.api_port = port
			uni.setStorageSync('api_port', port);
		},
		SET_MQTT_MSG(state, msg) {
			state.mqttMsg = msg;
		},
		SET_POINTS(state, points) {
			uni.setStorageSync('points', points);
		},
		// 设置请求状态
		SET_IS_TIMEOUT(state, status) {
			state.isTimeout = status
		},
		// 设置nfc卡号
		SET_NFCINFO(state, data) {
			state.nfcInfo = data
		},
		SET_CARDINFO(state, data) {
			state.cardInfo = data
		},
		SET_NETWORK(state, data) {
			state.netWorkStatus = data
		},
		SET_REPORTLOADING(state, data) {
			state.reportLoading = data
		},
		SET_WARNING(state, data) {
			state.isWarning = data
		},
		SET_ACTIVATION_NFC(state, data) {
			state.activationNfc = data
		},
		SET_DEVICE_INFO(state, data) {
			state.deviceInfo = data;
		},
		SET_PATROL_TASK(state, data) {
			state.patrolTask = data;
		},
		SET_POINT_INFO(state, data) {
			console.log('巡查点', data)
			state.pointInfo = data;
		},
		SET_INSPECTION_TASK(state, data) {
			console.log('巡查任务', data)
			state.inspectionTask = data;
		},
		SET_INSPECTION_ACTIVATION_NFC(state, data) {
			state.inspectionActivationNfc = data;
		},
		SET_PATROL_SYNC_STATUS(state, data) {
			state.patrolSyncStatus = data;
		}
	},
	actions: {
		setAppName({
			commit
		}, appName) {
			commit('SET_APP_NAME', appName)
		},
		setNfcData({
			commit
		}, nfc_data) {
			commit('SET_NFC_DATA', nfc_data)
		},
		setIsTimeout({
			commit
		}, status) {
			commit('SET_IS_TIMEOUT', status)
		},
>>>>>>> origin/swms-itps
	}
}
