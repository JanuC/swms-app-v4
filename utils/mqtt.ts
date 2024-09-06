import mqtt, { MqttClient, QoS } from 'mqtt';

export class MqttApi {
	private connection = {
		clean: true, // 保留会话
		connectTimeout: 6000, // 超时时间
		reconnectPeriod: 6000, // 重连时间间隔
		// 认证信息
		username: '',
		password: '',
		clientId: '', //必穿
	}
	public client: MqttClient | null

	constructor(url: string, name: string, password: string) {
		this.connection.username = name;
		this.connection.password = password;
		this.connection.clientId = 'swms_app:' + Math.random().toString(32).slice(4, 16) + '@' + name;
		this.client = mqtt.connect(url, this.connection);
		this.client.on('connect', () => {
			console.log('连接成功！')
		})
		this.client.on('error', error => {
			console.log('连接失败', error)
		})
		this.client.on('close', () => {
			console.log('断开连接')
		})
		this.client.on('message', (topic, message) => {
			// console.log(`Received message ${message} from topic ${topic}`)
			// let randomCode = Math.random().toString(16).substring(2, 16);
			// store.commit('RECEIVED_MESSAGE', randomCode);
		})

	}

	// 订阅主题
	doSubscribe(options = { topic: '', qos: 2 }) {
		const { topic, qos } = options;
		this.client && this.client.subscribe(topic, {
			qos: qos as QoS,
		}, (error, res) => {
			if (error) {
				console.log('主题订阅错误', error, topic)
			}
		})
	}

	// 取消订阅
	doUnSubscribe(topic: string) {
		this.client && this.client.unsubscribe(topic, (error: any) => {
			if (error) {
				console.log('退订错误', error)
			}
		})
	}

	// 发布消息
	doPublish(publication = { topic: '', qos: 2, payload: '' }) {
		const {
			topic,
			qos,
			payload
		} = publication;
		this.client && this.client.publish(topic, payload, { qos: qos as QoS }, error => {
			if (error) {
				console.log('发布错误', error)
			}
		})
	}

	// 断开连接
	destroyConnection() {
		if (this.client && this.client.connected) {
			try {
				this.client.end()
				this.client = null;
				console.log('断开连接成功！')
			} catch (error: any) {
				console.log('断开连接失败', error.toString())
			}
		}
	}
}

const mqttInstance = (url: string, name: string, password: string) => {
	return new MqttApi(url, name, password)
}

export default mqttInstance;