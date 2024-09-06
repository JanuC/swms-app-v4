<template>
	<view class="record-wrap">
		<view class="header">
			<view class="select">
				<view class="select-user">
					<picker @change="bindPickerChange" :value="index" :range="userList" range-key="name">
						<view class="select-result">
							<text>{{userList[index].name}}</text>
							<image class="arrow-down-filling" src="@/static/arrow-down-filling.png" mode="scaleToFill">
							</image>
						</view>
					</picker>
				</view>
				<view class="select-date">
					<picker mode="date" :value="date" :start="startDate" :end="endDate" @change="bindDateChange"
						fields="month">
						<view class="select-result">
							<text>{{date}}</text>
							<image class="arrow-down-filling" src="@/static/arrow-down-filling.png" mode="scaleToFill">
							</image>
						</view>
					</picker>
				</view>
			</view>
			<view class="statistical">
				<text>当前：{{currentTotal}}条</text>
				<text>总计：{{total}}条</text>
			</view>
		</view>
		<view class="content">
			<view class="list" v-for="(item, index) in recordList" :key="index">
				<view class="type-img">
					<image v-if="item.type == 1" class="type-icon" src="@/static/patrol-record.png" mode="scaleToFill">
					</image>
					<image v-if="item.type == 2" class="type-icon" src="@/static/inspection-record.png"
						mode="scaleToFill"></image>
				</view>
				<view class="info">
					<view class="name-status">
						<view class="name">
							<text>{{item.name}}</text>
						</view>
						<view class="status">
							<image class="status-icon" src="/static/status_2.png" mode="scaleToFill"></image>
							<text>{{item.type==1?'已巡检':'已巡查'}}</text>
						</view>
					</view>
					<view class="user-time">
						<text>{{item.commitPerson}}</text>
						<text class="time">{{item.commitTime}}</text>
					</view>
				</view>
			</view>
			<view class="empty-data" v-if="isEmptyData">
				<image class="no-data__image" src="@/static/noData.png" mode="widthFix"></image>
				<text class="no-data__text">暂无数据</text>
			</view>
			<view class="uni-loadmore" v-if="showLoadMore">{{loadMoreText}}</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			const currentDate = this.getDate({
				format: true
			})
			return {
				date: currentDate.replace('-', '年') + '月',
				selectDate: currentDate,
				userList: [{
					name: '全部',
					id: '0'
				}],
				recordList: [],
				index: 0,
				userId: '0',
				total: 0,
				currentTotal: 0,
				isEmptyData: false, // 是否是空数据
				loadMoreText: "加载中...",
				showLoadMore: false,
				limit: 0,
				page: 1,
				pageSize: 10
			}
		},
		computed: {
			startDate() {
				return this.getDate('start');
			},
			endDate() {
				return this.getDate('end');
			}
		},
		async onLoad() {
			await this.getTotal();
			await this.getUserList();
			this.getRecordList()
		},
		onUnload() {
			this.data = [];
			this.loadMoreText = "加载更多";
			this.showLoadMore = false;
		},
		onReachBottom() {
			if (this.recordList.length >= 10) {
				this.loadMoreText = "加载中";
				this.showLoadMore = true;
				this.limit += 10;
				this.page += 1;
				this.getRecordList();
			}
		},
		onPullDownRefresh() {
			this.page = 1;
			this.limit = 0;
			this.showLoadMore = false;
			this.recordList = [];
			this.getRecordList();
		},
		methods: {
			// 统计查询
			async getTotal() {
				let statistics =
					`SELECT count (*) as num FROM(SELECT status,commitPersonId,localStatus FROM ipis_patrol_devices UNION ALL SELECT status,commitPersonId,localStatus FROM ipis_inspection_locations) WHERE status!='0' AND commitPersonId!='' AND localStatus!='-1'`;
				await this.$db.selectSQL(statistics).then(data => {
					this.total = data[0].num;
				});
			},
			async getRecordList() {
				uni.showLoading({
					title: '加载中...',
					mask: true,
				});
				// 统计当前数量
				let statisticsSelect, select;
				if (this.userId == 0) {
					statisticsSelect =
						`SELECT count (*) as num FROM(SELECT status, commitTime, commitPersonId, localStatus FROM ipis_patrol_devices UNION ALL
				SELECT status, time commitTime, commitPersonId, localStatus FROM ipis_inspection_locations) WHERE status!='0' AND commitPersonId!='' AND localStatus!='-1' AND commitTime LIKE '${this.selectDate}%'`;
					select =
						`SELECT * FROM(SELECT '1' type, status, deviceName name, commitPerson, commitPersonId, commitTime, localStatus FROM ipis_patrol_devices UNION ALL
				SELECT '2' type, status, name, commitPerson, commitPersonId, time commitTime, localStatus FROM ipis_inspection_locations) WHERE status!='0' AND localStatus!='-1' AND commitPersonId!='' AND commitTime LIKE '${this.selectDate}%' ORDER BY commitTime DESC limit "${this.limit}", "10"`;
				} else {
					statisticsSelect =
						`SELECT count (*) as num FROM(SELECT status, commitTime, commitPersonId, localStatus FROM ipis_patrol_devices UNION ALL
				SELECT status, time commitTime, commitPersonId, localStatus FROM ipis_inspection_locations) WHERE status!='0' AND localStatus!='-1' AND commitTime LIKE '${this.selectDate}%' AND commitPersonId='${this.userId}'`;
					select =
						`SELECT * FROM(SELECT '1' type, status, deviceName name, commitPerson, commitPersonId, commitTime, localStatus FROM ipis_patrol_devices UNION ALL
				SELECT '2' type, status, name, commitPerson, commitPersonId, time commitTime, localStatus FROM ipis_inspection_locations) WHERE status!='0' AND localStatus!='-1' AND commitTime LIKE '${this.selectDate}%' AND commitPersonId='${this.userId}' ORDER BY commitTime DESC limit "${this.limit}", "10"`;
				}
				await this.$db.selectSQL(statisticsSelect).then(res => {
					this.currentTotal = res[0].num;
				});
				// 巡检设备查询
				await this.$db.selectSQL(select).then(data => {
					this.isLoadMore = data.length ? true : false;
					this.loadMoreText = this.isLoadMore ? '加载更多' : "没有更多数据了!"
					this.recordList = this.recordList.concat(data);
					this.isEmptyData = this.recordList.length > 0 ? false : true;
					uni.hideLoading();
					uni.stopPullDownRefresh();
				});
			},
			// 获取人员
			getUserList() {
				let selectSql = `SELECT * FROM ipis_users`;
				this.$db.selectSQL(selectSql).then(res => {
					this.userList = this.userList.concat(res);
				});
			},
			bindPickerChange(e) {
				this.index = e.detail.value;
				this.userId = this.userList[this.index].id;
				this.recordList = [];
				this.limit = 0;
				this.page = 1;
				this.getRecordList();
			},
			bindDateChange(e) {
				this.selectDate = e.target.value;
				this.date = e.target.value.replace('-', '年') + '月';
				this.recordList = [];
				this.limit = 0;
				this.page = 1;
				this.getRecordList();
			},
			getDate(type) {
				const date = new Date();
				let year = date.getFullYear();
				let month = date.getMonth() + 1;
				let day = date.getDate();
				if (type === 'start') {
					year = year - 10;
				} else if (type === 'end') {
					year = year;
				}
				month = month > 9 ? month : '0' + month;
				day = day > 9 ? day : '0' + day;
				return `${year}-${month}`;
			},
		}
	}
