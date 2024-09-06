<template>
	<view class="order-info">
		<view class="order-info-top">
			<view class="content-title">
				告警信息
			</view>
			<view class="content-box">
				<view class="content-item">
					<text class="content-item--label">告警时间</text>
					<text class="content-item--value">{{filterTime(alarmInfo.verlayTime)}}</text>
				</view>
				<view class="content-item">
					<text class="content-item--label">告警等级</text>
					<text :class="['level'+alarmInfo.level]"
						class="content-item--value">{{filterLevel(alarmInfo.level)}}</text>
				</view>
				<view class="content-item">
					<text class="content-item--label">告警设备</text>
					<text class="content-item--value">{{alarmInfo.devInfo.name}}</text>
				</view>
				<view class="content-item">
					<text class="content-item--label">告警位置</text>
					<text class="content-item--value">{{alarmInfo.devInfo.orgNameFull}}</text>
				</view>
				<view class="content-item">
					<text class="content-item--label">告警分类</text>
					<text class="content-item--value">{{filterCategory(alarmInfo.category)}}</text>
				</view>
				<view class="content-item">
					<text class="content-item--label">告警内容</text>
					<text class="content-item--value">{{alarmInfo.reason}}</text>
				</view>
				<view class="content-item">
					<text class="content-item--label">告警图片</text>
					<view class="content-item--image">
						<image :src="fileUrl + alarmInfo.devInfo.typeUrl" mode=""></image>
					</view>
				</view>
			</view>
		</view>

		<view v-if="alarmInfo.status == 3" class="order-info-center">
			<view class="content-title">
				处理信息
			</view>
			<view class="content-box">
				<view class="content-item">
					<text class="content-item--label">警情核实</text>
					<text class="content-item--value">{{alarmShapeMap.get(alarmInfo.alarmShape)}}</text>
				</view>
				<view class="content-item">
					<text class="content-item--label">确警时间</text>
					<text class="content-item--value">{{filterLevel(alarmInfo.confirmTime)}}</text>
				</view>
				<view class="content-item">
					<text class="content-item--label">处理方式</text>
					<text class="content-item--value">{{modeMap.get(alarmInfo.mode)}}</text>
				</view>

			</view>
		</view>

		<view class="order-info-bottom">
			<view class="content-title">
				警情图片/视频
			</view>
			<view class="content-box">
				<view class="content-item">
					<text class="content-item--label">图片</text>
					<view class="content-item--image">
						<image :src="fileUrl + alarmInfo.devInfo.typeUrl" mode=""></image>
					</view>
				</view>
				<view class="content-item">
					<text class="content-item--label">视频/音频</text>
					<view class="content-item--image">
						<image :src="fileUrl + alarmInfo.devInfo.typeUrl" mode=""></image>
					</view>
				</view>
			</view>
		</view>

		<view class="order-info-footer">
			<button class="button" @click="toggle('bottom')"><text class="button-text">上传图片/视频</text></button>
		</view>

		<!-- 普通弹窗 -->
		<uni-popup ref="popup" background-color="#fff">
			<view class="popup-content">
				<view @click="upload('image')" class="popup-content-item">
					<uni-file-picker limit="1" :del-icon="false" disable-preview file-mediatype="image">上传图片
					</uni-file-picker>
				</view>
				<view @click="upload('video')" class="popup-content-item">
					<uni-file-picker limit="9" file-mediatype="video" title="最多选择9个视频"></uni-file-picker>
					<!-- 	<uni-file-picker limit="1" :del-icon="false" disable-preview file-mediatype="video">上传视频
					</uni-file-picker> -->
				</view>
				<view @click="clostPopup" class="popup-content-item">
					取消
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script>
	import moment from 'moment';
	export default {
		data() {
			return {
				alarmInfo: {
					"id": "0b901005371e40a5aed82c660da387bd",
					"status": 0,
					"mute": 0,
					"type": 1,
					"reason": "火警（可燃气体、电气火灾报警）",
					"content": "测试告警内容03(改)",
					"shape": 1,
					"devId": "c87a698aeb834337b0f8",
					"category": 2,
					"level": 1,
					"confId": "45504e404ec241f788b10571a358d2aa",
					"linkageDev": "e5450fc28de14bf88816,338cd60a37544edeb9c6,b7553b3d872e4a9ba581,9f25b723ce3340bbab04",
					"verlayTime": 1688547442866,
					"createTime": 1688547442866,
					"alarmCount": 1,
					"confirmTime": null,
					"overdueTime": null,
					"eta": null,
					"devInfo": {
						"id": 1269,
						"devId": "c87a698aeb834337b0f8",
						"name": "171-南回廊栅栏光栅从机防拆",
						"brandId": 1,
						"protocolId": 1,
						"typeId": 418,
						"code": "A0202100021",
						"nfc": "",
						"gbId": "",
						"createTime": 1687807405000,
						"updateTime": 1688006247279,
						"purchaseTime": 0,
						"produceTime": 0,
						"serialPort": 0,
						"ip": "192.168.7.10",
						"port": 8000,
						"user": "admin",
						"password": "bes123456",
						"tag": 1,
						"identifyAddress": 0,
						"index": "171",
						"shelfLife": 0,
						"hostId": "16abe7c9f17e408eac5d",
						"streamCode": 2,
						"ptzEnable": 0,
						"power": 0,
						"remark": "",
						"installTime": 1687780100281,
						"orgId": 252,
						"location": "",
						"picture": "[]",
						"pictureAngle": "[]",
						"longitude": 0,
						"latitude": 0,
						"gatewayId": 20,
						"productId": 0,
						"startPoint": 0,
						"mostUnfavorablePoint": 0,
						"alarmPoint": null,
						"brandName": "海康",
						"typeName": "红外光栅探测器",
						"bigTypeId": 184,
						"bigTypeName": "安防设备",
						"subTypeId": 186,
						"subTypeName": "入侵报警系统",
						"typeUrl": "647efce83474232f96831a85.png",
						"typeIconUrl": "647efcdb3474232f96831a82.png",
						"typeArrowUrl": null,
						"gatewayIp": "127.0.0.1",
						"gatewayHttpPort": 30228,
						"gatewayGrpcPort": null,
						"hostName": "",
						"orgName": "南回廊",
						"orgNameFull": "报恩寺,南回廊",
						"linkDevs": [{
								"linkType": 2,
								"devId": "e5450fc28de14bf88816",
								"name": "都江堰玉磊关-库房球机",
								"streamCode": 1
							},
							{
								"linkType": 2,
								"devId": "338cd60a37544edeb9c6",
								"name": "前台半球",
								"streamCode": 1
							},
							{
								"linkType": 2,
								"devId": "b7553b3d872e4a9ba581",
								"name": "报恩寺远程视频-库房人脸",
								"streamCode": 1
							},
							{
								"linkType": 2,
								"devId": "9f25b723ce3340bbab04",
								"name": "报恩寺远程-库房行政监管",
								"streamCode": 1
							}
						],
						"bindDevId": null,
						"lastCollectionTime": null,
						"status": 0,
						"bypassStatus": 0,
						"defendStatus": 0,
						"doorStatus": 0,
						"patrolTime": 0,
						"patrolStatus": 1,
						"threshold": []
					},
					"linkageDevs": [{
							"id": 70,
							"devId": "9f25b723ce3340bbab04",
							"name": "报恩寺远程-库房行政监管",
							"brandId": 1,
							"protocolId": 1,
							"typeId": 117,
							"code": "A0100100002",
							"nfc": "",
							"gbId": "",
							"createTime": 1686910704000,
							"updateTime": 1688005221572,
							"purchaseTime": 0,
							"produceTime": 0,
							"serialPort": 0,
							"ip": "192.168.4.168",
							"port": 8000,
							"user": "admin",
							"password": "webo6397",
							"tag": 1,
							"identifyAddress": 0,
							"index": "38",
							"shelfLife": 0,
							"hostId": "29f29f9caa674599865a",
							"streamCode": 1,
							"ptzEnable": 0,
							"power": 0,
							"remark": "",
							"installTime": 1688005213011,
							"orgId": 265,
							"location": "",
							"picture": "[]",
							"pictureAngle": "[]",
							"longitude": 0,
							"latitude": 0,
							"gatewayId": 2,
							"productId": 0,
							"startPoint": 0,
							"mostUnfavorablePoint": 0,
							"alarmPoint": null,
							"brandName": "海康",
							"typeName": "半球摄像机",
							"bigTypeId": 184,
							"bigTypeName": "安防设备",
							"subTypeId": 185,
							"subTypeName": "监控视频系统",
							"typeUrl": "647ef7993474232f968319e2.png",
							"typeIconUrl": "647ef6573474232f968319db.png",
							"typeArrowUrl": null,
							"gatewayIp": "192.168.2.228",
							"gatewayHttpPort": 20101,
							"gatewayGrpcPort": null,
							"hostName": "",
							"orgName": "公司监控",
							"orgNameFull": "报恩寺,公司监控",
							"linkDevs": [],
							"bindDevId": null,
							"lastCollectionTime": null,
							"status": 1,
							"bypassStatus": 0,
							"defendStatus": 0,
							"doorStatus": 0,
							"patrolTime": 0,
							"patrolStatus": 0,
							"threshold": []
						},
						{
							"id": 69,
							"devId": "b7553b3d872e4a9ba581",
							"name": "报恩寺远程视频-库房人脸",
							"brandId": 1,
							"protocolId": 1,
							"typeId": 118,
							"code": "A0100100003",
							"nfc": "",
							"gbId": "",
							"createTime": 1686910673000,
							"updateTime": 1688005221582,
							"purchaseTime": 0,
							"produceTime": 0,
							"serialPort": 0,
							"ip": "192.168.4.168",
							"port": 8000,
							"user": "admin",
							"password": "webo6397",
							"tag": 1,
							"identifyAddress": 0,
							"index": "37",
							"shelfLife": 0,
							"hostId": "29f29f9caa674599865a",
							"streamCode": 1,
							"ptzEnable": 0,
							"power": 0,
							"remark": "",
							"installTime": 1688005213011,
							"orgId": 265,
							"location": "",
							"picture": "[]",
							"pictureAngle": "[]",
							"longitude": 0,
							"latitude": 0,
							"gatewayId": 2,
							"productId": 0,
							"startPoint": 0,
							"mostUnfavorablePoint": 0,
							"alarmPoint": null,
							"brandName": "海康",
							"typeName": "枪式摄像机",
							"bigTypeId": 184,
							"bigTypeName": "安防设备",
							"subTypeId": 185,
							"subTypeName": "监控视频系统",
							"typeUrl": "647ef7bf3474232f968319e6.png",
							"typeIconUrl": "647ef7b43474232f968319e3.png",
							"typeArrowUrl": null,
							"gatewayIp": "192.168.2.228",
							"gatewayHttpPort": 20101,
							"gatewayGrpcPort": null,
							"hostName": "",
							"orgName": "公司监控",
							"orgNameFull": "报恩寺,公司监控",
							"linkDevs": [],
							"bindDevId": null,
							"lastCollectionTime": null,
							"status": 1,
							"bypassStatus": 0,
							"defendStatus": 0,
							"doorStatus": 0,
							"patrolTime": 0,
							"patrolStatus": 0,
							"threshold": []
						},
						{
							"id": 68,
							"devId": "338cd60a37544edeb9c6",
							"name": "前台半球",
							"brandId": 1,
							"protocolId": 1,
							"typeId": 117,
							"code": "A0100100001",
							"nfc": "",
							"gbId": "",
							"createTime": 1686910637000,
							"updateTime": 1688005221649,
							"purchaseTime": 0,
							"produceTime": 0,
							"serialPort": 0,
							"ip": "192.168.4.168",
							"port": 8000,
							"user": "admin",
							"password": "webo6397",
							"tag": 1,
							"identifyAddress": 0,
							"index": "35",
							"shelfLife": 0,
							"hostId": "29f29f9caa674599865a",
							"streamCode": 1,
							"ptzEnable": 0,
							"power": 0,
							"remark": "",
							"installTime": 1688005213011,
							"orgId": 265,
							"location": "",
							"picture": "[]",
							"pictureAngle": "[]",
							"longitude": 0,
							"latitude": 0,
							"gatewayId": 2,
							"productId": 0,
							"startPoint": 0,
							"mostUnfavorablePoint": 0,
							"alarmPoint": null,
							"brandName": "海康",
							"typeName": "半球摄像机",
							"bigTypeId": 184,
							"bigTypeName": "安防设备",
							"subTypeId": 185,
							"subTypeName": "监控视频系统",
							"typeUrl": "647ef7993474232f968319e2.png",
							"typeIconUrl": "647ef6573474232f968319db.png",
							"typeArrowUrl": null,
							"gatewayIp": "192.168.2.228",
							"gatewayHttpPort": 20101,
							"gatewayGrpcPort": null,
							"hostName": "",
							"orgName": "公司监控",
							"orgNameFull": "报恩寺,公司监控",
							"linkDevs": [],
							"bindDevId": null,
							"lastCollectionTime": null,
							"status": 1,
							"bypassStatus": 0,
							"defendStatus": 0,
							"doorStatus": 0,
							"patrolTime": 0,
							"patrolStatus": 0,
							"threshold": []
						},
						{
							"id": 45,
							"devId": "e5450fc28de14bf88816",
							"name": "都江堰玉磊关-库房球机",
							"brandId": 1,
							"protocolId": 1,
							"typeId": 120,
							"code": "A0100100001",
							"nfc": "",
							"gbId": "",
							"createTime": 1686237507000,
							"updateTime": 1688005221861,
							"purchaseTime": 0,
							"produceTime": 0,
							"serialPort": 0,
							"ip": "192.168.4.168",
							"port": 8000,
							"user": "admin",
							"password": "webo6397",
							"tag": 1,
							"identifyAddress": 0,
							"index": "39",
							"shelfLife": 0,
							"hostId": "29f29f9caa674599865a",
							"streamCode": 1,
							"ptzEnable": 1,
							"power": 0,
							"remark": "",
							"installTime": 1688005213011,
							"orgId": 265,
							"location": "",
							"picture": "[]",
							"pictureAngle": "[]",
							"longitude": 0,
							"latitude": 0,
							"gatewayId": 2,
							"productId": 0,
							"startPoint": 0,
							"mostUnfavorablePoint": 0,
							"alarmPoint": null,
							"brandName": "海康",
							"typeName": "球型摄像机",
							"bigTypeId": 184,
							"bigTypeName": "安防设备",
							"subTypeId": 185,
							"subTypeName": "监控视频系统",
							"typeUrl": "647ef7f63474232f968319ee.png",
							"typeIconUrl": "647ef7e93474232f968319eb.png",
							"typeArrowUrl": null,
							"gatewayIp": "192.168.2.228",
							"gatewayHttpPort": 20101,
							"gatewayGrpcPort": null,
							"hostName": "",
							"orgName": "公司监控",
							"orgNameFull": "报恩寺,公司监控",
							"linkDevs": [],
							"bindDevId": null,
							"lastCollectionTime": null,
							"status": 1,
							"bypassStatus": 0,
							"defendStatus": 0,
							"doorStatus": 0,
							"patrolTime": 0,
							"patrolStatus": 0,
							"threshold": []
						}
					],
					"resources": []
				},
				alarmShapeMap: new Map([
					[1, '警情'],
					[2, '非警情'],
				]),
				modeMap: new Map([
					[1, '现场处理'],
					[2, '远程核实'],
					[3, '其他处理'],
				]),
			}
		},
		onLoad(options) {
			// let {
			// 	id
			// } = options;
			// console.log(options, '参数')
		},
		computed: {
			fileUrl() {
				return uni.getStorageSync('file_url')
			}
		},
		methods: {
			// 处理时间
			filterTime(time) {
				return moment(new Date(time)).format('YYYY-MM-DD HH:mm:ss')
			},
			// 打开弹窗
			toggle(type) {
				// open 方法传入参数 等同在 uni-popup 组件上绑定 type属性
				this.$refs.popup.open(type)
			},
			clostPopup() {
				this.$refs.popup.close('bottom')
			},
			/**
			 * 上传文件
			 * @param {Object} type image video
			 */
			upload(type) {
				console.log(1111111)
				// this.$refs.popup.close('bottom')
			},

		}
	}
