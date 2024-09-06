<template>
	<view class="content card-wrap">
		<view v-show="listData.lenght !==0" class="card-group" @click="gotoDetails(item)"
			v-for="(item, index)  in listData" :key='item.id'>
			<view class="label-title border-bottom__1">
				<text>{{item.replaceTime}}</text>
			</view>
			<view class="card-content">
				<view class="list">
					<text class="list-label">设备点位:</text>
					<text class="list-label">{{item.name}}</text>
				</view>
				<view class="list">
					<text class="list-label">类型:</text>
					<text class="list-label">{{item.type == 0 ? '设备':'巡查点'}}</text>
				</view>
				<view class="list">
					<text class="list-label">新nfc卡号:</text>
					<text class="list-label">{{item.cardId}}</text>
				</view>
			</view>
		</view>
		<view v-show="listData.length == 0" class="empty-data">
			<image class="no-data__image" src="@/static/noData.png" mode="widthFix"></image>
			<text class="no-data__text">暂无数据</text>
		</view>
	</view>
</template>

<script>
	import moment from 'moment';
	import NFC from '@/utils/nfc.js';
	import {
		mapGetters,
		mapMutations
	} from 'vuex';
	export default {
		data() {
			return {
				params: {
					type: 'top',
					pageNo: 1,
					pageSize: 10
				},
				listData: []
			}
		},
		onLoad() {

		},
		onShow() {
			this.getList(this.params)
		},
		onNavigationBarButtonTap(e) {
			if (e.text == '更换') {
				uni.navigateTo({
					url: './replace'
				})
			}
		},
		onPullDownRefresh() {
			this.params.type = 'top';
			this.params.pageNo = 1;
			this.getList(this.params);
			setTimeout(() => {
				uni.stopPullDownRefresh()
			}, 1000)
		},
		onReachBottom() {
			this.params.type = 'bottom';
			this.params.pageNo += 1;
			this.getList(this.params);
		},
		methods: {
			...mapMutations({
				removeNfcData(commit) {
					commit('app/REMOVE_NFC_DATA')
				},
			}),
			// 跳转详情
			gotoDetails(item) {
				uni.setStorage({
					key: 'cardInfoData',
					data: item,
					success: () => {
						uni.navigateTo({
							url: './details?id=' + item.cardId
						})
					}
				})
			},
			// 获取列表数据		
			getList(params) {
				let req = {
					pageNo: params.pageNo,
					pageSize: params.pageSize
				}
				this.$request('/v3/ipis/card/list', req).then(res => {
					if (params.type == 'top') {
						this.listData = res.data
					} else {
						this.listData = [...this.listData, ...res.data]
					}
				})
			},
		}
	}
</script>

<style lang="scss" scoped>
	.card-wrap {
		overflow: hidden;
		height: 100%;
		background-color: #F5F5F5;

		.card-group {
			padding-left: 15px;
			background-color: #FFFFFF;
			margin-top: 10px;
		}

		.card-group__top {
			padding-top: 15px;
		}

		.label-title {
			font-size: 17px;
			color: #000000;
			padding: 10px 0;
		}

		.card-content {
			padding: 8px 15px 0 0;

			.list {
				display: flex;
				line-height: 25px;
				justify-content: space-between;
				padding: 8px 0;

				&>.list-label:first-child {
					width: 100px
				}

				&>.list-label:last-child {
					flex: 1;
					text-align: right;
					word-wrap: break-word;
					word-break: break-all;
				}
			}

			.list-label {
				font-size: 14px;
				color: #707070;
			}

			.select-button {
				// width: 72px;
				padding: 0 10px;
				height: 25px;
				line-height: 25px;
				text-align: center;
				background-color: #306dfe;
				border-radius: 12px;
				font-size: 12px;
				color: #ffffff;
			}
		}

		.add-img {
			width: 100px;
			height: 80px;
			border: solid 1rpx rgba(229, 229, 229, 0.5);
			border-radius: 5px;
			display: flex;
			align-items: center;
			justify-content: center;

			.increase {
				width: 32px;
				height: 32px;
			}
		}

		.img-wrap {
			position: relative;
			margin-bottom: 10px;

			.delete-icon {
				width: 16px;
				height: 16px;
				position: absolute;
				top: 5px;
				right: 5px;
				z-index: 2;
			}
		}
	}
</style>
