import db from './db.js';
import config from '@/config/index.js'
import store from '@/store/index.js'
import syncFunc from './dataSync.js';
import amap from "./amap.js";
import request from './request.js';
import utils from './index.js';
import {
	generate_UUID
} from "@/common/js/uuid.js";
import moment from 'moment';
import plugin from './androidPlugs.js';
const {
	deviceId
} = uni.getSystemInfoSync();
const notify = uni.requireNativePlugin('webo_ipis_notify');
let interval_1, interval_2, interval_3, payload, userInfo;
let status = true;
let total = 0; //记录上次的本地离线数据
// 创建数据表
const createTable = async () => {
	let options = {
		name: config.dbName,
		path: config.dbPath,
	}
	let isOpenDB = await db.isOpenDB(options);
	if (!isOpenDB) {
		await db.openDB(options);
		createTable();
		return;
	} else {
		let sql = config.sql;
		for (let key in sql) {
			await db.createTable({
				name: config.dbName,
				sql: sql[key]
			});
		}
	}
};
const init = async () => {
	userInfo = store.getters['user/getUserInfo'];
	handleClearInterval();
	notifyInit();
	dataSynchronization();
	gpsReport();
	plugin.mqttInit().then(res => {
		console.log(res)
		if (res) {
			payload = {
				"alarmId": '',
				"userId": userInfo.id,
				"userName": `${userInfo.userName}(${userInfo.deptName})`,
				"phoneNumber": userInfo.phoneNum,
				"macId": deviceId,
				"mapLocation": '',
				"crossBorder": 0,
				"uploadTime": "",
				"type": 1, // -1告警, 1gps
			}
			startGps();
			mqttStart();
			console.log('注册一次init')
			// syncLocalData(); // 定时30s上传本地文件
		}
		let alertChecked = uni.getStorageSync('warn_switch');
		plugin.onSwitch(alertChecked);
	})
	plus.globalEvent.addEventListener('notify_click', function(e) {
		const token = store.getters['user/getToken'];
		if (token) {
			uni.navigateTo({
				url: `/pages/notice/details?id=${e.category}`,
				success: () => {
					console.log('页面跳转')
				},
				fail(error) {
					console.log('跳转失败', error)
				}
			})
		} else {
			uni.navigateTo({
				url: `/pages/user/login`,
			})
		}
	});
}
// GPS上报
const gpsReport = () => {
	amap.getLocation().then(res => {
		payload.crossBorder = res.isCheck ? 1 : 0;
		payload.mapLocation = JSON.stringify(res.mapLocation);
		payload.uploadTime = moment().format('YYYY-MM-DD HH:mm:ss');
		//发送projectId
		payload.projectId = userInfo.projectId;
		// payload.gpsLocation = res.gpsLocation;
		// console.log(payload, 'gps上传')
		// const gpsTopic = '/webo/ipis/user_gps_upload/' + userInfo.projectId;
		const gpsTopic = '/webo/ipis/user_gps_upload';
		plugin.doPublish(gpsTopic, payload);
	}).catch(err => {
		console.log('gps失败', err, payload)
	})
}
// GPS定时上报
const startGps = () => {
	interval_1 = setInterval(() => {
		// console.log('GPS定时上报', interval_1);
		gpsReport();
	}, 6000);
};
const dataSynchronization = () => {
	interval_3 = setInterval(() => {
		// console.log('定时同步', interval_3);
		syncLocalData();
	}, 60000);
}
// mqtt心跳
const mqttStart = () => {
	interval_2 = setInterval(() => {
		// console.log('mqtt心跳', interval_2);
		plugin.doPublish(`/webo/ipis/heartbeat/${userInfo.id}/${userInfo.projectId}`, {
			"userId": userInfo.id,
			"projectId": userInfo.projectId
		});
		getUserLoginStatus();
	}, 12000);
}

