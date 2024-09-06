
<!-- 巡查 -->
<template>
	<view class="content patrol-wrap">
		<view class="header-tabbar">
			<view :class="['tabbar-item', item.status == status ? 'active-tabbar' : '']" v-for="item in tabbars"
				:key="item.status" @click="handleSwitch(item.status)">
				<text>{{item.title}}</text>
			</view>
		</view>
		<view class="list-wrap">
			<navigator :url="`/pages/inspection/details?id=${item.taskId}`" class="list-children"
				v-for="item in listData" :key="item.id">
				<view class="list-header">
					<text class="list-number">{{item.name|filterName}}</text>
					<view class="list-status">
						<image v-if="item.status == 0 || item.status == 1" class="status-icon"
							src="/static/status_1.png" mode="scaleToFill"></image>
						<image v-else-if="item.status == 2" class="status-icon" src="/static/status_2.png"
							mode="scaleToFill"></image>
						<image v-else-if="item.status == -1" class="status-icon" src="/static/status_3.png"
							mode="scaleToFill"></image>
						<image v-else-if="item.status == 3" class="status-icon" src="/static/transfer-icon.png"
							mode="scaleToFill"></image>
						<text v-if="item.status == 2" class="list-status__text2">
							已完成
						</text>
						<text v-if="item.status == 0 ||item.status == 1" class="list-status__text1">
							未完成
						</text>
						<text v-if="item.status == 3" class="list-status__text4">
							转派中
						</text>
						<text v-if="item.status == -1" class="list-status__text3">
							逾期
						</text>
						<image class="right-icon" src="/static/my_right.png" mode="scaleToFill"></image>
					</view>
				</view>
				<view class="list-content">
					<view class="list-content__item">
						<text class="list-left_text">巡查时间:</text>
						<view class="list-right__content">
							<text>{{item.createTime|filterDate}}<text
									class="delimiter">至</text>{{item.deadline|filterDate}}</text>
						</view>
					</view>
					<view class="list-content__item">
						<text class="list-left_text">任务进度:</text>
						<view class="list-right__content">
							<view class="progress-bar">
								<view class="progress" :style="{width: (item.completed/item.total*100)+'%'}"></view>
							</view>
							<text>{{item.completed}}/{{item.total}}</text>
						</view>
					</view>
				</view>
			</navigator>
			<view class="empty-data" v-if="isEmptyData">
				<image class="no-data__image" src="@/static/noData.png" mode="widthFix"></image>
				<text class="no-data__text">暂无数据</text>
			</view>
			<view class="uni-loadmore" v-if="showLoadMore">{{loadMoreText}}</view>
		</view>
	</view>
</template>

<script>
	import {
		mapGetters,
	} from 'vuex';
	import syncFunc from '@/utils/dataSync.js';
	export default {
		data() {
			return {
				tabbars: this.$config.taskStatus,
				status: '0',
				listData: [],
				isEmptyData: false,
				loadMoreText: "加载中...",
				showLoadMore: false,
				limit: 0,
				page: 1,
				pageSize: 10
			};
		},
		computed: {
			...mapGetters({
				getUsers: 'user/getUserInfo',
				getInspectionTask: 'app/getInspectionTask'
			})
		},
		async onLoad() {
			this.page = 1;
			this.limit = 0;
			this.showLoadMore = false;
			this.listData = [];
			await this.listInit();
		},
		onUnload() {
			this.data = [];
			this.loadMoreText = "加载更多";
			this.showLoadMore = false;
		},
		onReachBottom() {
			if (this.listData.length == 10) {
				this.loadMoreText = "加载中";
				this.showLoadMore = true;
				this.limit += 10;
				this.page += 1;
				this.listInit();
			}
		},
		onPullDownRefresh() {
			this.page = 1;
			this.limit = 0;
			this.showLoadMore = false;
			this.listData = [];
			this.listInit();
		},
		watch: {
			getInspectionTask(val) {
				console.log(val)
				this.listData.forEach((item, index) => {
					if (item.taskId === val.id) {
						item.completed = val.completed;
						if (item.status != val.status) {
							this.listData.splice(index, 1)
						}
					}
				})
			}
		},
		methods: {
			async listInit() {
				uni.showLoading({
					title: '加载中...',
					mask: true,
				});
				let isNetwork = await this.$utils.monitorNetwork();
				if (isNetwork) {
					// 处理数据同步
					await syncFunc.handleInspectionSync();
					await syncFunc.syncListData(this.status, this.page, this.pageSize).then(res => {
						console.log('巡查列表', res)
					}).catch(error => {
						console.log('巡查列表', error)
					});
					// 查询本地数据
					await this.selectLocalData();
				} else {
					// 1. 查询本地数据
					await this.selectLocalData();
				}
			},
			// 查询本地列表数据
			async selectLocalData() {
				// 状态 0--未开始，1--进行中，2--已完成，-1 --逾期，3--转派中,4--全部  order by createTime desc
				let limit = 10;
				let selectSQL =
					`select * from ipis_inspection_list where status="${this.status}" AND userid="${this.getUsers.id}" order by createTime desc limit "${this.limit}", "${limit}"`;
				let data = await this.$db.selectSQL(selectSQL);
				let initData = data.map(item => {
					item.frequency = JSON.parse(item.frequency)
					return item
				})
				this.isLoadMore = data.length ? true : false;
				this.loadMoreText = this.isLoadMore ? '加载更多' : "没有更多数据了!"
				this.listData = this.listData.concat(initData);
				console.log('巡查离线列表数据', this.listData)
				this.isEmptyData = this.listData.length > 0 ? false : true;
				uni.hideLoading();
				uni.stopPullDownRefresh();
			},
			handleSwitch(status) {
				this.limit = 0;
				this.page = 1;
				this.showLoadMore = false;
				this.status = status;
				this.listData = [];
				this.listInit();
			},
		}
	}
</script>

<style lang="scss" scoped>
	.patrol-wrap {
		overflow: hidden;
		height: 100%;
		background-color: #F5F5F5;

		.header-tabbar {
			position: fixed;
			top: 0;
			left: 0;
			right: 0;
			height: 42px;
			padding: 0 14px;
			z-index: 9;
			display: flex;
			align-items: center;
			justify-content: space-between;
			background-color: #FFFFFF;
			border-bottom: 1rpx solid rgba($color: #e5e5e5, $alpha: 0.5);
		}

		// #ifdef H5
		.header-tabbar {
			top: 44px;
		}

		// #endif
		.tabbar-item {
			line-height: 42px;
			font-size: 15px;
			color: #333333;
			border-bottom: 2px solid transparent;
		}

		.active-tabbar {
			color: $uni-color-primary;
			border-bottom: 2px solid $uni-color-primary;
		}

		.list-wrap {
			margin-top: 42px;
			padding: 12px 8px;
		}
	}
</style>
