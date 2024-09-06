import io from 'socket.io-client';
class socket {
	constructor(mqttUrl) {
		this.init(mqttUrl)
	}

	init(mqttBrokerUrl) {
		// MQTT代理地址

		// 创建Socket.IO连接
		const socket = io(mqttBrokerUrl, {
			transports: ['websocket'] // 使用WebSocket传输
		})

		// 监听连接事件
		socket.on('connect', function() {
			console.log('连接mqtt')
		})

		// 监听接收到消息事件
		socket.on('message', function(topic, message) {
			console.log('接收消息', message)
		})

		// 发布消息
		// socket.emit('publish', {
		// 	topic: 'your-topic',
		// 	message: 'Hello MQTT'
		// })

		// 关闭Socket.IO连接
		socket.on('disconnect', function() {
			console.log('关闭连接')
		})
	}

	doSubscribe(topic) {
		// 订阅主题
		socket.emit('subscribe', topic, function(ack) {
			if (ack) {
				console.log('订阅主题')
			} else {
				console.error('订阅失败')
			}
		})
	}

}

export default socket
