<template>
	<view class='alarm'>
		<!-- 查询框 -->
		<view class='search'>
			<view>
				<uni-search-bar placeholder='输入关键字查询' cancelButton='none' @confirm="search('top')" :focus="false"
					v-model="params.keyword" @clear="params.keyword = '';search('top')">
				</uni-search-bar>
			</view>
			<view class="grid-row">
				<view class="uni-grid">
					<view @click="changeSearchObj(index)" v-for="(item, index) in searchObj"
						:class="{'active': item.active}" class="grid-box" style="background-color: #fff;">
						<template v-if="item.id == 'time'">
							<uni-datetime-picker :end='endTime' type="daterange" @clearTime='clearTime'
								@change="getTime" v-model="params.time">
								<text class="text">{{item.text}}</text>
								<image :src="item.status ? item.on : item.off" mode=""></image>
							</uni-datetime-picker>
						</template>
						<template v-else>
							<text class="text">{{item.text}}</text>
							<image :src="item.status ? item.on : item.off" mode=""></image>
						</template>
					</view>
				</view>

				<view :class="{open: activeObj.open}" class="grid-drawer">
					<!-- 告警分类 -->
					<view class="grid-drawer-item" v-show="activeObj.currentSearch == 0">
						<view @click="getParams('category', item.value)" v-for='item in categoryData' :key="item.value">
							{{item.label}}
						</view>
					</view>
					<!-- 告警等级 -->
					<view class="grid-drawer-item" v-show="activeObj.currentSearch == 1">
						<view @click="getParams('level', item.value)" v-for='item in levelData' :key="item.value">
							{{item.label}}
						</view>
					</view>
					<!-- 告警状态 -->
					<view class="grid-drawer-item" v-show="activeObj.currentSearch == 2">
						<view @click="getParams('status', item.value)" v-for='item in statusData' :key="item.value">
							{{item.label}}
						</view>
					</view>
				</view>
			</view>
		</view>
		<!-- 列表框 -->
		<view class="list">

			<list>
				<!-- 注意事项: 不能使用 index 作为 key 的唯一标识 -->
				<cell v-for="(item, index) in listData" :key="index">
					<view @click="goto(item )" class="list-item">
						<view class="list-title">
							<view class="list-title-left">
								<text>{{filterCategory(item.category)}}</text>
								<text>{{filterTime(item.verlayTime)}}</text>
							</view>
							<view class="list-title-right" :class="['status'+item.status]">
								{{filterStatus(item.status)}}
							</view>
						</view>
						<view class="list-content">
							<view class="list-content-item">
								<text class="list-content-label">告警位置</text>
								<text class="list-content-value text-hide">{{item.devOrgName}}</text>
							</view>
							<view class="list-content-item">
								<text class="list-content-label">告警等级</text>
								<text :class="['level'+item.level]"
									class="list-content-value level1 text-hide">{{filterLevel(item.level)}}</text>
							</view>
							<view class="list-content-item">
								<text class="list-content-label">告警原因</text>
								<text class="list-content-value text-hide">{{item.reason}}</text>
							</view>

						</view>
						<view class="list-footer">
							查看详情
						</view>
					</view>

				</cell>
			</list>

		</view>

		<view class="loadMore">
			<uni-load-more v-show="showMoreObj.showMore" :status="showMoreObj.status"></uni-load-more>
		</view>
	</view>
</template>

