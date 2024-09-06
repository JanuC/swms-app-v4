import utils from './index.js';
import db from './db.js';
import store from '@/store/index.js';
import request from "./request.js";
import moment from 'moment';
import amap from "./amap.js";
import {
	generate_UUID
} from "../common/js/uuid.js"
export default {
	/**
	 * 同步巡查列表
	 * @param {Number} status 任务状态
	 */
	syncListData(status, page = 1, pageSize = 10) {
		pageSize = (status == 0 || status == 3) ? 100 : 10;
		return new Promise((resolve, reject) => {
			request(`/v1/inspection/task/getAppTaskList`, {
				status,
				page,
				pageSize
			}).then(async res => {
				const {
					data
				} = res;
				// if (code === 200) {
				console.log('在线巡查列表', data)
				let user = store.getters['user/getUserInfo'];
				if (data.length > 0) {
					for (let item of data) {
						let selectSql =
							`SELECT * from ipis_inspection_list where taskId="${item.id}"`;
						let task = await db.selectSQL(selectSql);
						if (task.length > 0) {
							console.log('巡查更新列表数据')
							let completed = item.patrol.filter(item => {
								return item.status != 0;
							});
							// 更新列表数据
							let updateSql =
								`UPDATE ipis_inspection_list SET status="${item.status}",completed="${completed.length}",userid="${user.id}" WHERE taskId="${item.id}"`;
							await db.executeSQL(updateSql);
							// 更新点位地图数据
							for (let patrol of item.patrol) {
								let fileStatus = patrol.sitePhotos.length > 0 ? 1 : -
									1;
								if (patrol.sitePhotos.length > 0) {
									fileStatus = 1;
								} else {
									fileStatus = -1;
								}
								let updateLocationsSql =
									`UPDATE ipis_inspection_locations SET map='${JSON.stringify(patrol.map)}',status="${patrol.status}",sitePhotos='${JSON.stringify(patrol.sitePhotos)}',time="${patrol.time}",incompleteReason="${patrol.incompleteReason}",fileStatus="${fileStatus}",userid="${user.id}" WHERE taskId="${item.id}" AND pointId="${patrol.id}"`;
								await db.executeSQL(updateLocationsSql);
							}
						} else {
							// 保存列表数据
							console.log('巡查保存列表数据')
							let completed = item.patrol.filter(item => {
								return item.status != 0;
							});
							let listUuid = generate_UUID();
							let insertSql =
								`INSERT INTO ipis_inspection_list values("${listUuid}","${item.id}","${item.taskNumber}","${item.createTime}","${item.deadline}","${item.name}",'${JSON.stringify(item.frequency)}',"${item.status}", "-1","${item.type}","${completed.length}","${item.patrol.length}","${user.id}","${item.takePhotos}")`;
							await db.executeSQL(insertSql);
							// 保存巡查点数据
							item.patrol.forEach(async point => {
								let pointUuid = generate_UUID();
								let fileStatus = point.sitePhotos.length > 0 ? 1 : -
									1;
								if (point.sitePhotos.length > 0) {
									fileStatus = 1;
								} else {
									fileStatus = -1;
								}
								let pointInsertSql =
									`INSERT INTO ipis_inspection_locations values("${pointUuid}","${point.id}","${point.name}","${point.location}","${point.weight}","${point.nfc}","${point.filePath}","","${fileStatus}","","","${point.time}","${point.status}","${point.incompleteReason}",'${JSON.stringify(point.map)}',"${user.id}","${point.taskId}","[]","-1","${point.delTag}", '${JSON.stringify(point.sitePhotos)}', '0')`;
								await db.executeSQL(pointInsertSql);
							})
						}
					}
				}
				if (status == 0 && page == 1) {
					let selectSql =
						`SELECT * from ipis_inspection_list where userid="${user.id}" AND status="${status}"`;
					let allTask = await db.selectSQL(selectSql);
					for (let t of allTask) {
						let d = data.some(item => t.taskId == item.id);
						if (!d) {
							console.log("status=-1")
							let updateSql =
								`UPDATE ipis_inspection_list SET status="-1" WHERE taskId="${t.taskId}" AND userid="${user.id}"`;
							await db.executeSQL(updateSql);
						}
					}
				}
				if (status == 3 && page == 1) {
					let selectSql =
						`SELECT * from ipis_inspection_list where userid="${user.id}" AND status="${status}"`;
					let allTask = await db.selectSQL(selectSql);
					for (let t of allTask) {
						let d = data.some(item => t.taskId == item.id);
						if (!d) {
							let updateSql =
								`DELETE FROM ipis_inspection_list WHERE taskId="${t.taskId}" AND userid="${user.id}"`;
							await db.executeSQL(updateSql);
						}
					}
				}
				resolve(true)
				// }
			}).catch(err => {
				console.log(err)
				reject(err)
			})
		})
	},
	// 巡查离线数据查询
	selectInspectionData(id) {
		return new Promise((resolve, reject) => {
			let selectSql =
				`SELECT iil.pointId as id, iil.sitePhotos as sitePhotos, iil.localFilePath as localFilePath, iil.fileStatus as fileStatus, iil.time as time, iil.taskId as taskId, iil.status as status, iil.incompleteReason as incompleteReason, iil.onlineGps as onlineGps, iil.timely as timely, iil.name as name FROM ipis_inspection_locations iil where userid="${id}" AND localStatus="0"`;
			db.selectSQL(selectSql).then(res => {
				resolve(res)
			}).catch(err => {
				reject(err)
			})
		})
	},
	// 巡查上传文件
	async inspectionFileUpload(id) {
		return new Promise((resolve, reject) => {
			this.selectInspectionData(id).then(async data => {
				if (data.length > 0) {
					let fileData = data.filter(item => {
						return item.fileStatus == 0;
					});
					if (fileData.length > 0) {
						for (let item of fileData) {
							await utils.synchrodataFile(item.localFilePath, 0).then(
								async res => {
									console.log('巡查上传文件', res)
									// 上传成功更新一下数据库
									if (res.code == 'success') {
										let sitePhotos = [];
										sitePhotos.push(res.url);
										let updatePointSql =
											`UPDATE ipis_inspection_locations SET fileStatus="1", sitePhotos='${JSON.stringify(sitePhotos)}' WHERE pointId="${item.id}" AND userid="${id}" AND taskId="${item.taskId}"`;
										await db.executeSQL(updatePointSql);
									}
								})
						}
						resolve(true)
					} else {
						resolve(true)
					}
				} else {
					resolve(true)
				}
			})
		})
	},
	// 巡查离线数据同步
	inspectionSync(id) {
		return new Promise((resolve, reject) => {
			this.selectInspectionData(id).then(async data => {
				if (data.length > 0) {
					let taskId = data.map(item => item.taskId);
					let _taskId = Array.from(new Set(taskId));
					let tasks = [];
					_taskId.forEach((taskId, index) => {
						let filterPoints = data.filter(item => item.taskId == taskId);
						tasks.push({
							id: taskId,
							patrol: []
						})
						filterPoints.forEach(item => {
							item.sitePhotos = JSON.parse(item.sitePhotos);
							tasks[index].patrol.push(item);
						});
					})
					console.log('巡查数据同步', tasks)
					if (tasks.length > 0) {
						await request('/v1/inspection/task/commitAppTaskList', tasks, 'POST').then(
							res => {
								// if (res.code === 200) {
								console.log('巡查数据同步成功', res.data)
								res.data.forEach(async item => {
									let updatePointSql =
										`UPDATE ipis_inspection_locations SET localStatus="1" WHERE taskId="${item.id}" AND pointId="${item.dotId}" AND userid="${id}"`;
									await db.executeSQL(updatePointSql);
								})
								resolve(true)
								// } else {
								// 	console.log('1.巡查数据同步失败', res)
								// 	reject(res)
								// }
							}).catch(error => {
							console.log('2.巡查数据同步失败', error)
							tasks.forEach(async item => {
								let updateTimely =
									`UPDATE ipis_inspection_locations SET timely="1" WHERE pointId="${item.id}" AND pointId="${item.dotId}" AND userid="${id}"`;
								await db.executeSQL(updateTimely);
							})
							reject(error)
						})
					} else {
						resolve(true)
					}
				} else {
					resolve(true)
				}
			})
		})
	},
	// 处理巡查同步
	async handleInspectionSync() {
		let {
			id
		} = store.getters['user/getUserInfo'];
		let isNetwork = await utils.monitorNetwork();
		return new Promise(async (resolve, reject) => {
			console.log('处理巡查同步', isNetwork)
			if (isNetwork) {
				this.inspectionFileUpload(id).then(data => {
					this.inspectionSync(id).then(async res => {
						await this.taskSubmit();
						resolve(res)
					}).catch(async error => {
						reject(error)
					})
				})
			} else {
				this.selectInspectionData(id).then(data => {
					console.log(data)
					data.forEach(async item => {
						let updateTimely =
							`UPDATE ipis_inspection_locations SET timely="1" WHERE pointId="${item.id}" AND userid="${id}"`;
						await db.executeSQL(updateTimely);
					});
					reject(false)
				})
			}
		})
	},
	// 任务提交
	async taskSubmit() {
		let user = store.getters['user/getUserInfo'];
		let selectSql = `SELECT * FROM ipis_task`
		let task = await db.selectSQL(selectSql);
		console.log('任务提交', task)
		if (task.length > 0) {
			for (let item of task) {
				request(`/v1/inspection/task/stateConfirm`, {
					"id": item.taskId,
					"type": item.type,
					"time": item.time
				}, 'POST').then(async res => {
					let {
						code,
						data
					} = res;
					console.log('任务提交成功', res, data)
					// if (code === 200) {
					let deleteSql =
						`DELETE FROM ipis_task WHERE taskId="${data}" AND userid="${user.id}"`;
					await db.executeSQL(deleteSql);
					// }
				}).catch(error => {
					console.log(error)
				})
			}
		}
	},
	// 处理打卡
	async handleInspectionPoint(data) {
		uni.showLoading({
			title: '打卡中...',
			mask: true
		});
		return new Promise(async (resolve, reject) => {
			// 0-关闭在线地图 1-开启在线地图
			// let online_map_enable = uni.getStorageSync('links').online_map_enable;
			// if (online_map_enable === 1 || online_map_enable === undefined) {
				amap.getLocation().then(async res => {
					data.time = moment().format('YYYY-MM-DD HH:mm:ss');
					data.localStatus = 0;
					data.onlineGps = JSON.stringify(res.mapLocation);
					await this.updatePoint(data);
					await this.handleInspectionSync().then(res => {
						console.log('完成!')
					}).catch(error => {
						console.log('失败!', error)
					});
					utils.toast('成功!');
					uni.hideLoading();
					resolve()
				}).catch(error => {
					utils.toast('打卡失败!请检查网络或GPS是否正常.');
					uni.hideLoading();
					reject()
				})
			// } else {
			// 	let mapData = await amap.getLocation();
			// 	console.log(mapData, 1)
			// 	data.time = moment().format('YYYY-MM-DD HH:mm:ss');
			// 	data.localStatus = 0;
			// 	data.onlineGps = JSON.stringify(mapData.mapLocation);
			// 	console.log('离线-1', data)
			// 	console.log('离线-2', mapData)
			// 	await this.updatePoint(data);
			// 	await this.handleInspectionSync().then(res => {
			// 		console.log('完成!')
			// 	}).catch(error => {
			// 		console.log('失败!', error)
			// 	});
			// 	utils.toast('成功!');
			// 	uni.hideLoading();
			// 	resolve()
			// }
		})
	},
	// 更新打卡
	async updatePoint(data) {
		let user = store.getters['user/getUserInfo'];
		let {
			id,
			taskId,
			localFilePath,
			fileStatus,
			time,
			status,
			incompleteReason,
			onlineGps,
			localStatus,
			sitePhotos
		} = data;
		let updatePointSql =
			`UPDATE ipis_inspection_locations SET localFilePath="${localFilePath}", fileStatus="${fileStatus}", time="${time}",status="${status}",incompleteReason="${incompleteReason}",onlineGps="${onlineGps}",localStatus="${localStatus}",commitPersonId="${user.id}",commitPerson="${user.userName}",sitePhotos='${JSON.stringify(sitePhotos)}' WHERE id="${id}" AND userid="${user.id}"`;
		await db.executeSQL(updatePointSql);
		let selsetSql = `SELECT * FROM ipis_inspection_locations WHERE taskId="${taskId}" AND userid="${user.id}"`;
		let taskLocations = await db.selectSQL(selsetSql);
		let locations = taskLocations.filter(item => item.status != 0);
		let completed = locations.length;
		let updateTaskSql =
			`UPDATE ipis_inspection_list SET completed="${completed}", localStatus="0" WHERE taskId="${taskId}" AND userid="${user.id}"`;
		await db.executeSQL(updateTaskSql);
		console.log('更新打卡数据')
		store.commit('app/SET_POINT_INFO', {
			id,
			status
		});
	},
	// 判断能否巡查打卡
	/**
	 * @param {Object} frequency 班次数据 数组
	 * @param {Object} type 类型
	 * @param {Object} weight 当前顺序
	 * @param {Object} status 前一个状态
	 */
	async isPunchcard(frequency, type, weight, status, SubNVueId) {
		let isTime = false;
		if (frequency.length > 0) { // 有班次
			for (let s of frequency) {
				let t = s.split('-')
				if (t[0] && t[1]) {
					isTime = await this.isDuringDate(t[0], t[1]);
				}
				if (isTime) {
					break;
				}
			}
			if (isTime) {
				if (type == 1) { // 有序巡查
					if (weight > 0 && status == 0) {
						let uuid = generate_UUID();
						store.commit('app/SET_POPUP_ID', uuid);
						let params = {
							content: '请按正确的顺序完成巡查',
							affirmButtonText: '知道了'
						}
						store.commit('app/SET_POPUP_DATA', params);
						uni.getSubNVueById(SubNVueId).show('zoom-fade-out', 250);
						store.commit('app/REMOVE_NFC_DATA');
						return false;
					} else {
						return true;
					}
				} else if (type == 0) {
					return true;
				} else {
					utils.toast('巡查类型错误');
					return false;
				}
			} else {
				let uuid = generate_UUID();
				store.commit('app/SET_POPUP_ID', uuid);
				let params = {
					content: '不在当前班次',
					affirmButtonText: '知道了'
				}
				store.commit('app/SET_POPUP_DATA', params);
				uni.getSubNVueById(SubNVueId).show('zoom-fade-out', 250);
				store.commit('app/REMOVE_NFC_DATA');
				return false;
			}
		} else { // 无班次
			if (type == 1) { // 有序巡查
				if (weight > 0 && status == 0) {
					let uuid = generate_UUID();
					store.commit('app/SET_POPUP_ID', uuid);
					let params = {
						content: '请按正确的顺序完成巡查',
						affirmButtonText: '知道了'
					}
					store.commit('app/SET_POPUP_DATA', params);
					uni.getSubNVueById(SubNVueId).show('zoom-fade-out', 250);
					store.commit('app/REMOVE_NFC_DATA');
					return false;
				} else {
					return true;
				}
			} else if (type == 0) {
				return true;
			} else {
				utils.toast('巡查类型错误');
				return false;
			}
		}
	},
	// 对比班次
	async isDuringDate(beginDate, endDateStr) {
		let date = new Date();
		let h = date.getHours();
		let m = date.getMinutes();
		let beginTime = beginDate.split(':');
		let endTime = endDateStr.split(':');
		let beginTimestamp = Number(beginTime[0]) * 3600 + Number(beginTime[1]) * 60;
		let endTimestamp = Number(endTime[0]) * 3600 + Number(endTime[1]) * 60;
		let currentTimestamp = h * 3600 + m * 60
		if (currentTimestamp >= beginTimestamp && currentTimestamp < endTimestamp) {
			return true
		} else {
			return false
		}
	},
	/**************************************** 巡检 ****************************************/
	/**
	 * 同步巡检列表
	 * @param {Number} status 任务状态
	 */
	syncPatrolListData(status, page = 1, pageSize = 10) {
		pageSize = (status == 0 || status == 3) ? 100 : 10;
		return new Promise((resolve, reject) => {
			request(`/v1/patrol/task/app`, {
				status,
				page,
				pageSize
			}).then(async res => {
				console.log(res)
				const {
					// code,
					data
				} = res;
				// if (code === 200) {
				console.log('在线巡检列表', data)
				let user = store.getters['user/getUserInfo'];
				if (data.length) {
					for (let item of data) {
						let selectSql =
							`SELECT * FROM ipis_patrol_list WHERE taskId="${item.id}"`;
						let task = await db.selectSQL(selectSql);
						console.log(task);
						if (task.length > 0) {
							// 更新列表数据
							console.log('巡检更新列表数据');
							let filterData = item.devices.filter(item => {
								return item.status != 0;
							})
							let updateSql =
								`UPDATE ipis_patrol_list SET status="${item.status}",finishNum="${filterData.length}",userid="${user.id}" WHERE taskId="${item.id}"`;
							await db.executeSQL(updateSql);
							// 更新设备地图数据
							for (let device of item.devices) {
								let updateDevicesSql =
									`UPDATE ipis_patrol_devices SET map='${JSON.stringify(device.map)}',status="${device.status}",userid="${user.id}" WHERE taskId="${item.id}" AND id="${device.id}"`;
								await db.executeSQL(updateDevicesSql);
								// 更新巡检项 items
								// console.log('更新巡检项', device.items)
								device.items.forEach(async choice => {
									let fileStatus = choice.uploadFiles
										.length > 0 ? 1 : -1;
									let choiceUpdateSql =
										`UPDATE ipis_patrol_items SET status="${choice.status}",remakes="${choice.remakes}",explain="${choice.explain}",res="${choice.res}",fileStatus="${fileStatus}",uploadFiles='${JSON.stringify(choice.uploadFiles)}',commitTime="${choice.commitTime}",userid="${user.id}" WHERE associateId="${device.id}" AND taskId="${device.taskId}" AND itemsId="${choice.id}"`;
									await db.executeSQL(choiceUpdateSql);
								})
							}
						} else {
							// 保存列表数据
							console.log('保存列表数据');
							let filterData = item.devices.filter(item => {
								return item.status != 0;
							})
							let listUuid = generate_UUID();
							let insertSql =
								`INSERT INTO ipis_patrol_list values("${listUuid}","${item.id}","${item.planName}","${item.taskNumber}","${item.planNumber}","${item.status}","-1","${item.userName}","${item.endTime}","${item.startTime}","${item.devices.length}","${filterData.length}","${item.submitTime}","${item.createTime}","${user.id}")`;
							await db.executeSQL(insertSql);
							// 保存巡检设备
							item.devices.forEach(async device => {
								let status = device.items.every(i => i.status == -
									1);
								let deviceStatus = status ? -1 : 0;
								let deviceInsertSql =
									`INSERT INTO ipis_patrol_devices values("${device.id}","${device.deviceId}","${device.deviceName}","${device.deviceNumber}","${device.commitPersonId}","${device.commitPerson}","${device.taskId}","${device.createTime}","${device.updateTime}","${device.deviceType}","${device.installLocation}", "", "${device.status}","-1","0",'${JSON.stringify(device.imgs)}',"${device.nfcNumber}","${user.id}",'${JSON.stringify(device.map)}', "${deviceStatus}", "[]", "0")`;
								await db.executeSQL(deviceInsertSql);
								device.items.forEach(async choice => {
									let choiceUuid = generate_UUID();
									let fileStatus = choice.uploadFiles
										.length > 0 ? 1 : -1;
									let choiceInsertSql =
										`INSERT INTO ipis_patrol_items values("${choiceUuid}","${device.id}","${choice.id}","${device.taskId}","${device.deviceId}","${choice.itemType}","${choice.limit}","${choice.groupName}","${choice.name}","${choice.hasSpecs}","${choice.specs}","${choice.commitTime}",'${JSON.stringify(choice.uploadFiles)}',"","${fileStatus}",'${JSON.stringify(choice.options)}',"${choice.res}","${choice.remakes}","${choice.explain}","${choice.status}","-1","0","${user.id}","[]","${device.deviceName}","0")`;
									await db.executeSQL(
										choiceInsertSql);
								})
							})
						}
					}
				}
				if (status == 0 && page == 1) {
					let selectSql =
						`SELECT * from ipis_patrol_list where userid="${user.id}" AND status="${status}"`;
					let allTask = await db.selectSQL(selectSql);
					for (let t of allTask) {
						let d = data.some(item => t.taskId == item.id);
						if (!d) {
							let updateSql =
								`UPDATE ipis_patrol_list SET status="-1" WHERE taskId="${t.taskId}" AND userid="${user.id}"`;
							await db.executeSQL(updateSql);
						}
					}
				}
				if (status == 3 && page == 1) {
					let selectSql =
						`SELECT * from ipis_patrol_list where userid="${user.id}" AND status="${status}"`;
					let allTask = await db.selectSQL(selectSql);
					for (let t of allTask) {
						let d = data.some(item => t.taskId == item.id);
						console.log(d)
						if (!d) {
							let updateSql =
								`DELETE FROM ipis_patrol_list WHERE taskId="${t.taskId}" AND userid="${user.id}"`;
							await db.executeSQL(updateSql);
						}
					}
				}
				resolve(true)
				// }
			}).catch(err => {
				console.log(err)
				uni.hideLoading();
				reject(err)
			})
		})
	},
	// 巡检项离线数据查询
	selectPatrolData(id) {
		return new Promise((resolve, reject) => {
			let selectSql = `SELECT * FROM ipis_patrol_items where userid="${id}" AND localStatus="0"`;
			db.selectSQL(selectSql).then(res => {
				resolve(res)
			}).catch(err => {
				reject(err)
			})
		})
	},
	// 巡检文件上传
	patrolFileUpload(id) {
		return new Promise((resolve, reject) => {
			this.selectPatrolData(id).then(async data => {
				if (data.length > 0) {
					let deviceStatus = data.every(item => item.status == -1);
					console.log('当前设备状态', deviceStatus)
					if (deviceStatus) {
						if (data[0].fileStatus == 0) {
							await utils.synchrodataFile(data[0].localFilePath, 0).then(res => {
								// 上传成功更新一下数据库
								console.log(res)
								if (res.code == 'success') {
									let sitePhotos = [];
									sitePhotos.push(res.url);
									data.forEach(async item => {
										let updatePointSql =
											`UPDATE ipis_patrol_items SET fileStatus="1",uploadFiles='${JSON.stringify(sitePhotos)}' WHERE id="${item.id}" AND userid="${id}"`;
										await db.executeSQL(updatePointSql);
									})
									resolve(true)
								} else {
									reject(res)
								}
							}).catch(error => {
								reject(error)
							})
						} else {
							resolve(true)
						}
					} else {
						let fileData = data.filter(item => {
							return item.fileStatus == 0;
						})
						console.log('巡检文件上传', fileData)
						if (fileData.length > 0) {
							for (let item of fileData) {
								await utils.synchrodataFile(item.localFilePath, 0).then(
									async res => {
										// 上传成功更新一下数据库
										if (res.code == 'success') {
											let sitePhotos = [];
											sitePhotos.push(res.url);
											let updatePointSql =
												`UPDATE ipis_patrol_items SET fileStatus="1",uploadFiles='${JSON.stringify(sitePhotos)}' WHERE id="${item.id}" AND userid="${id}"`;
											await db.executeSQL(updatePointSql);
										}
									}).catch(error => {
									console.log('文件上传错误', error)
								})
							}
							resolve(true)
						} else {
							resolve(true)
						}
					}
				} else {
					resolve(true)
				}
			})
		})
	},
	// 巡检离线数据同步
	patrolSync(id) {
		return new Promise((resolve, reject) => {
			this.selectPatrolData(id).then(async data => {
				if (data.length) {
					let tasks = [];
					for (let item of data) {
						let res = {}
						res[item.itemsId] = {
							itemRes: item.res, // 该项巡检结果
							commitTime: item.commitTime, // 提交时间
							img: item.uploadFiles != '' ? JSON.parse(item.uploadFiles) : [],
							status: item.status, // 1-已巡检、0-未巡检 -1-异常巡检
							explain: item.explain, // 异常巡检说明
							remakes: item.remakes, // 备注
						}
						tasks.push({
							id: item.associateId,
							taskId: item.taskId,
							"deviceId": item.deviceId, // 设备id
							"name": item.deviceName,
							"onlineGps": item.onlineGps,
							"timely": item.timely, // 0--及时提交 1--离线提交
							res: res
						});
					}
					console.log('巡检数据同步', tasks);
					// 巡检数据同步
					if (tasks.length > 0) {
						await request('/v1/patrol/task/app', tasks, 'POST').then(
							res => {
								// if (res.code === 200) {
								console.log('巡检数据同步成功', res.data)
								res.data.forEach(async item => {
									let updatePointSql =
										`UPDATE ipis_patrol_items SET localStatus="1" WHERE taskId="${item.id}" AND associateId="${item.dotId}" AND userid="${id}"`;
									await db.executeSQL(updatePointSql);
								})
								resolve(true)
								// } else {
								// 	console.log('3.巡检数据同步失败', res)
								// 	reject(res)
								// }
							}).catch(error => {
							console.log('4.巡检数据同步失败', error);
							data.forEach(async item => {
								let updateTimely =
									`UPDATE ipis_patrol_items SET timely="1" WHERE id="${item.id}" AND userid="${id}"`;
								await db.executeSQL(updateTimely);
							})
							resolve(true)
						})
					} else {
						resolve(true)
					}
				} else {
					resolve(true)
				}
			})
		})
	},
	// 处理巡检同步
	patrolSyncStatus: false,
	async handlePatrolSync() {
		if (this.patrolSyncStatus) {
			return;
		} else {
			return new Promise(async (resolve, reject) => {
				let {
					id
				} = store.getters['user/getUserInfo'];
				let isNetwork = await utils.monitorNetwork();
				console.log('开始巡检同步')
				this.patrolSyncStatus = true;
				if (isNetwork) {
					this.patrolFileUpload(id).then(data => {
						this.patrolSync(id).then(async res => {
							await this.taskSubmit();
							console.log('结束巡检同步')
							this.patrolSyncStatus = false;
							resolve(res)
						}).catch(error => {
							this.patrolSyncStatus = false;
							reject(error)
						})
					}).catch(error => {
						console.log('5555', error)
						this.patrolSyncStatus = false;
						reject(error)
					})
				} else {
					this.selectPatrolData(id).then(data => {
						console.log(data)
						data.forEach(async item => {
							let updateTimely =
								`UPDATE ipis_patrol_items SET timely="1" WHERE id="${item.id}" AND userid="${id}"`;
							await db.executeSQL(updateTimely);
						})
					});
					this.patrolSyncStatus = false;
					reject(false);
				}
			})
		}
	},
	/************* 告警 *************/
	// 音视频文件上传
	multimediaUpload(filePath, type, params) {
		let p = JSON.parse(JSON.stringify(params));
		return new Promise(async (resolve) => {
			await utils.synchrodataFile(filePath, type).then(async res => {
				if (res.code == 'success') {
					console.log('音视频文件上传成功!', filePath, type, p)
					if (type == 2) {
						p.audioFileId = res.url;
						let update =
							`UPDATE ipis_warning SET audio="${res.url}" WHERE id="${p.alarmId}"`;
						await db.executeSQL(update);
						await this.reportWarning(type, p);
					} else if (type == 3) {
						p.vedioFileId = res.url;
						let update =
							`UPDATE ipis_warning SET vedio="${res.url}" WHERE id="${p.alarmId}"`;
						await db.executeSQL(update);
						await this.reportWarning(type, p);
					}
					resolve(true);
				} else {
					let update =
						`UPDATE ipis_warning SET status="-1" WHERE id="${p.alarmId}"`;
					await db.executeSQL(update);
					resolve(false);
				}
			}).catch(error => {
				resolve(false)
			})
		})
	},
	// 静默上报
	reportWarning(status, params) {
		console.log('静默上报', status, params)
		return new Promise(async (resolve) => {
			let isNetwork = await utils.monitorNetwork();
			if (isNetwork) {
				request('/v1/alarms/gps', params, 'POST').then(async res => {
					console.log('告警结果', res);
					// if (res.code === 200) {
					let update =
						`UPDATE ipis_warning SET status="${status}" WHERE id="${params.alarmId}"`
					await db.executeSQL(update);
					let select =
						`SELECT * FROM ipis_warning WHERE id="${params.alarmId}" AND endState="1"`;
					db.selectSQL(select).then(async data => {
						console.log('告警本地数据', data)
						data.forEach(item => {
							if (item.localAudio != null && item
								.localVedio != null) {
								if (item.audio != null && item.vedio !=
									null) {
									this.onAlarmsConfirm(item.id, item
										.deviceId);
								}
							} else if (item.localAudio != null && item
								.localVedio == null) {
								if (item.audio != null) {
									this.onAlarmsConfirm(item.id, item
										.deviceId);
								}
							}
						})
					})
					resolve(true);
					// }
				}).catch(error => {
					console.log('告警上报失败', error)
					resolve(false)
				})
			} else {
				resolve(false);
			}
		})
	},
	// 离线告警信息查询 
	offlineWarn() {
		return new Promise((resolve) => {
			let {
				id
			} = store.getters['user/getUserInfo'];
			let sql = `SELECT * FROM ipis_warning WHERE status="-1" AND userid="${id}"`;
			db.selectSQL(sql).then(async data => {
				console.log('告警信息查询 ', data)
				for (let item of data) {
					let params = {};
					params.alarmId = item.id;
					params.reportTime = item.reportTime;
					params.gps = JSON.parse(item.gps);
					params.gps.mapLocation = JSON.stringify(params.gps.mapLocation);
					if (item.audio == null && item.localAudio != null) {
						await this.multimediaUpload(item.localAudio, 2, params).then(
							async res => {
								console.log('音频上传结束', res)
								if (item.vedio == null && item.localVedio != null) {
									await this.multimediaUpload(item.localVedio, 3,
										params).then(async r => {
										console.log('视频上传结束', r)
									})
								}
							})
					} else {
						this.reportWarning(item.status, params);
					}
				}
				resolve(true);
			});
		})
	},
	// 告警消息结束确认
	onAlarmsConfirm(warningId, deviceId) {
		console.log(warningId, deviceId)
		request('/v1/alarms/confirm', {
			warningId, //设备生成的唯一告警id
			"serialId": deviceId //设备唯一标识ID
		}, 'POST').then(res => {
			console.log('告警消息结束确认', res)
		}).catch(error => {
			console.log(error)
		})
	},
	/************* 异常上报 *************/
	// 离线异常上报查询
	offlineException() {
		return new Promise((resolve) => {
			let {
				id
			} = store.getters['user/getUserInfo'];
			let sql = `SELECT * FROM ipis_exception WHERE status="0" AND userid="${id}"`;
			db.selectSQL(sql).then(async data => {
				for (let item of data) {
					if (item.descriptionType) {
						if (item.localAudio != '') {
							await utils.synchrodataFile(item.localAudio, 2).then(async res => {
								if (res.code == 'success') {
									item.descrition = res.url;
									let update =
										`UPDATE ipis_exception SET descrition="${res.url}" WHERE id="${item.id}"`
									await db.executeSQL(update);
								}
							})
						}
						let localPicture = JSON.parse(item.localPicture);
						let picture = [];
						let picture_1 = item.picture ? JSON.parse(item.picture) : [];
						if (localPicture.length != picture_1.length) {
							for (let src of localPicture) {
								await utils.synchrodataFile(src, 0).then(async res => {
									if (res.code == 'success') {
										picture.push(res.url);
										item.picture = JSON.stringify(picture);
										let update =
											`UPDATE ipis_exception SET picture='${item.picture}' WHERE id="${item.id}"`
										await db.executeSQL(update);
									}
								}).catch(error => {
									console.log(error)
								})
							}
						}
					} else {
						let localPicture = JSON.parse(item.localPicture);
						let picture = [];
						for (let src of localPicture) {
							await utils.synchrodataFile(src, 0).then(async res => {
								if (res.code == 'success') {
									picture.push(res.url);
									item.picture = JSON.stringify(picture);
									let update =
										`UPDATE ipis_exception SET picture='${item.picture}' WHERE id="${item.id}"`
									await db.executeSQL(update);
								}
							}).catch(error => {
								console.log(error)
							})
						}
					}
				}
				resolve(data);
			}).catch(error => {
				console.log('异常上报查询失败', error)
			});
		})
	},
	// 异常上报
	reportException() {
		return new Promise((resolve, reject) => {
			this.offlineException().then(data => {
				// 上传之前 检测网络状态
				let netWork = store.getters['app/getNetWork'];
				console.log('异常上报处理后的数据', data, netWork)
				if (netWork) {
					if (data.length) {
						request(`/v1/abnormal`, data, 'POST').then(async res => {
							console.log(res)
							let data = res.data;
							for (let item of data) {
								let update =
									`UPDATE ipis_exception SET status="1" WHERE id="${item}"`
								await db.executeSQL(update);
							}
							console.log('离线上报成功', data)
							resolve(true)
						}).catch(error => {
							console.log('离线上报失败', error)
							resolve(false)
						})
					} else {
						resolve(true)
					}
				} else {
					resolve(false)
				}
			})
		})
	}
}