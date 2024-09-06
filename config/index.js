export default {
	dbName: 'ipis',
	dbPath: '_doc/ipis.db',
	sql: {
		// 巡检列表数据表
		patrol_list_sql: `
		CREATE TABLE
		IF NOT EXISTS ipis_patrol_list --巡检列表数据表
		(
			"id" VARCHAR (32) PRIMARY KEY,
			"taskId" VARCHAR (32),
			--任务id
			"planName" VARCHAR (32),
			--任务名称
			"taskNumber" VARCHAR (32),
			--任务编号
			"planNumber" VARCHAR (32),
			--计划编号
			"status" INTEGER,
			--0未开始1进行中2已完成-1逾期3转派中7任务是否被转派
			"localStatus" INTEGER,
			--本地状态0未同步1已同步-1没有离线数据
			"userName" VARCHAR (32),
			--执行人员名称
			"endTime" VARCHAR (32),
			--截止时间
			"startTime" VARCHAR (32),
			--开始时间
			"total" INTEGER,
			--设备总数
			"finishNum" INTEGER,
			--已完成数量
			"submitTime" VARCHAR (32),
			--提交时间
			"createTime" VARCHAR (32),
			--创建时间
			"userid" VARCHAR (32)
			--用户id
		)`,
		// 巡检设备数据表
		patrol_devices_sql: `
		CREATE TABLE
		IF NOT EXISTS ipis_patrol_devices --巡检设备数据表
		(
			"id" VARCHAR (32) PRIMARY KEY,
			"deviceId" VARCHAR (32),
			--设备id
			"deviceName" VARCHAR (32),
			--设备名
			"deviceNumber" VARCHAR (32),
			--设备编号
			"commitPersonId" VARCHAR (32),
			--提交人员id
			"commitPerson" VARCHAR (32),
			--提交人员名称
			"taskId" VARCHAR (32),
			--任务id
			"createTime" VARCHAR (32),
			--创建时间
			"updateTime" VARCHAR (32),
			--更新时间
			"deviceType" VARCHAR (32),
			--设备类型
			"installLocation" VARCHAR (32),
			--安装位置
			"commitTime" VARCHAR (32),
			--提交时间
			"status" INTEGER,
			--状态0-未巡1-已巡
			"localStatus" INTEGER,
			--本地设备状态
			"scanCodeStatus" INTEGER,
			--扫码状态0未扫码1已扫码
			"imgs" TEXT,
			--设备图片
			"nfcNumber" VARCHAR (32),
			--设备NFC
			"userid" VARCHAR (32),
			--用户id
			"map" TEXT,
			--地图
			"deviceStatus" INTEGER,
			---1设备无法巡检默认0
			"onlineGps" TEXT DEFAULT '[]',
			--定位
			"timely" INTEGER DEFAULT '0'
			--0及时提交1离线提交
		)`,
		// 巡检项数据表
		patrol_items_sql: `
		CREATE TABLE
		IF NOT EXISTS ipis_patrol_items --巡检项数据表
		(
			"id" VARCHAR (32) PRIMARY KEY,
			"associateId" VARCHAR (32),
			--关联设备id
			"itemsId" VARCHAR (32),
			--巡检项id
			"taskId" VARCHAR (32),
			--任务ID
			"deviceId" VARCHAR (32),
			--设备ID
			"itemType" VARCHAR (32),
			--类型 0--文字、1--整数、2--0.0、3--0.00、4--0.000、5--0.0000、6--单选
			"limit" INTEGER,
			--文字数量
			"groupName" VARCHAR (32),
			--分组名
			"name" VARCHAR (32),
			--巡检项名
			"hasSpecs" INTEGER,
			--是否有操作规范
			"specs" TEXT,
			--操作规范
			"commitTime" VARCHAR (32),
			--提交时间
			"uploadFiles" VARCHAR (32),
			--文件路径
			"localFilePath" VARCHAR (32),
			--本地文件路径
			"fileStatus" INTEGER,
			--文件上传状态0未上传1已上传默认-1
			"options" TEXT,
			--操作项
			"res" VARCHAR (32),
			--巡检结果
			"remakes" VARCHAR (32),
			--备注
			"explain" VARCHAR (32),
			--说明
			"status" INTEGER,
			--1-已巡检、0-未巡检 -1-异常巡检
			"localStatus" INTEGER,
			--本地设备状态0未同步1已同步-1
			"isNormal" INTEGER,
			--1可巡检-1异常巡检0默认
			"userid" VARCHAR (32),
			--用户id
			"onlineGps" TEXT DEFAULT '[]',
			--定位
			"deviceName" VARCHAR (32),
			--设备名称
			"timely" INTEGER DEFAULT '0'
			 --0及时提交1离线提交
		)`,
		// 巡查
		inspection_list_sql: `
		CREATE TABLE
		IF NOT EXISTS ipis_inspection_list --巡查列表数据表
		(
			"id" VARCHAR (32) PRIMARY KEY,
			"taskId" VARCHAR (32),
			--任务id
			"taskNumber" VARCHAR (26),
			--任务编号
			"createTime" VARCHAR (26),
			--开始时间
			"deadline" VARCHAR (26),
			--截止时间
			"name" VARCHAR (32),
			--任务名称
			"frequency" TEXT,
			--班次限制
			"status" INTEGER,
			--0--未开始，1--进行中，2--已完成，-1 --逾期，3--转派中,4--全部7任务是否被转派
			"localStatus" INTEGER,
			--本地状态0未同步1已同步-1没有离线数据
			"type" INTEGER,
			--0-无序 1-有序
			"completed" INTEGER,
			--已完成个数
			"total" INTEGER,
			--总个数
			"userid" VARCHAR (32),
			--用户id
			"takePhotos" INTEGER
			--是否需要拍照1需要0不需要
		)`,
		// 巡查点
		inspection_create_sql: `
		CREATE TABLE
		IF NOT EXISTS ipis_inspection_locations --巡查点信息表
		(
			"id" VARCHAR (32) PRIMARY KEY,
			--id
			"pointId" VARCHAR (32),
			--点位id
			"name" VARCHAR (32),
			--点位名
			"location" VARCHAR (32),
			--点位位置
			"weight" INTEGER,
			--有序任务巡查权重 由小到大
			"nfc" VARCHAR (32),
			--nfc卡号
			"filePath" VARCHAR (32),
			--文件路径
			"localFilePath" VARCHAR (32) DEFAULT '',
			--本地文件路径
			"fileStatus" INTEGER DEFAULT '-1',
			--文件上传状态0未上传1已上传-1没有
			"commitPersonId" VARCHAR (32),
			--提交人员id
			"commitPerson" VARCHAR (32),
			--提交人员名称
			"time" VARCHAR (32),
			-- 打卡时间
			"status" INTEGER,
			--1-已巡查、0-未巡查 -1-异常巡查
			"incompleteReason" VARCHAR (32),
			--异常原因
			"map" TEXT,
			--地图
			"userid" VARCHAR (32),
			 --用户id
			 "taskId" VARCHAR (32),
			 --任务id
			 "onlineGps" TEXT DEFAULT '[]',
			 --定位
			 "localStatus" INTEGER DEFAULT '-1',
			 --本地点位状态0未同步1已同步-1没有
			 "delTag" INTEGER,
			 --1--已删除 0--未删除
			 "sitePhotos" VARCHAR (32),
			 --照片
			 "timely" INTEGER DEFAULT '0'
			 --0及时提交1离线提交
		)`,
		// 用户
		user_sql: `
		CREATE TABLE
		IF NOT EXISTS ipis_users --登录用户表
		(
			"id" VARCHAR (32) PRIMARY KEY,
			"status" INTEGER DEFAULT '0',
			"name" VARCHAR (32),
			"account" VARCHAR (32),
			"password" VARCHAR (32)
		)`,
		// 任务提交表
		task_sql: `
		CREATE TABLE
		IF NOT EXISTS ipis_task --任务提交表
		(
			"id" VARCHAR (32) PRIMARY KEY,
			"taskId" VARCHAR (32),
			--任务id
			"type" INTEGER,
			--0-巡查 1- 巡检
			"time" VARCHAR (32),
			--提交时间
			"userid" VARCHAR (32)
			--用户id
		)`,
		// 静默告警
		warning_sql: `
		CREATE TABLE
		IF NOT EXISTS ipis_warning --静默告警离线数据存储表
		(
			"id" VARCHAR (32) PRIMARY KEY,
			"reportTime" VARCHAR (32),
			--上报时间
			"endTime" VARCHAR (32),
			--结束时间
			"location" VARCHAR (32),
			--上报位置
			"endLocation" VARCHAR (32),
			--结束上报位置
			"audio" VARCHAR (32),
			--音频文件地址
			"vedio" VARCHAR (32),
			--视频文件地址
			"localAudio" VARCHAR (32),
			--本地音频文件地址
			"localVedio" VARCHAR (32),
			--本地视频文件地址
			"userid" VARCHAR (32),
			 --用户id
			 "deviceId" VARCHAR (32),
			 --设备id
			 "status" INTEGER,
			 --上报状态0上报定位2音频已上报3视频已上报4告警结束-1
			 "gps" TEXT,
			 "endState" INTEGER DEFAULT '0'
			 --告警结束状态0未结束1结束
		)`,
		// 异常上报
		exception_sql: `
		CREATE TABLE
		IF NOT EXISTS ipis_exception --异常上报离线数据存储表
		(
			"id" VARCHAR (32) PRIMARY KEY,
			"descriptionType" INTEGER,
			--描述类型: 0-文字描述;1-语音描述
			"descrition" VARCHAR (32),
			--描述内容: 文字描述直接是文字内容,语音描述为语音文件ID
			"location" VARCHAR (32),
			--位置信息
			"picture" VARCHAR (32),
			--现场图片
			"reportTime" VARCHAR (32),
			--上报时间
			"localPicture" VARCHAR (32),
			--本地现场图片地址
			"localAudio" VARCHAR (32),
			--本地音频文件地址
			"userid" VARCHAR (32),
			--用户id
			"status" INTEGER,
			--上报状态0-未上报 1-已上报
			"duration" VARCHAR (32)
			--音频时长
		)`,
		// 操作记录
		record_sql: `
		CREATE TABLE
		IF NOT EXISTS ipis_record --本地用户操作记录
		(
			"id" INTEGER PRIMARY KEY,
			"user_id" VARCHAR (32),
			--用户id
			"user_name" VARCHAR (32),
			--用户名称
			"name" VARCHAR (32),
			--点位或者设备名称
			"time" VARCHAR (32),
			--打卡时间
			"result" INTEGER,
			--打卡结果1巡查2巡检
			"status" INTEGER,
			--打卡状态1正常2异常
			"task_id" VARCHAR (32),
			--所属任务ID
			"task_name" VARCHAR (32)
			--所属任务名称
		)`
	},
	// 状态 0--未开始，1--进行中，2--已完成，-1 --逾期，3--转派中,4--全部
	taskStatus: [{
			status: 0,
			title: '未完成'
		},
		{
			status: 2,
			title: '已完成'
		},
		{
			status: -1,
			title: '逾期'
		},
		{
			status: 3,
			title: '转派中'
		}
	],
}