<script>
	import moment from 'moment';
	export default {
		data() {
			return {
				params: {
					keyword: '',
					level: '',
					status: '',
					category: '',
					time: '',
					pageNo: 1,
					pageSize: 10
				},
				searchObj: [{
					text: '告警分类',
					on: '../../static/alarm/on.png',
					off: '../../static/alarm/off.png',
					status: false,
					active: false,
					id: 'category',
				}, {
					text: '告警等级',
					on: '../../static/alarm/on.png',
					off: '../../static/alarm/off.png',
					status: false,
					active: false,
					id: 'level'
				}, {
					text: '处理状态',
					on: '../../static/alarm/on.png',
					off: '../../static/alarm/off.png',
					status: false,
					active: false,
					id: 'status'
				}, {
					text: '告警时间',
					on: '../../static/alarm/on.png',
					off: '../../static/alarm/off.png',
					status: false,
					active: false,
					id: 'time'
				}],
				activeObj: {
					currentSearch: -1, //当前选中的赛选数据
					open: false
				},

				// 列表数据
				listData: [],
				// 是否加载更多
				showMoreObj: {
					showMore: true,
					status: 'more'
				},
				endTime: Date.now(), //最大时间
				firstAlarmId: '', //第一条告警id
				timer: null
			}
		},
		// 上拉刷新
		onPullDownRefresh() {
			this.search('top');
			this.showMoreObj.status = 'more';
		},

		// 触底加载
		onReachBottom() {
			if (this.showMoreObj.status == 'noMore') return;
			this.search('bottom');
		},

		created() {
			this.search('top');
			this.getPolling();
		},
		destroyed() {
			clearInterval(this.timer)
		},

		computed: {
			statusData() {
				let data = [];
				for (let key in this.$store.state.alarm.statusData) {
					data.push({
						value: key,
						label: this.$store.state.alarm.statusData[key]
					})
				}
				return data;
			},
			categoryData() {
				let data = [];
				for (let key in this.$store.state.alarm.categoryData) {
					data.push({
						value: key,
						label: this.$store.state.alarm.categoryData[key]
					})
				}
				return data
			},
			levelData() {
				let data = [];
				for (let key in this.$store.state.alarm.levelData) {
					data.push({
						value: key,
						label: this.$store.state.alarm.levelData[key]
					})
				}
				return data
			}
		},

		methods: {
			/**
			 * 查询数据
			 * top 表示刷新 bottom表示加载 
			 */
			async search(type = 'top') {

				if (type == 'top') {
					this.params.pageNo = 1
				} else {
					this.params.pageNo += 1;
					// 增加一个五百毫秒的延时效果
					await new Promise((resolve) => {
						this.showMoreObj.status = 'loading';
						setTimeout(() => {
							resolve()
						}, 500)
					})
				}

				let params = JSON.parse((JSON.stringify(this.params)));
				//	处理时间
				if (params.time) {
					let [startTime, endTime] = params.time;
					params.startTime = moment(new Date(startTime).getTime()).subtract(8, 'h').valueOf()
					params.endTime = moment(new Date(endTime).getTime()).add(1, 'd').subtract(8, 'h').valueOf()
					delete params.time;
				}

				await this.$request('/v3/acs/alarm', params).then(res => {
					let {
						data
					} = res.data;
					if (type == 'top') {
						this.listData = data;
						uni.stopPullDownRefresh();
						if (data.length == 0) this.showMoreObj.status = 'noMore';

					} else {
						this.listData = this.listData.concat(data || []);
						data.length ? this.showMoreObj.status = 'more' : this.showMoreObj.status = 'noMore'
					}
				})
			},
			// 轮询数据
			getPolling() {
				if (this.timer) {
					clearInterval(this.timer)
					this.timer = null
				}
				this.timer = setInterval(() => {
					this.$request('/v3/acs/alarm', {
						pageNo: 1,
						pageSize: 1
					}).then(res => {
						let {
							data
						} = res.data;
						if (!data.length && !this.firstAlarmId) return;

						if (data[0].id !== this.firstAlarmId) {
							this.$utils.toast('告警已更新');
							this.search('top');
						}

						this.firstAlarmId = data[0].id;
					})
				}, 10000)
			},
			// 点击赛选框
			changeSearchObj(index) {
				// 时间点击单独处理
				if (index == 3) {
					this.searchObj[3].status = !this.searchObj[3].status;
					return
				}

				this.activeObj.currentSearch = index;
				let isQuery = false; // 是否需要请求接口

				this.searchObj.forEach((item, i) => {
					if (i == index) {
						if (item.active) {
							// 清除赛选条件
							this.params[item.id] = '';
							// 取消高亮颜色
							item.active = false;
							isQuery = true
							return
						}
						item.status = !item.status;
						this.activeObj.open = item.status;
					} else {
						item.status = false
					}
				});
				if (isQuery) this.search('top')
				this.$forceUpdate();
			},
			// 获取时间
			getTime(val) {
				this.params.time = val;
				this.searchObj[3].active = true;
				this.searchObj[3].status = true;
				this.search('top')
			},
			// 清除时间
			clearTime() {
				this.params.time = '';
				this.searchObj[3].active = false;
				this.search('top')
			},

			// 选择参数
			getParams(type, value) {
				this.params[type] = Number(value);
				this.searchObj[this.activeObj.currentSearch].active = true;
				this.searchObj[this.activeObj.currentSearch].status = false;
				this.activeObj.open = false;

				this.search('top');

			},
			// 跳转页面
			goto(item) {
				uni.navigateTo({
					url: '/pages/alarm/alarmInfo?id=' + item.id,
				})
			},
			// 处理时间
			filterTime(time) {
				return moment(new Date(time)).format('YYYY-MM-DD HH:mm:ss')
			},
			// 处理分类
			filterCategory(val) {
				return this.$store.state.alarm.categoryData[val] || '—';
			},
			// 处理告警等级
			filterLevel(val) {
				return this.$store.state.alarm.levelData[val] || '—';
			},
			// 处理告警状态
			filterStatus(val) {
				return this.$store.state.alarm.statusData[val] || '—';
			},
		}
	}