</script>

<style lang="scss" scoped>
	.order-info {
		padding: 20rpx 30rpx;

		>view {
			background-color: #ffffff;
			border-radius: 16rpx;
			margin-bottom: 20rpx;
			padding: 30rpx 30rpx 16rpx 30rpx;

		}

		.order-info-footer {
			padding-bottom: 30rpx;
		}


		.content-title {
			font-family: PingFang-SC-Bold;
			font-size: 28rpx;
			font-weight: normal;
			font-stretch: normal;
			line-height: 35.79rpx;
			letter-spacing: 0rpx;
			color: #333333;
			margin-bottom: 50rpx;
		}

		.content-item {
			display: flex;
			margin-bottom: 20rpx;
			flex-wrap: wrap;

			.content-item--label {
				font-family: PingFang-SC-Medium;
				font-size: 28rpx;
				font-weight: normal;
				font-stretch: normal;
				line-height: 35.79rpx;
				letter-spacing: 0rpx;
				color: #999999;
				margin-right: 30rpx;
			}

			.content-item--value {
				font-family: PingFang-SC-Medium;
				font-size: 28rpx;
				font-weight: normal;
				font-stretch: normal;
				line-height: 35.79rpx;
				letter-spacing: 0rpx;
				color: #333333;

			}

			.content-item--image {
				background-color: #eeeeee;
				width: 100%;
				height: 354rpx;
				display: flex;
				justify-content: center;
				align-items: center;
				margin-top: 20rpx;

				image {
					max-width: 80%;
					max-height: 80%;
				}
			}
		}

		.popup-content {
			background-color: #eee;

			.popup-content-item {
				height: 114rpx;
				text-align: center;
				line-height: 114rpx;
				background: #ffffff;
				font-family: PingFang-SC-Medium;
				font-size: 28rpx;
				font-weight: normal;
				font-stretch: normal;
				letter-spacing: 0rpx;
				color: #333333;
			}

			.popup-content-item:first-child {
				margin-bottom: 2rpx;
			}

			.popup-content-item:last-child {
				height: 166rpx;
				margin-top: 10rpx;
				font-size: 28rpx;
				font-weight: normal;
				font-stretch: normal;
				letter-spacing: 0rpx;
				color: #f33649;
			}
		}
	}
</style>
