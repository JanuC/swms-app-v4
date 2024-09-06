import store from '@/store/index.js';
import appInit from './init.js';
const mqtt = uni.requireNativePlugin('webo_ipis_mqtt');
const notify = uni.requireNativePlugin('webo_ipis_notify');
let msgId = 0;
const {
	deviceId
} = uni.getSystemInfoSync();
export default {
	userInfo: {},
	mqttInit() {
		this.userInfo = store.getters['user/getUserInfo'];
		let links = uni.getStorageSync('links');
		let mqttStr = links.mqtt;
		let replaceStr = mqttStr.replace('tcp://', '').replace('/mqtt', '');
		let mqttIpPort = replaceStr.split(':');
		// let topic1 = `/webo/ipis/task/transfer/${this.userInfo.id}/${this.userInfo.projectId}`;
		// let topic2 = `/webo/ipis/task/transfer/${this.userInfo.id}/result/${this.userInfo.projectId}`;
		let topic1 = `/webo/ipis/task/transfer/${this.userInfo.id}`;
		let topic2 = `/webo/ipis/task/transfer/${this.userInfo.id}/result`;
		let topic3 = `/webo/ipis/loginStatus/confirmation/${this.userInfo.id}`;
		// console.log(topic1, topic2, mqttIpPort, mqttStr);
		return new Promise((resolve) => {
			mqtt.init(mqttIpPort[0], mqttIpPort[1], (data) => {
				// console.log('mqtt', data)
				if (data['topic'] == 'APP_CONNECT_SUCCESS') {
					console.log('连接成功!')
					// 注册监听
					mqtt.addSub(topic1);
					mqtt.addSub(topic2);
					mqtt.addSub(topic3);
					resolve(true)
				} else if (data['topic'] == 'APP_CONNECT_FAIL') {
					console.log('连接失败!')
					resolve(false)
				}
				// 接收消息
				let msg = data['msg'];
				console.log('接收消息', msg);
				if (msg) {
					this.doPublish(`/webo/ipis/mqttack/${this.userInfo.projectId}`, {
						"id": msg.id,
						projectId: this.userInfo.projectId
					});
					appInit.onNewsPush(msg)
				}
			});
		})
	},
	// 发送消息
	doPublish(topic, body) {
		// let msgTime = Date.now();
		// msgId++;
		// let data = {
		// 	"msgId": msgId, // # 消息流水号， 从1开始递增(本期各服务自增加即)
		// 	"msgTime": msgTime, // # 消息发送的utc时间(毫秒)
		// 	"producer": deviceId, // # 消息生产者服务名缩写 "producerAddr": "192.168.3.252:5550" # 消息生产者服务访问地址(一般给http nacos注册的的ip: port)
		// 	"body": body // #自定义消息体
		// }
		// console.log(topic, body)
		mqtt.send(topic, body);
	},
	// 移除监听
	onDestory() {
		mqtt.destory();
		notify.destroy();
		console.log('移除监听')
	},
	// 开启静默告警
	onSwitch(val, time = 2000) {
		console.log('开启静默告警', val, time)
		mqtt.switchAlert(val, time);
	}
}