</script>

<style lang="scss" scoped>
	.alarm {
		// overflow: hidden;

		.search {
			height: 230rpx;
			position: fixed;
			top: 0;
			width: 100%;

			>view:first-child {
				background: $uni-bg-f5 !important;
			}


			.grid-row {
				position: relative;

				.uni-grid {
					display: flex;
					width: 100%;

					.grid-box {
						flex: 1;
						display: flex;
						align-items: center;
						justify-content: center;
						padding: 15px 0;

						image {
							width: 22rpx;
							height: 22rpx;
							margin-left: 10rpx;
						}
					}

					.active {
						.text {
							color: $uni-active-color !important;
						}
					}
				}

				.grid-drawer {
					position: absolute;
					top: 90rpx;
					left: 0;
					width: 100%;
					height: 0;
					overflow: hidden;
					transition: all 0.3s;
					overflow: auto;
					background-color: #fff;
					overflow: hidden;

					.grid-drawer-item {
						height: 100%;

						view {
							height: 90rpx;
							display: flex;
							align-items: center;
							padding-left: 30rpx;
							font-family: PingFang-SC-Medium;
							font-size: 28rpx;
							font-weight: normal;
							font-stretch: normal;
							line-height: 34.05rpx;
							letter-spacing: 0rpx;
							color: #333333;
						}
					}

				}

				.open {
					height: 400rpx;
				}
			}
		}

		.list {
			margin: 30rpx;
			height: auto;
			overflow: auto;
			padding-top: 230rpx;

			.list-item {
				width: 100%;
				height: 370rpx;
				background-color: #ffffff;
				border-radius: 16rpx;
				margin-bottom: 20rpx;
				overflow: hidden;

				.list-title {
					height: 86rpx;
					display: flex;
					justify-content: space-between;
					padding: 0 32rpx;
					border-bottom: solid 1rpx #eeeeee;

					.list-title-left,
					.list-title-right {
						display: flex;
						align-items: center;

						text:first-child {
							font-family: PingFang-SC-Medium;
							font-size: 28rpx;
							font-weight: normal;
							font-stretch: normal;
							line-height: 35.79rpx;
							letter-spacing: 0rpx;
							color: #333333;
							margin-right: 10rpx;

						}

						text:last-child {
							font-family: PingFang-SC-Regular;
							font-size: 24rpx;
							font-weight: normal;
							font-stretch: normal;
							line-height: 35.79rpx;
							letter-spacing: 0rpx;
							color: #666666;
						}
					}

					.list-title-right {
						font-family: PingFang-SC-Regular;
						font-size: 24rpx;
						font-weight: normal;
						font-stretch: normal;
						line-height: 35.79rpx;
						letter-spacing: 0rpx;
					}
				}

				.list-content {
					padding: 30rpx 30rpx 0 30rpx;

					.list-content-item {
						display: flex;
						flex-wrap: nowrap;
						margin-bottom: 25rpx;

						.list-content-label {
							font-family: PingFang-SC-Medium;
							font-size: 28rpx;
							font-weight: normal;
							font-stretch: normal;
							line-height: 35.79rpx;
							letter-spacing: 0rpx;
							color: #999999;
							padding-right: 30rpx;
							width: 110rpx;
						}

						.list-content-value {
							font-family: PingFang-SC-Medium;
							font-size: 28rpx;
							font-weight: normal;
							font-stretch: normal;
							line-height: 35.79rpx;
							letter-spacing: 0rpx;
							color: #333333;
							flex: 1;
						}
					}
				}

				.list-footer {
					border-top: solid 1rpx #eeeeee;
					font-family: SourceHanSansCN-Regular;
					font-size: 28rpx;
					font-weight: normal;
					font-stretch: normal;
					letter-spacing: 0rpx;
					color: #306dfe;
					height: 70rpx;
					display: flex;
					align-items: center;
					justify-content: center;
				}
			}

			.new-alarm {
				.list-title {
					background-color: #dd5b81;

					text {
						color: #fff !important;
					}
				}
			}
		}

	}

	.status0 {
		color: #f33649 !important;
	}

	.status1 {
		color: #28bd84 !important;
	}

	.status2 {
		color: #666666 !important;
	}

	.status3 {
		color: #f33649 !important;
	}

	.level1 {
		color: #cf2c25 !important;
	}

	.level2 {
		color: #f89600 !important;
	}

	.level3 {
		color: #ffc600 !important;
	}

	.level4 {
		color: #4483e3 !important;
	}

	.text-hide {
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
		display: inline-block;
	}
</style>
