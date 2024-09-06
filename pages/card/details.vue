<template>
	<view class="content ">
		<view class="card-wrap">
			<view class="card-group card-group__top">
				<view class="label-title border-bottom__1">
					<text>更换信息</text>
				</view>
				<view class="card-content">
					<view class="list">
						<text class="list-label">更换时间:</text>
						<text class="list-label">{{details.replaceTime}}</text>
					</view>
					<view class="list">
						<text class="list-label">更换人:</text>
						<text class="list-label">{{details.replaceMan}}</text>
					</view>
				</view>
			</view>
			<view class="card-group">
				<view class="label-title border-bottom__1">
					<text>设备或点位信息</text>
				</view>
				<view class="card-content">
					<view class="list list-warp">
						<text class="list-label">设备/点位</text>
						<text class="list-label">旧NFC</text>
						<text class="list-label">新NFC</text>
					</view>
					<view class="list list-warp" v-for="item in listData">
						<text class="list-label">{{item.name}}</text>
						<text class="list-label">{{item.cardOriginId}}</text>
						<text class="list-label">{{item.cardId}}</text>
					</view>
				</view>
			</view>
			<view class="card-group">
				<view class="label-title border-bottom__1">
					<text>现场图片</text>
				</view>
				<view class="card-content"
					<view class="list">
						<view v-if="details.picture" class="">
							<image @click="$utils.previewImg(preview + item)" class="patrol-photo"
								v-for="item in details.picture.split(',')" :src="preview + item" mode="scaleToFill">
							</image>
						</view>
						<text v-else class="list-label">无</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				details: {},
				listData: [],
				preview: uni.getStorageSync('links').preview
			}
		},
		onLoad(options) {
			uni.getStorage({
				key: 'cardInfoData',
				success: (res) => {
					this.details = res.data
					this.$request('/v3/ipis/card/devices/' + res.data.id).then(res => {
						this.listData = res.data;
					}).catch(error => {
						console.log(error)
					})
				}
			})
		},
		methods: {
			// 预览图片
			previewImg(img) {
				uni.previewImage({
					current: 0,
					urls: [img]
				})
			},
			getCardDetails(id) {
				console.log(id)
				this.details = {
					"id": "123", //卡片更换记录主键ID
					"type": 0, //类型:  0-设备; 1-巡查点
					"cardNo": "123", //设备或巡查点ID
					cardNum: '设备或巡查点编号',
					"name": "设备或巡查点名称", //设备或巡查点名称
					"replaceMan": "老周", //卡片更换人员
					"replaceManId": "", //卡片更换人员ID
					"replaceTime": "2021-08-27 13:54", //卡片更换时间
					"cardOriginId": "旧NFC卡号", //旧NFC卡号
					"cardId": "新NFC卡号", // 新NFC卡号
					"picture": "", //更换现场图片
					"location": "位置", //位置
					"locationPic": "" //安装位置图片
				}
				this.$request('/v3/ipis/card/devices/' + id, {
					cardNo: id
				}).then(res => {
					this.listData = res.data;
				}).catch(error => {
					console.log(error)
				})
			},

		}
	}
</script>

<style lang="scss" scoped>
	.content {
		background-color: rgba(242, 242, 242, 1);

		.card-wrap {
			margin-bottom: 10px;

			.card-group {
				padding-left: 15px;
				background-color: #FFFFFF;
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
					padding: 8px 0;
					justify-content: space-between;


					image {
						margin-right: 10px;
					}
				}

				.list-warp {
					&>.list-label:first-child {
						width: 80px;
					}

					.list-label {
						flex: 1;
						word-wrap: break-word;
						word-break: break-all;
						margin: 0 4px;
					}
				}

				.list-title {
					margin: 4px 0;
				}

				.list-label {
					font-size: 14px;
					color: #707070;
				}
			}

			.scene-picture {
				display: flex;
				justify-content: space-between;
				flex-wrap: wrap;
				padding: 10px 0 20px;

				.img-wrap {
					width: 100px;
					height: 80px;
					position: relative;
					margin-bottom: 10px;

					.delete-icon {
						width: 15px;
						height: 15px;
						position: absolute;
						top: 5px;
						right: 5px;
						z-index: 2;
					}
				}
			}
		}
	}
</style>
