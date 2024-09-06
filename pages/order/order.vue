<template>
	<view class='order'>
		<!-- 查询框 -->
		<view class='search'>
			<view>
				<uni-search-bar placeholder='输入关键字查询' cancelButton='none' @confirm="search('top')" :focus="false"
					v-model="params.keyword" @clear="params.keyword = '';search('top')">
				</uni-search-bar>
			</view>
			<view class="grid-row">
				<view class="grid-box active">
					<text>我收到的</text>
				</view>
				<view class="grid-box">
					<text>我发起的</text>
				</view>
			</view>
		</view>
		<!-- 列表框 -->
		<view class="list">
			<div v-show=""></div>

			<list>
				<!-- 注意事项: 不能使用 index 作为 key 的唯一标识 -->
				<cell v-for="(item, index) in listData" :key="index">
					<view @click="goto(item )" class="list-item new-alarm">
						<view class="list-title">
							<view class="list-title-left">
								<text>{{filterTime(item.verlayTime)}}</text>
							</view>
						</view>
						<view class="list-content">
							<view class="list-content-item">
								<text class="list-content-label">
									请求人
								</text>
								<text class="list-content-value text-hide">{{item.devOrgName}}</text>
							</view>
							<view class="list-content-item">
								<text class="list-content-label">请求内容</text>
								<text :class="['level'+item.level]"
									class="list-content-value level1 text-hide">{{filterLevel(item.level)}}</text>
							</view>
						</view>
						<view class="list-footer">
							请求中
						</view>
					</view>

				</cell>
			</list>

			<view class="loadMore">
				<uni-load-more v-show="showMoreObj.showMore" :status="showMoreObj.status"></uni-load-more>
			</view>
		</view>

		<!-- 发起工单 -->
		<view class="order-footer">
			<view @click="goto" class="btn">
				<image src="@/static/order/icon2.png" mode=""></image>
				<text>发起工单</text>
			</view>
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
					params.startTime = new Date(startTime).getTime()
					params.endTime = new Date(endTime).getTime()
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
			// 点击赛选框
			changeSearchObj(index) {

				// 时间点击单独处理
				if (index == 3) {
					this.searchObj[3].status = true;
					// 如果被选中
					if (this.searchObj[3].active) {
						this.searchObj[3].active = false;
						this.params.time = '';
						this.searchObj[3].status = false;
					}
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
				this.searchObj[3].active = Boolean(val.length);
				setTimeout(() => {
					this.searchObj[3].status = false;
				}, 200);
				this.$forceUpdate();
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
					url: '/pages/order/orderInfo'
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
	.order {
		// overflow: hidden;

		.search {
			height: 200rpx;
			position: fixed;
			top: 0;
			width: 100%;
			background-color: #fff;

			.grid-row {
				display: flex;
				width: 100%;
				height: 62rpx;

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

					text {
						color: $uni-active-color !important;
						position: relative;

						&::after {
							width: 60rpx;
							height: 5rpx;
							background-color: $uni-active-color;
							border-radius: 2.5rpx;
							content: '';
							position: absolute;
							margin-left: -15px;
							bottom: -30rpx;
							left: 50%;
						}
					}
				}
			}
		}

		.list {
			margin: 30rpx;
			height: auto;
			overflow: auto;
			padding-top: 200rpx;
			padding-bottom: 200rpx;

			.list-item {
				width: 100%;
				height: 310rpx;
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

		.order-footer {
			height: 170rpx;
			padding: 10rpx 30rpx 0 30rpx;
			background-color: #fff;
			position: fixed;
			bottom: 0;
			left: 0;
			width: calc(100vw - 60rpx);

			.btn {
				width: 100%;
				height: 80rpx;
				background-color: $uni-active-color !important;
				border-radius: 10rpx;
				display: flex;

				justify-content: center;
				align-items: center;
				font-family: SourceHanSansCN-Regular;
				font-size: 28rpx;
				font-weight: normal;
				font-stretch: normal;
				letter-spacing: 0rpx;
				color: #ffffff;
				opacity: 1;

				image {
					width: 44rpx;
					height: 44rpx;
					padding-right: 10rpx;
				}

				&:hover {
					opacity: 0.6;
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
