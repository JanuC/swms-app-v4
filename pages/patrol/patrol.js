import db from '@/utils/db.js';
export default {
	// 状态0--未开始，2--已完成，-1 --逾期，3--转派中
	/**
	 * 设置巡检任务
	 * @param {Object} id 本地生成的任务id
	 * @param {Object} userId
	 * @param {Object} data 任务数据
	 */
	setTask(id, userId, data) {
		return new Promise((resolve, reject) => {
			if (id !== undefined) {
				if (userId !== undefined) {
					if (data !== undefined) {
						let filterData = data.devices.filter(item => {
							return item.status != 0;
						});
						let total = data.devices.length;
						let progress = filterData.length;
						let insertSql =
							`INSERT INTO ipis_patrol_list values("${id}","${data.id}","${data.planName}","${data.taskNumber}","${data.planNumber}","${data.status}","-1","${data.userName}","${data.endTime}","${data.startTime}","${total}","${progress}","${data.submitTime}","${data.createTime}","${userId}")`;
						db.executeSQL(insertSql).then(res => {
							resolve(res)
						}).catch(error => {
							console.error('设置巡检任务--失败', error);
							reject(error);
						});
					} else {
						console.error('参数错误: 缺少data');
						reject(new Error('参数错误: 缺少data'))
					}
				} else {
					console.error('参数错误: 缺少userId');
					reject(new Error('参数错误: 缺少userId'))
				}
			} else {
				console.error('参数错误: 缺少id');
				reject(new Error('参数错误: 缺少id'))
			}
		})
	},
	/**
	 * 设置巡检设备
	 * @param {Object} id 设备id
	 * @param {Object} taskId 任务id
	 * @param {Object} userId 用户id
	 * @param {Object} device 设备数据
	 */
	setDevice(id, taskId, userId, device) {
		return new Promise((resolve, reject) => {
			if (id !== undefined) {
				if (taskId !== undefined) {
					if (userId !== undefined) {
						if (device !== undefined) {
							let status = device.items.every(i => i.status == -
								1);
							let deviceStatus = status ? -1 : 0;
							let insertSql =
								`INSERT INTO ipis_patrol_devices values("${id}","${device.deviceId}","${device.deviceName}","${device.deviceNumber}","${device.commitPersonId}","${device.commitPerson}","${taskId}","${device.createTime}","${device.updateTime}","${device.deviceType}","${device.installLocation}", "", "${device.status}","-1","0",'${JSON.stringify(device.imgs)}',"${device.nfcNumber}","${userId}",'${JSON.stringify(device.map)}', "${deviceStatus}", "[]", "0")`;
							db.executeSQL(insertSql).then(res => {
								resolve(res)
							}).catch(error => {
								console.error('设置巡检设备--失败', error);
								reject(error);
							});
						} else {
							console.error('参数错误: 缺少device');
							reject(new Error('参数错误: 缺少device'))
						}
					} else {
						console.error('参数错误: 缺少userId');
						reject(new Error('参数错误: 缺少userId'))
					}
				} else {
					console.error('参数错误: 缺少taskId');
					reject(new Error('参数错误: 缺少taskId'))
				}
			} else {
				console.error('参数错误: 缺少id');
				reject(new Error('参数错误: 缺少id'))
			}
		})
	},
	/**
	 * 设置设备巡检项
	 * @param {Object} id 巡检项id
	 * @param {Object} deviceRecordId 设备记录id
	 * @param {Object} deviceId 设备id
	 * @param {Object} taskId 任务id
	 * @param {Object} userId 用户id
	 * @param {Object} choice 巡检项数据
	 */
	setItems(id, deviceRecordId, deviceId, taskId, userId, deviceName, choice) {
		return new Promise((resolve, reject) => {
			try {
				let fileStatus =
					choice
					.uploadFiles
					.length >
					0 ? 1 : -1;
				let insertSql =
					`INSERT INTO ipis_patrol_items values("${id}","${deviceRecordId}","${choice.id}","${taskId}","${deviceId}","${choice.itemType}","${choice.limit}","${choice.groupName}","${choice.name}","${choice.hasSpecs}","${choice.specs}","${choice.commitTime}",'${JSON.stringify(choice.uploadFiles)}',"","${fileStatus}",'${JSON.stringify(choice.options)}',"${choice.res}","${choice.remakes}","${choice.explain}","${choice.status}","-1","0","${userId}","[]","${deviceName}","0")`;
				db.executeSQL(insertSql).then(res => {
					resolve(res)
				}).catch(error => {
					console.error('设置设备巡检项--失败', error);
					reject(error);
				});
			} catch (e) {
				console.error(e)
			}
		})

	},
	/**
	 * 更新巡检任务
	 * @param {Object} id 任务id
	 * @param {Object} userId 用户id
	 * @param {Object} status 任务状态
	 * @param {Object} progress 任务进度
	 */
	updateTask(id, userId, status, progress) {
		return new Promise((resolve, reject) => {
			if (id !== undefined) {
				if (status !== undefined) {
					if (progress !== undefined) {
						let updateSql =
							`UPDATE ipis_patrol_list SET status="${status}",finishNum="${progress}",userid="${userId}" WHERE taskId="${id}"`;
						db.executeSQL(updateSql).then(res => {
							resolve(res)
						}).catch(error => {
							console.error('更新巡检任务--失败', error);
							reject(error);
						});
					} else {
						console.error('参数错误: 缺少progress');
						reject(new Error('参数错误: 缺少progress'))
					}
				} else {
					console.error('参数错误: 缺少status');
					reject(new Error('参数错误: 缺少status'))
				}
			} else {
				console.error('参数错误: 缺少id');
				reject(new Error('参数错误: 缺少id'))
			}
		})
	},
	/**
	 * 更新任务状态
	 * @param {Object} id
	 * @param {Object} userId
	 * @param {Object} status
	 */
	updateTaskStatus(id, userId, status) {
		return new Promise((resolve, reject) => {
			let updateSql =
				`UPDATE ipis_patrol_list SET status="${status}" WHERE taskId="${id}" AND userid="${userId}"`;
			db.executeSQL(updateSql).then(res => {
				resolve(res)
			}).catch(error => {
				console.error('更新任务状态--失败', error);
				reject(error);
			});
		})
	},
	/**
	 * 更新任务进度
	 * @param {Object} id
	 * @param {Object} userId
	 * @param {Object} progress
	 */
	updateTaskProgress(id, userId, progress) {
		return new Promise((resolve, reject) => {
			let updateSql =
				`UPDATE ipis_patrol_list SET finishNum="${progress}" WHERE taskId="${id}" AND userid="${userId}"`;
			db.executeSQL(updateSql).then(res => {
				resolve(res)
			}).catch(error => {
				console.error('更新任务进度--失败', error);
				reject(error);
			});
		})
	},
	/**
	 * 更新设备
	 * @param {Object} userId 用户id
	 * @param {Object} taskId 任务id
	 * @param {Object} data 设备数据
	 */
	updateTaskDevice(userId, taskId, data) {
		return new Promise((resolve, reject) => {
			if (userId !== undefined) {
				if (taskId !== undefined) {
					if (data !== undefined) {
						let {
							map,
							status,
							id
						} = data;
						let updateSql =
							`UPDATE ipis_patrol_devices SET map='${JSON.stringify(map)}',status="${status}",userid="${userId}" WHERE taskId="${taskId}" AND id="${id}"`;
						db.executeSQL(updateSql).then(res => {
							resolve(res)
						}).catch(error => {
							console.error('更新设备--失败', error);
							reject(error);
						});
					} else {
						console.error('参数错误: 缺少data');
						reject(new Error('参数错误: 缺少data'))
					}
				} else {
					console.error('参数错误: 缺少taskId');
					reject(new Error('参数错误: 缺少taskId'))
				}
			} else {
				console.error('参数错误: 缺少userId');
				reject(new Error('参数错误: 缺少userId'))
			}
		})
	},
	/**
	 * 更新巡检项
	 * @param {Object} userId 用户id
	 * @param {Object} taskId 任务id
	 * @param {Object} deviceId 设备id
	 * @param {Object} data 巡检项数据
	 */
	updateDeviceItems(userId, taskId, deviceId, data) {
		return new Promise((resolve, reject) => {
			if (userId !== undefined) {
				if (taskId !== undefined) {
					if (deviceId !== undefined) {
						if (data !== undefined) {
							let fileStatus = data.uploadFiles
								.length > 0 ? 1 : -1;
							let updateSql =
								`UPDATE ipis_patrol_items SET status="${data.status}",remakes="${data.remakes}",explain="${data.explain}",res="${data.res}",fileStatus="${fileStatus}",uploadFiles='${JSON.stringify(data.uploadFiles)}',commitTime="${data.commitTime}",userid="${userId}" WHERE associateId="${deviceId}" AND taskId="${taskId}" AND itemsId="${data.id}"`;
							db.executeSQL(updateSql).then(res => {
								resolve(res)
							}).catch(error => {
								console.error('更新设备--失败', error);
								reject(error);
							});
						} else {
							console.error('参数错误: 缺少data');
							reject(new Error('参数错误: 缺少data'))
						}
					} else {
						console.error('参数错误: 缺少deviceId');
						reject(new Error('参数错误: 缺少deviceId'))
					}
				} else {
					console.error('参数错误: 缺少taskId');
					reject(new Error('参数错误: 缺少taskId'))
				}
			} else {
				console.error('参数错误: 缺少userId');
				reject(new Error('参数错误: 缺少userId'))
			}
		})
	},
	/**
	 * 巡查巡检任务列表
	 * @param {Object} status 状态0--未开始，2--已完成，-1 --逾期，3--转派中
	 * @param {Object} userid 用户id
	 * @param {Object} page 页码
	 * @param {Object} pageSize 每页条目
	 */
	getTaskList(status, userid, page = 1, pageSize = 10) {
		return new Promise((resolve, reject) => {
			if (status !== undefined) {
				if (userid !== undefined) {
					let selectSql =
						`SELECT * FROM ipis_patrol_list where status="${status}" AND userid="${userid}" order by createTime desc limit "${page}", "${pageSize}"`;
					db.selectSQL(selectSql).then(data => {
						resolve(data)
					}).catch(error => {
						console.error('巡查巡检任务列表--失败', error, status, userid, page, pageSize)
						reject(error)
					});
				} else {
					console.error('参数错误: 缺少userid');
					reject(new Error('参数错误: 缺少userid'))
				}
			} else {
				console.error('参数错误: 缺少status');
				reject(new Error('参数错误: 缺少status'))
			}
		})
	},
	/**
	 * 查询用户在特定状态下的所有任务
	 * @param {Object} userid
	 * @param {Object} status
	 */
	getStatusTaskList(userid, status) {
		return new Promise((resolve, reject) => {
			let selectSql =
				`SELECT * FROM ipis_patrol_list WHERE userid="${userid}" AND status="${status}"`;
			db.selectSQL(selectSql).then(data => {
				resolve(data)
			}).catch(error => {
				console.error('根据状态查询任务--失败', error)
				reject(error)
			});
		})
	},
	/**
	 * 查询巡检任务详情
	 * @param {Object} id
	 */
	getTaskDetails(id) {
		return new Promise((resolve, reject) => {
			if (id !== undefined) {
				let selectSql = `SELECT * FROM ipis_patrol_list where taskId="${id}"`;
				db.selectSQL(selectSql).then(data => {
					resolve(data)
				}).catch(error => {
					console.log('查询巡检任务详情--失败', error, id)
					reject(error)
				});
			} else {
				console.error('参数错误: 缺少id');
				reject(new Error('参数错误: 缺少id'))
			}
		})
	},
	/**
	 * 查询设备列表
	 * @param {Object} id 任务id
	 * @param {Object} nfc
	 */
	getDeviceList(id, nfc) {
		return new Promise((resolve, reject) => {
			if (id !== undefined) {
				let selectSql;
				if (nfc !== undefined) {
					selectSql =
						`SELECT * FROM ipis_patrol_devices WHERE taskId="${id}" AND nfcNumber="${nfc}"`;
				} else {
					selectSql =
						`SELECT * FROM ipis_patrol_devices WHERE taskId="${id}"`;
				}
				db.selectSQL(selectSql).then(data => {
					resolve(data)
				}).catch(error => {
					console.error('查询设备列表--失败', error, id)
					reject(error)
				});
			} else {
				console.error('参数错误: 缺少id');
				reject(new Error('参数错误: 缺少id'))
			}
		})
	},
	/**
	 * 查询设备
	 * @param {Object} id 设备id
	 */
	getDevice(id) {
		return new Promise((resolve, reject) => {
			if (id !== undefined) {
				let selectSql =
					`SELECT * FROM ipis_patrol_devices WHERE id="${id}"`;
				db.selectSQL(selectSql).then(data => {
					resolve(data)
				}).catch(error => {
					console.log('查询设备--失败', error, id)
					reject(error)
				});
			} else {
				console.error('参数错误: 缺少id');
				reject(new Error('参数错误: 缺少id'))
			}
		})
	},
	/**
	 * 查询巡检项
	 * @param {Object} id 设备id
	 * @param {Object} taskId 设备id
	 */
	getItems(id) {
		return new Promise((resolve, reject) => {
			try {
				if (id !== undefined) {
					let selectSql =
						`SELECT * FROM ipis_patrol_items WHERE associateId="${id}"`;
					db.selectSQL(selectSql).then(data => {
						resolve(data)
					}).catch(error => {
						console.log('查询巡检项--失败', error, id)
						reject(error)
					});
				} else {
					console.error('参数错误: 缺少id');
					reject(new Error('参数错误: 缺少id'))
				}
			} catch (e) {
				console.log(e)
			}
		})
	}
}
