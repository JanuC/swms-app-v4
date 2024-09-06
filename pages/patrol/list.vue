<!-- 巡检 -->
<template>
	<view class="content patrol-wrap">
		<view class="header-tabbar">
			<view :class="['tabbar-item', item.status == status ? 'active-tabbar' : '']" v-for="item in tabbars"
				:key="item.status" @click="handleSwitch(item.status)">
				<text>{{item.title}}</text>
			</view>
		</view>
		<view class="list-wrap">
			<navigator :url="`/pages/patrol/details?id=${item.taskId}`" class="list-children" v-for="item in listData"
				:key="item.id">
				<view class="list-header">
					<text class="list-number">{{item.planName|filterName}}</text>
					<view class="list-status">
						<!-- 状态 0--未开始，1--进行中，2--已完成，-1 --逾期，3--转派中,4--全部 -->
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
						<text class="list-left_text">巡检时间</text>
						<view class="list-right__content">
							<text>{{item.startTime|filterDate}}<text
									class="delimiter">至</text>{{item.endTime|filterDate}}</text>
						</view>
					</view>
					<view class="list-content__item">
						<text class="list-left_text">任务进度</text>
						<view class="list-right__content">
							<view class="progress-bar">
								<view class="progress" :style="{width: (item.finishNum/item.total*100)+'%'}"></view>
							</view>
							<text>{{item.finishNum}}/{{item.total}}</text>
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
		mapActions,
		mapGetters
	} from "vuex";
	import syncFunc from '@/utils/dataSync.js';
	import patrol from './patrol.js';
	export default {
		data() {
			return {
				// 状态 0--未开始，1--进行中，2--已完成，-1 --逾期，3--转派中,4--全部
				tabbars: this.$config.taskStatus,
				status: 0,
				listData: [],
				isEmptyData: false, // 是否是空数据
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
				getPatrolTask: 'app/getPatrolTask'
			})
		},
		onLoad() {
			this.page = 1;
			this.limit = 0;
			this.showLoadMore = false;
			this.listData = [];
			this.listInit();
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
			getPatrolTask(val) {
				this.listData.forEach((item, index) => {
					if (item.taskId === val.id) {
						item.finishNum = val.finishNum;
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
					title: '努力加载中...',
					mask: true,
				});
				// uni.navigateTo({
				// 	url: '/pages/popup/page-loading',
				// 	success() {
				// 		console.log('成功')
				// 	}
				// })
				let isNetwork = await this.$utils.monitorNetwork();
				if (isNetwork) {
					// 处理数据同步
					await syncFunc.handlePatrolSync().then(res => {
						console.log('同步更新成功', res)
					}).catch(error => {
						console.log('同步更新失败', error)
					});
					await syncFunc.syncPatrolListData(this.status, this.page, this.pageSize).then(res => {
						console.log('巡检列表', res)
					}).catch(error => {
						console.log('巡检列表', error)
					});
					// 查询本地数据
					await this.selectLocalData();
				} else {
					// 1. 查询本地数据
					await this.selectLocalData()
				}
			},
			// 查询本地列表数据
			async selectLocalData() {
				// 状态 0--未开始，1--进行中，2--已完成，-1 --逾期，3--转派中,4--全部
				let select =
					`select * from ipis_patrol_list where status="${this.status}" AND userid = "${this.getUsers.id}" order by createTime desc limit "${this.limit}", "10"`;
				this.$db.selectSQL(select).then(data => {
					this.isLoadMore = data.length ? true : false;
					this.loadMoreText = this.isLoadMore ? '加载更多' : "没有更多数据了!"
					this.listData = this.listData.concat(data);
					console.log('本地列表数据', this.listData)
					this.isEmptyData = this.listData.length > 0 ? false : true;
					uni.hideLoading();
					// uni.navigateBack()
					uni.stopPullDownRefresh();
				}).catch(error => {
					console.log('查询本地数据失败', error)
				});
			},
			handleSwitch(status) {
				this.limit = 0;
				this.page = 1;
				this.showLoadMore = false;
				this.isEmptyData = false;
				this.status = status;
				this.listData = [];
				this.listInit();
			},
		}
	}
</script>

<style lang="scss">
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