const syncLocalData = async () => {
	const userInfo = store.getters['user/getUserInfo'];
	const getReportLoading = store.getters['app/getReportLoading'];
	let isNetwork = await utils.monitorNetwork();
	console.log('定时查询isNetwork', isNetwork, getReportLoading)
	if (isNetwork && !getReportLoading) {
		console.log('开始同步')
		store.commit('app/SET_REPORTLOADING', true)
		let patrolData = await syncFunc.selectPatrolData(userInfo.id);
		console.log('巡检离线数据', patrolData);
		let inspectionData = await syncFunc.selectInspectionData(userInfo.id);
		console.log('巡查离线数据', inspectionData);
		let warningSql =
			`SELECT * FROM ipis_warning WHERE status="-1" AND userid="${userInfo.id}"`;
		let warningData = await db.selectSQL(warningSql);
		console.log('告警离线数据', warningData);
		let reportSql =
			`SELECT * FROM ipis_exception WHERE status="0" AND userid="${userInfo.id}"`;
		let reportData = await db.selectSQL(reportSql);
		console.log('上报离线数据', reportData);
		let taskSql = `SELECT * FROM ipis_task  WHERE userid="${userInfo.id}"`;
		let taskData = await db.selectSQL(taskSql);
		console.log('任务离线数据', taskData);
		if (patrolData.length > 0) {
			await syncFunc.handlePatrolSync();
		} else if (inspectionData.length > 0) {
			await syncFunc.handleInspectionSync();
		} else if (warningData.length > 0) {
			await syncFunc.offlineWarn();
		} else if (reportData.length > 0) {
			await syncFunc.reportException();
		} else if (taskData.length > 0) {
			await syncFunc.taskSubmit();
		}
		console.log('同步结束')
		store.commit('app/SET_REPORTLOADING', false)
	}
}
// 状态栏通知初始化[包含静默告警]
let params = {
	alarmId: '', // APP生成的告警ID, 主要用于告警处理后的消息通知
	reportTime: "", // 上报时间:由APP成功,避免离线情况上报时间不一致
	audioFileId: "", //音频文件ID
	vedioFileId: "", //视频文件ID
	gps: {}
}
const notifyInit = () => {
	notify.init(async (data) => {
		let code = data["code"];
		switch (code) {
			case -1:
				store.commit('app/SET_WARNING', true);
				break;
			case 0:
				// plus.device.getInfo({
				// 	success: function(e) {
				// 		console.log('getDeviceInfo success: ' + JSON.stringify(e));
				// 	},
				// 	fail: function(e) {
				// 		console.log('getDeviceInfo failed: ' + JSON.stringify(e));
				// 	}
				// });
				amap.getLocation().then(res => {
					params.gps = {
						userId: userInfo.id,
						macId: deviceId,
						mapLocation: res.mapLocation,
						crossBorder: res.isCheck ? 1 : 0,
						uploadTime: moment().format('YYYY-MM-DD HH:mm:ss')
					}
					params.alarmId = generate_UUID();
					params.reportTime = moment().format('YYYY-MM-DD HH:mm:ss');
					params.audioFileId = "";
					params.vedioFileId = "";
					let insertSql =
						`INSERT INTO ipis_warning (id, reportTime, location, userid, deviceId, status, gps) VALUES("${params.alarmId}","${params.reportTime}",'${params.gps.mapLocation}',"${userInfo.id}", "${deviceId}", -1, '${JSON.stringify(params.gps)}')`;
					db.executeSQL(insertSql).then(res => {
						params.gps.mapLocation = JSON.stringify(params.gps.mapLocation);
						console.log('触发告警', params);
						syncFunc.reportWarning(0, params);
					})
				})
				break;
			case 1:
				let voice = data["voice"];
				let updateLocalAudio =
					`UPDATE ipis_warning SET localAudio="${voice}" WHERE id="${params.alarmId}"`;
				db.executeSQL(updateLocalAudio).then(async res => {
					await syncFunc.multimediaUpload(voice, 2, params);
				});
				break;
			case 2:
				let video = data["video"];
				let updateLocalVedio =
					`UPDATE ipis_warning SET localVedio="${video}" WHERE id="${params.alarmId}"`;
				let selectSql = `SELECT * FROM ipis_warning WHERE id="${params.alarmId}"`;
				db.executeSQL(updateLocalVedio).then(res => {
					db.selectSQL(selectSql).then(async val => {
						params.audioFileId = val[0].audio;
						await syncFunc.multimediaUpload(video, 3, params);
					})
				});
				break;
			case 3:
				utils.toast('静默告警已提交!');
				let endTime = moment().format('YYYY-MM-DD HH:mm:ss');
				let updateEndState =
					`UPDATE ipis_warning SET endState="1",endTime="${endTime}" WHERE id="${params.alarmId}"`;
				await db.executeSQL(updateEndState);
				store.commit('app/SET_WARNING', false);
				break;
			default:
				break;
		}
		console.log("code====>", data["code"]); //code  0-静默告警已启动，1-音频回调，2-视频回调，3-静默告警已完成
		console.log("voice====>", data["voice"]); //音频路径 code==1时获取，其余状态获取不到
		console.log("video====>", data["video"]); //视频回调  code==2时获取，其余状态获取不到
	});
}
// 推送
const onNewsPush = async (msg) => {
	let m = msg;
	console.log('推送', m)
	if (m.status == -1) {
		uni.showTabBarRedDot({
			index: 1,
			success() {
				console.log('红点成功!')
			},
			fail() {
				console.log('红点失败!')
			}
		})
		store.commit('user/SET_SHOW_DOTS', true);
		let meassage = m.meassage;
		let transfertId = m.transfertId;
		notify.show('文博安全', meassage, transfertId);
	} else if (m.status == 1) {
		if (m.type == 1) {
			let deleteSql = [
				// `DELETE FROM ipis_patrol_list WHERE taskId="${m.taskId}" AND userid="${userInfo.id}"`,
				// `DELETE FROM ipis_patrol_devices WHERE taskId="${m.taskId}" AND userid="${userInfo.id}"`,
				// `DELETE FROM ipis_patrol_items WHERE taskId="${m.taskId}" AND userid="${userInfo.id}"`
				`UPDATE ipis_patrol_list SET status="7" WHERE taskId="${m.taskId}" AND userid="${userInfo.id}"`
			]
			for (let sql of deleteSql) {
				await db.executeSQL(sql).then(res => {
					console.log('转派结束', res)
				})
			}
		} else {
			let deleteSql = [
				// `DELETE FROM ipis_inspection_list WHERE taskId="${m.taskId}" AND userid="${userInfo.id}"`,
				// `DELETE FROM ipis_inspection_locations WHERE taskId="${m.taskId}" AND userid="${userInfo.id}"`
				`UPDATE ipis_inspection_list SET status="7" WHERE taskId="${m.taskId}" AND userid="${userInfo.id}"`
			]
			for (let sql of deleteSql) {
				await db.executeSQL(sql)
			}
		}
	} else if (m.token && m.token != "") {
		const token = uni.getStorageSync('token');
		if (token !== m) {
			handleClearInterval();
			store.commit('user/REMOVE_TOKEN');
			console.log('退出')
			uni.reLaunch({
				url: '/pages/user/login?status=1'
			});
		}
	}
}
// 查询用户是否在其他终端登录
const getUserLoginStatus = () => {
	let {
		id
	} = store.getters['user/getUserInfo'];
	request('/v4/ipis/loginStatus/confirmation', {
		userId: id
	}).then(res => {
		// console.log(res, id)
		if (!res.data) {
			handleClearInterval();
			store.commit('user/REMOVE_TOKEN');
			uni.reLaunch({
				url: '/pages/user/login?status=1'
			});
		}
	}).catch(error => {
		console.log(error)
	})
}
const handleClearInterval = () => {
	clearInterval(interval_1);
	clearInterval(interval_2);
	clearInterval(interval_3);
	plugin.onDestory();
	// console.log('清除定时器!')
}

export default {
	init,
	createTable,
	onNewsPush,
	handleClearInterval
}