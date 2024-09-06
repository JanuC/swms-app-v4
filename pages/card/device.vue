<template>
	<view class="content" :style="{'height': listData.length !== 0? '100vh':'auto'}">
		<view class="header-wrap">
			<view class="header-tabbar">
				<view :class="['tabbar-item', cardType == 0 ? 'action-tabbar-item' : '']" @click="handleSwitch(0)">
					<text>设备</text>
				</view>
				<view :class="['tabbar-item', cardType == 1 ? 'action-tabbar-item1' : '']" @click="handleSwitch(1)">
					<text>巡查点</text>
				</view>
			</view>
		</view>
		<view class="device-wrap device-list" v-show="cardType == 0">
			<view v-show="listData.length !== 0 " v-for="(item, i) in listData" :key="item.id"
				:class="['collapse-wrap', current == i ? 'collapse-open' : '']">
				<view class="collapse-header border-bottom__1" @click="handleCollapse(i)">
					<view class="collapse-title">
						<text>{{item.location}}</text>
						<text class="second-level">（{{item.count}}台）</text>
					</view>
					<image class="right-icon" src="/static/my_right.png" mode="scaleToFill"></image>
				</view>
				<view class="collapse-content">
					<view
						@click="checkDevice(val.nfcTag, item.location, val.id, val.name,val.id, val.deviceId, val.locationPic)"
						class="content-item" v-for="val in item.device" :key='val.id'>
						<view class="content-title">
							<text>{{val.name}}</text>
						</view>
						<view class="content-info">
							<text>nfc：{{val.nfcTag}}</text>
						</view>
						<view class="content-info">
							<text>品牌&型号：{{val.brand}}</text>
						</view>
						<view class="content-img">
							<image v-for="item in val.locationPic" class="patrol-photo" :src="preview + item"
								mode="scaleToFill"></image>
						</view>
					</view>
				</view>
			</view>
		</view>
		<view class="device-wrap " :class="{'localtion-list': listData.length !== 0}" v-show="cardType == 1">
			<view class="collapse-header search-header border-bottom__1">
				<input type="text" v-model="searchText" placeholder="关键字搜索" />
				<image @click="search" src="@/static/search.png" mode="widthFix"></image>
			</view>
			<view v-show="listData.length !== 0 " class="list-warp">
				<view @click="checkDevice(item.nfcTag, item.location, item.id, item.name,item.id, undefined, undefined)"
					v-for="item in listData" :key="item.id">
					<view class="label-title ">
						<text>{{item.name}}</text>
					</view>
					<view class="card-content border-bottom__1">
						<view class="list">
							<text class="list-label">位置:</text>
							<text class="list-label">{{item.location}}</text>
						</view>
						<view class="list">
							<text class="list-label">nfc:</text>
							<text class="list-label">{{item.nfcTag}}</text>
						</view>
					</view>
				</view>
			</view>
		</view>

		<view v-show="listData.length == 0" :class="cardType == 0 ? 'height1':'height2'" class="empty-data">
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
				current: -1,
				cardType: 0,
				listData: [],
				deviceData: [],
				localData: [],
				searchText: '',
				preview: uni.getStorageSync('links').preview
			}
		},
		onShow() {
			this.getList()
		},
		onLoad() {
			// 加载点位数据
			this.$request('/v1/inspection/getList').then(res => {
				this.localData = res.data;
			})
		},
		methods: {
			handleCollapse(i) {
				this.current = this.current === i ? -1 : i;
			},
			handleSwitch(type) {
				this.cardType = type;
				if (type == 0) {
					this.listData = this.deviceData;
				} else {
					this.search();
				}
			},
			// 搜索巡检点信息
			search() {
				this.listData = this.localData.filter(item => {
					if (item.name.includes(this.searchText) || item.nfcTag.includes(this.searchText) || item
						.location.includes(this.searchText)) {
						return item
					}
				})
			},
			// 获取数据
			getList() {
				this.$request('/v3/ipis/card/device').then(res => {
					// if (res.code == 200) {
						this.deviceData = res.data;
						this.listData = res.data;
					// }
				})
			},
			//选择设备
			checkDevice(code, location, id, name, cardNo, deviceId, preture) {
				this.$store.commit('app/SET_NFCINFO', {
					code,
					location,
					type: this.cardType,
					id,
					name,
					deviceId,
					preture,
					cardNo
				});
				uni.navigateBack({
					key: 0
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.content {
		// height: 100vh;
		overflow: hidden;

		// .height1 {
		// 	height: calc(100vh - 10px - 95px);
		// }

		// .height2 {
		// 	height: calc(100vh - 10px - 95px - 40px);
		// }
	}

	.device-wrap {
		background-color: #FFFFFF;
		padding-top: 10px;
		overflow: auto;

		.search-header {
			height: 40px;
			margin: 0px auto;
			width: 96%;
			border-radius: 20px;
			border: solid 1px #ccc;
			display: flex;
			align-items: center;

			input {
				flex: 1;
				text-align: center;
			}

			image {
				width: 48rpx;
				margin-right: 10px;
			}
		}


		.collapse-wrap {
			height: 48px;
			margin-left: 15px;
			overflow: hidden;
			border-bottom: 1px solid transparent;
			transition: all 0.3s;

			.collapse-header {
				height: 48px;
				display: flex;
				align-items: center;
				justify-content: space-between;
				padding-right: 20px;
			}


			.collapse-title {
				font-size: 17px;
				color: #000000;
				// &>text:first-child{
				// 	width: 80px;
				// 	display: inline-block;
				// }
			}

			.second-level {
				color: #b2b2b2;
			}

			.collapse-content {
				padding: 12px 0 12px 40px;


				.content-item {
					padding-bottom: 12px;
					border-bottom: 1px solid #E5E5E5;

					&:last-child {
						border-bottom: 0;
					}

					.content-title {
						font-size: 15px;
						color: #000000;
						margin-bottom: 5px;
					}

					.content-info {
						font-size: 13px;
						color: #707070;
						margin-bottom: 5px;
					}

					.content-img {
						display: flex;
						align-items: center;


						.patrol-photo {
							margin-right: 22px;
						}
					}
				}
			}
		}

		.right-icon {
			width: 10px;
			height: 20px;
		}

		.collapse-open {
			height: auto;
			overflow: auto;
			border-bottom: 1px solid rgba($color: #e5e5e5, $alpha: 0.5);

			.right-icon {
				transform: rotate(90deg);
			}
		}

		.label-title {
			height: 36px;
			line-height: 36px;
			padding-left: 10px;
		}

		.list {
			display: flex;
			justify-content: space-between;
			padding: 0 20px;
			font-size: 14px;
			color: #999999;
			padding-bottom: 10px;
			line-height: 26px;

			.list-label:first-child {
				width: 40px;
			}

			.list-label:last-child {
				text-align: right;
				flex: 1;
				flex-wrap: wrap;
			}
		}

	}

	.device-list {
		height: calc(100% - 10px);
	}

	.localtion-list {
		height: calc(100vh - 50px);

		.list-warp {
			height: calc(100% - 40px);
			overflow: auto;
		}
	}


	.header-wrap {
		display: flex;
		justify-content: center;
		margin: 10px;

		.header-tabbar {
			display: flex;
			align-items: center;
			width: 180px;
			height: 35px;
			background-color: #FFFFFF;
			border-radius: 20px;

			.tabbar-item {
				width: 90px;
				line-height: 35px;
				text-align: center;
			}

			.action-tabbar-item {
				background-color: #9E4A63;
				color: #FFFFFF;
				border-radius: 20px 0 0 20px;
			}

			.action-tabbar-item1 {
				background-color: #9E4A63;
				color: #FFFFFF;
				border-radius: 0 20px 20px 0;
			}
		}
	}
</style>
