class socket {
	constructor(url) {
		// 创建WebSocket连接
		uni.connectSocket({
			url: url,
			success() {
				console.log('连接成功')
			},
			fail(error) {
				console.error('连接失败', error)
			}
		})

		// 监听WebSocket连接成功事件
		uni.onSocketOpen(function() {
			console.log('监听连接')
			// // 发送消息
			// uni.sendSocketMessage({
			// 	data: 'Hello WebSocket',
			// 	success() {
			// 		console.log('Message sent')
			// 	},
			// 	fail(error) {
			// 		console.error('Failed to send message:', error)
			// 	}
			// })
		})

		uni.onSocketError(function(res) {
			console.log('WebSocket连接打开失败，请检查！');
		});

		// 监听WebSocket接收到消息事件
		uni.onSocketMessage(function(res) {
			console.log('消息', res.data)
		})

		// 监听WebSocket连接关闭事件
		uni.onSocketClose(function() {
			console.log('关闭连接')
		})
	}
	close() {
		// 关闭WebSocket连接
		uni.closeSocket()
	}
}

export default socket;
