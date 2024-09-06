<template>
	<view class="inform">
		<navigator :url="`/pages/notice/details?id=${item.id}`" class="list-children" v-for="item in listData"
			:key="item.id">
			<view class="list-header">
				<text class="list-number">{{item.taskNumber}}</text>
				<view class="list-status">
					<image class="right-icon" src="/static/my_right.png" mode="scaleToFill"></image>
				</view>
			</view>
			<view class="list-content">
				<view class="list-content__item">
					<text class="list-left_text list-label__user">转派<text class="letter-spacing__0">人</text></text>
					<view class="list-right__content">
						<text>{{item.sponsor}}</text>
					</view>
				</view>
				<view class="list-content__item">
					<text class="list-left_text">工单编号</text>
					<view class="list-right__content">
						<text>{{item.taskNumber}}</text>
					</view>
				</view>
				<view class="list-content__item">
					<text class="list-left_text">转派时间</text>
					<view class="list-right__content">
						<text>{{item.updateTime}}</text>
					</view>
				</view>
			</view>
		</navigator>	
		<view class="empty-data" v-if="isEmptyData">
			<image class="no-data__image" src="@/static/noData.png" mode="widthFix"></image>
			<text class="no-data__text">暂无数据</text>
		</view>
	</view>
</template>

<script>
	import {
		mapMutations
	} from 'vuex';
	export default {
		data() {
			return {
				listData: [],
				isEmptyData: false, // 是否是空数据
			};
		},
		onShow() {
			this.getList()
		},
		onLoad() {
			this.setShowDots(false);
			// uni.hideTabBarRedDot({
			// 	index: 1,
			// 	success() {
			// 		console.log('红点消失成功')
			// 	},
			// 	fail() {
			// 		console.log('红点消失失败')
			// 	}
			// })
		},
		methods: {
			...mapMutations({
				setShowDots: 'user/SET_SHOW_DOTS'
			}),
			// 列表数据
			getList() {
				this.$request('/v1/taskTransfer/getTaskTransferDetiles').then(res => {
					// if (res.code === 200) {
						this.listData = res.data;
						this.isEmptyData = this.listData.length <= 0;
					// }
				})
			},
		}
	}
</script>

<style lang="scss">
	.inform {
		padding-top: 17px;
	}

	.list-header {
		.list-status {
			.right-icon {
				width: 9px;
				height: 15px;
			}
		}
	}

	.list-content {
		.list-label__user {
			letter-spacing: 8px;
		}
	}
</style>