</script>

<style lang="scss">
	.record-wrap {
		height: 100vh;
		.header {
			position: fixed;
			top: 0;
			left: 0;
			right: 0;
			z-index: 9;
			padding: 0 18px;
			background-color: #fafafa;
			border-bottom: 1px solid #fff;

			.select {
				display: flex;

				.select-user,
				.select-date {
					padding: 8px 8px 8px 0;
					margin-right: 30px;
				}

				.select-result {
					display: flex;
					align-items: center;
					font-size: 18px;
					color: #333;
				}

				.arrow-down-filling {
					width: 16px;
					height: 16px;
					margin-left: 5px;
				}
			}

			.statistical {
				display: flex;
				align-items: center;
				justify-content: space-between;
				font-size: 13px;
				color: #666;
				margin-bottom: 4px;
			}
		}

		.content {
			padding-top: 68px;
			padding-left: 12px;

			.list {
				display: flex;
				align-items: center;
				padding: 10px 0;
				border-bottom: 1px solid #e5e5e5;
			}

			.type-img {
				width: 40px;
				height: 40px;
			}

			.type-icon {
				width: 100%;
				height: 100%;
			}

			.info {
				flex: 1;
				padding: 0 12px;
			}

			.name-status {
				display: flex;
				align-items: center;
				justify-content: space-between;
				font-size: 16px;
				color: #333333;
				margin-bottom: 5px;

				.name {
					flex: 1;
				}

				.status {
					width: 70px;
					font-size: 14px;
					color: #00b578;
					text-align: right;
				}
			}

			.user-time {
				font-size: 14px;
				color: #b3b3b3;
				display: flex;
				align-items: center;
				justify-content: space-between;

				.time {
					font-size: 13px;
				}
			}
		}
	}

	/deep/.uni-picker-container .uni-picker-action.uni-picker-action-confirm {
		color: $uni-color-primary !important;
	}
</style>
