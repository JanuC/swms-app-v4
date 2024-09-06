<template>
	<view class="content patrol-wrap">
		<view class="header-tabbar">
			<view :class="['tabbar-item', item.id === activeTabbar ? 'active-tabbar' : '']" v-for="item in tabbars"
				:key="item.id" @click="handleSwitch(item.id)">
				<text>{{item.name}}</text>
			</view>
		</view>
		<view class="list-wrap">
			<navigator :url="`/pages/exception/details?data=${JSON.stringify(item)}`" class="list-children"
				v-for="item in listData" :key="item.id">
				<view class="list-header">
					<text class="list-number">{{item.reportTime}}</text>
					<view class="list-status" v-if="item.status">
						<image class="status-icon" :src="`/static/status_2.png`" mode="scaleToFill">
						</image>
						<text :class="`list-status__text2`">已处理</text>
					</view>
					<view class="list-status" v-else>
						<image class="status-icon" :src="`/static/status_1.png`" mode="scaleToFill"></image>
						<text :class="`list-status__text1`">未处理</text>
					</view>
				</view>
				<view class="list-content">
					<view class="list-content__item">
						<text class="list-left_text">描述:</text>
						<view class="list-right__content " :class="{'infoText': item.description.length > 13}"
							v-if="item.descriptionType == 0">
							<text>{{item.description}}</text>
						</view>
						<view class="list-right__content" v-if="item.descriptionType == 1">
							<text>点击查看语音</text>
						</view>
					</view>
					<view class="list-content__item">
						<text class="list-left_text">位置:</text>
						<view class="list-right__content">
							<text>{{item.location}}</text>
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
	export default {
		data() {
			return {
				tabbars: [{
					id: '2',
					name: '全部'
				}, {
					id: '1',
					name: '已处理'
				}, {
					id: '0',
					name: '未处理'
				}, ],
				activeTabbar: '2',
				listData: [],
				params: {
					abnormalId: '', // 异常编号
					reportor: '', // 上报人员
					reportTime: '', // 上报时间
					location: '', // 位置
					status: '2', // 状态 0-未处理; 1-已处理
					pageNo: 1,
					pageSize: 10
				},
				isEmptyData: false,
				loadMoreText: "加载中...",
				showLoadMore: false,
			};
		},
		async onShow() {
			this.params.pageNo = 1;
			this.showLoadMore = false;
			this.listData = [];
			await this.getListData();
		},
		onUnload() {
			this.listData = [];
			this.loadMoreText = "加载更多";
			this.showLoadMore = false;
		},
		onReachBottom() {
			if (this.listData.length >= 10) {
				this.loadMoreText = "加载中";
				this.showLoadMore = true;
				this.params.pageNo += 1;
				this.getListData();
			}
		},
		onPullDownRefresh() {
			this.params.pageNo = 1;
			this.showLoadMore = false;
			this.listData = [];
			this.getListData();
		},
		methods: {
			getListData() {
				uni.showLoading({
					title: '加载中...',
					mask: true,
				});
				this.$request('/v1/abnormals', this.params, 'GET').then(res => {
					// if (res.code === 200) {
						console.log(res.data)
						this.isLoadMore = res.data.length ? true : false;
						this.loadMoreText = this.isLoadMore ? '加载更多' : "没有更多数据了!"
						this.listData = this.listData.concat(res.data);
						console.log('异常列表', this.listData)
						this.isEmptyData = this.listData.length > 0 ? false : true;
						uni.hideLoading();
						uni.stopPullDownRefresh();
					// }
				}).catch(error => {
					console.log('失败', error)
					this.isEmptyData = true;
					uni.hideLoading();
					uni.stopPullDownRefresh();
				})
			},
			handleSwitch(id) {
				this.activeTabbar = id;
				this.params.status = id;
				this.params.pageNo = 1;
				this.listData = [];
				this.getListData()
			}
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
			border-top: 1rpx solid rgba($color: #e5e5e5, $alpha: 0.5);
		}

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
			margin-top: 54px;
		}

		.list-content__item {
			.list-left_text {
				width: 40px;
			}
		}

		.list-right__content {
			margin-left: 15px;
			flex: 1;
			text-align: right;

			text {

				width: 100%;

			}
		}

		.infoText {
			height: 40px;
			overflow: hidden;
			text-overflow: ellipsis;
			display: -webkit-box;
			-webkit-line-clamp: 2;
			-webkit-box-orient: vertical;
		}
	}
</style>
