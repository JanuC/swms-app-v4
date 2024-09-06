const mqtt = require('mqtt/dist/mqtt.js');
import {
	generate_UUID
} from "@/common/js/uuid.js"
import store from '@/store/index.js';
import amap from './amap.js';
import db from './db.js';
import init from './init.js';
export default {
	client: {
		connected: false,
	},
	subscribeSuccess: false,
	// 创建连接
	createConnection() {
		return new Promise((resolve, reject) => {
			let user = store.getters['user/getUserInfo'];
			let links = uni.getStorageSync('links');
			let connection = {
				clean: true, // 保留会话
				connectTimeout: 4000, // 超时时间
				reconnectPeriod: 4000, // 重连时间间隔
				clientId: 'IPIS_APP' + user.id,
				username: 'admin',
				password: 'Webogit2501',
				will: {
					topic: `/webo/ipis/heartbeat/${user.id}/${user.projectId}`,
					payload: `{"userId":${user.id}}`,
					qos: 2
				}
			}
			const {
				...options
			} = connection
			const connectUrl = links.mqttWx;
			try {
				this.client = mqtt.connect(connectUrl, options);
				this.client.on('connect', () => {
					this.doSubscribe();
					amap.getLocation().then(res => {
						this.doPublish(res)
					})
					resolve(true)
				})
				this.client.on('reconnect', error => {
					console.log('正在重新连接...', error)
					reject(error)
				})
				this.client.on('error', error => {
					console.log('连接失败', error)
					reject(error)
				})
				this.client.on('message', async (topic, msg) => {
					store.commit('app/SET_MQTT_MSG', msg);
					console.log(msg);
					let m = JSON.parse(msg);
					let publication = {
						topic: `/webo/ipis/mqttack/${user.id}/${user.projectId}`,
						qos: 2,
						payload: `{"id":${m.id}, 'projectId': ${user.projectId}}`
					}
					init.onNewsPush(msg);
					this.doPublish(publication)
					// if (m.status == -1) {
					// 	let meassage = m.meassage;
					// 	let transfertId = m.transfertId;
					// 	console.log(meassage, transfertId)
					// 	notify.show('文博安全', meassage, transfertId);
					// } else {
					// 	console.log(m)
					// 	if (m.type == 1) {
					// 		let deleteSql = [
					// 			`DELETE FROM ipis_patrol_list WHERE taskId="${m.taskId}" AND userid="${user.id}"`,
					// 			`DELETE FROM ipis_patrol_devices WHERE taskId="${m.taskId}" AND userid="${user.id}"`,
					// 			`DELETE FROM ipis_patrol_items WHERE taskId="${m.taskId}" AND userid="${user.id}"`
					// 		]
					// 		for (let sql of deleteSql) {
					// 			await db.executeSQL(sql)
					// 		}
					// 	} else {
					// 		let deleteSql = [
					// 			`DELETE FROM ipis_inspection_list WHERE taskId="${m.taskId}" AND userid="${user.id}"`,
					// 			`DELETE FROM ipis_inspection_locations WHERE taskId="${m.taskId}" AND userid="${user.id}"`
					// 		]
					// 		for (let sql of deleteSql) {
					// 			await db.executeSQL(sql)
					// 		}
					// 	}
					// }
				})
			} catch (error) {
				console.log('mqtt.connect error', error)
			}
		})
	},
	// 订阅主题
	doSubscribe() {
		// 任务转派通知/webo/ipis/task/transfer/[userId]
		// 任务转派结果通知/webo/ipis/task/transfer/[userId]/result
		let user = store.getters['user/getUserInfo'];
		let topic1 = `/webo/ipis/task/transfer/${user.id}/${user.projectId}`;
		let topic3 = {};
		topic3[topic1] = {
			qos: 2
		};
		let topic2 = `/webo/ipis/task/transfer/${user.id}/result/${user.projectId}`;
		let topic4 = {};
		topic4[topic2] = {
			qos: 2
		};
		let topic = {
			...topic3,
			...topic4
		};
		try {
			this.client.subscribe(topic, (error, res) => {
				if (error) {
					console.log('订阅主题错误', error)
					return
				}
				this.subscribeSuccess = true
				console.log('订阅主题资源', res)
			})
		} catch (error) {
			console.log('订阅主题错误1', error)
		}
	},
	// 取消订阅
	doUnSubscribe(subscription) {
		try {
			const {
				topic
			} = subscription;
			this.client.unsubscribe(topic, error => {
				if (error) {
					console.log('退订错误', error)
				}
			})
		} catch (error) {
			console.log('退订错误1', error)
		}
	},
	// 发布消息
	doPublish(publication) {
		try {
			const {
				topic,
				qos,
				payload
			} = publication;
			this.client.publish(topic, JSON.stringify(payload), error => {
				if (error) {
					console.log('发布失败', error)
				}
				console.log('发布成功')
			})
		} catch (error) {
			console.log('发布失败', error)
		}
	},
	// 断开连接
	destroyConnection() {
		if (this.client.connected) {
			try {
				this.client.end()
				this.client = {
					connected: false,
				}
				console.log('断开连接成功！')
			} catch (error) {
				console.log('断开连接失败', error.toString())
			}
		}
	}
}
