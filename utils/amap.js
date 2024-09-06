import store from '@/store/index.js';
import moment from 'moment';
const amap = {
	map: null,
	showPopup: true,
	fenceTime: 0,
	// 创建地图控件
	createMap() {
		return new Promise((resolve, reject) => {
			if (!this.map) {
				this.map = plus.maps.create('map', {
					top: '100px',
					left: '0px',
					width: '100%',
					height: '200px',
					position: 'static'
				});
				plus.webview.currentWebview().append(this.map);
			}
			resolve(this.map)
		})
	},
	// 计算距离
	distanceCalculation(point1, point2) {
		return new Promise((resolve, reject) => {
			point1 = new plus.maps.Point(point1[0], point1[1]);
			point2 = new plus.maps.Point(point2[0], point2[1]);
			plus.maps.Map.calculateDistance(point1, point2, (event) => {
				let distance = event.distance; // 转换后的距离值
				resolve(distance)
			}, (e) => {
				console.log("Failed:" + JSON.stringify(e));
				resolve(0)
			});
		})
	},
	// 定位电子围栏
	// {
	// 	"type": "gcj02",
	// 	"altitude": 0, // 高度，单位 m
	// 	"latitude": 30.393796, // 纬度，
	// 	"longitude": 104.07726, // 经度
	// 	"speed": 0, // 速度，浮点数，单位m/s
	// 	"accuracy": 25, // 位置的精确度
	// 	"errMsg": "getLocation:ok"
	// }
	getLocation() {
		return new Promise((resolve, reject) => {
			let gps_point = uni.getStorageSync('gps_point');
			let gpsPoint = gps_point ? gps_point.mapLocation : [];
			uni.getLocation({
				type: 'gcj02',
				highAccuracyExpireTime: 3500, // 高精度定位超时时间(ms)，指定时间内返回最高精度，该值3000ms以上高精度定位才有效果
				isHighAccuracy: true, // 开启高精度定位
				timeout: 15,
				success: (res) => {
					// console.log('定位成功', res)
					let isCheck = false;
					let mapLocation = [res.longitude, res.latitude];
					let gpsLocation = {
						x: res.longitude, // 经度
						y: res.latitude, // 纬度
						tm: moment().format('YYYY-MM-DD HH:mm:ss'), // 定位时间
						sp: res.speed, // 速度，浮点数，单位m/s
						ag: JSON.stringify(res)
					}
					let gpsInfo = {
						time: Date.now(),
						mapLocation,
						gpsLocation
					}
					uni.setStorageSync('gps_point', gpsInfo);
					// let distance = await this.distanceCalculation(gpsPoint, mapLocation);
					let storagePoints = uni.getStorageSync('points');
					let polygons = storagePoints ? JSON.parse(storagePoints) : [];
					if (polygons.length) {
						let points = polygons.map(item => {
							// return this.bd2gcjString(item[0], item[1])
							return {
								longitude: item[0],
								latitude: item[1]
							}
						})
						let point = {
							longitude: res.longitude,
							latitude: res.latitude
						}
						let polygonObj = new plus.maps.Polygon(points);
						isCheck = this.IsPtInPoly(point, polygonObj);
						if (!isCheck) {
							let t = Date.now() - this.fenceTime;
							if (t >= 600000) {
								this.fenceTime = Date.now();
								if (this.showPopup) {
									uni.navigateTo({
										url: '/pages/popup/warning-popup',
										events: {
											// 为指定事件添加一个监听器，获取被打开页面传送到当前页面的数据
											someEvent: (data) => {
												this.showPopup = true;
											}
										},
										success: (res) => {
											this.showPopup = false;
											res.eventChannel.emit(
												'acceptDataFromOpenerPage', {
													data: true
												})
										}
									})
								}
							}
						} else {
							if (!this.showPopup) {
								this.showPopup = true;
								uni.navigateBack()
							}
						}
					}
					resolve({
						isCheck,
						mapLocation,
						gpsLocation
					})
				},
				fail: (err) => {
					console.log('定位失败', err)
					// 0-关闭在线地图 1-开启在线地图
					let online_map_enable = uni.getStorageSync('links').online_map_enable;
					if (online_map_enable === 1 || online_map_enable === undefined) {
						reject({
							isCheck: false,
							mapLocation: gpsPoint ? gpsPoint : [],
							gpsLocation: null
						})
					} else {
						resolve({
							isCheck: false,
							mapLocation: gpsPoint ? gpsPoint : [],
							gpsLocation: null
						})
					}
				}
			});
		})
	},
	// 判断是否在多边形内部
	IsPtInPoly(o, l) {
		let t = l.getPath();
		// let t = l;
		let h = t.length;
		let n = true;
		let j = 0;
		let g = 2e-10;
		let s, q;
		let e = o;
		s = t[0];
		for (let f = 1; f <= h; ++f) {
			if (e == s) {
				return n;
			}
			q = t[f % h];
			if (e.latitude < Math.min(s.latitude, q.latitude) || e.latitude > Math.max(s.latitude, q.latitude)) {
				s = q;
				continue;
			}
			if (e.latitude > Math.min(s.latitude, q.latitude) && e.latitude < Math.max(s.latitude, q.latitude)) {
				if (e.longitude <= Math.max(s.longitude, q.longitude)) {
					if (s.latitude == q.latitude && e.longitude >= Math.min(s.longitude, q.longitude)) {
						return n;
					}
					if (s.longitude == q.longitude) {
						if (s.longitude == e.longitude) {
							return n;
						} else {
							++j;
						}
					} else {
						let r = ((e.latitude - s.latitude) * (q.longitude - s.longitude)) / (q.latitude - s
							.latitude) + s.longitude;
						if (Math.abs(e.longitude - r) < g) {
							return n;
						}
						if (e.longitude < r) {
							++j;
						}
					}
				}
			} else {
				if (e.latitude == q.latitude && e.longitude <= q.longitude) {
					let m = t[(f + 1) % h];
					if (e.latitude >= Math.min(s.latitude, m.latitude) && e.latitude <= Math.max(s.latitude, m
							.latitude)) {
						++j;
					} else {
						j += 2;
					}
				}
			}
			s = q;
		}
		if (j % 2 == 0) {
			return false;
		} else {
			return true;
		}
	},
	bd2gcjString(latitude, longitude) {
		let x_pi = (3.14159265358979324 * 3000.0) / 180.0;
		let x = latitude - 0.0065,
			y = longitude - 0.006;
		let z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * x_pi);
		let theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * x_pi);
		return new plus.maps.Point(z * Math.cos(theta), z * Math.sin(theta));
	}
}
export default amap;