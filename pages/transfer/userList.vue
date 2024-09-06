<template>
	<view class="content">
		<view class="device-wrap">
			<view v-for="item in list" :key="item.id"
				:class="['collapse-wrap', selectId == item.id ? 'select-item' : '']" @click="selectUser(item)">
				<!-- :class="['collapse-wrap', current === item.id ? 'collapse-open' : '']" @click="selectUser(item.id)"> -->
				<!-- 			<view class="collapse-header border-bottom__1" @click="handleCollapse(item.id)">
					<view class="collapse-title">
						<text>{{item.department}}</text>
						<text class="second-level">（{{item.users.length}}台）</text>
					</view>
					<image class="right-icon" src="/static/my_right.png" mode="scaleToFill"></image>
				</view> -->
				<view class="collapse-content">
					<view class="content-item">
						<view class="content-title">
							<text>{{item.department}}-{{item.userName}}</text>
							<text class="phone" v-if="item.phoneNum">（电话号码：{{item.phoneNum}}）</text>
						</view>
						<view class="content-info">
							<text
								v-for="(roles, index) in item.roles">{{roles.name}}{{index+1 == item.roles.length ? '': '、'}}</text>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		mapGetters,
	} from 'vuex'
	export default {
		data() {
			return {
				list: [],
				current: 0,
				selectId: '',
				options: {}
			}
		},
		onLoad(option) {
			this.getList();
			this.options = option;
		},
		computed: {
			...mapGetters({
				getUsers: 'user/getUserInfo'
			})
		},
		methods: {
			getList() {
				this.$request('/v1/user/', {
					page: 1,
					pageSize: 9990
				}).then(res => {
					// if (res.code === 200) {
						this.list = res.data.filter(item => {
							return item.id != this.getUsers.id && item.id != 1 && item.id != -1;
						})
					// }
				})
			},
			// 选择用户
			selectUser(user) {
				this.selectId = user.id;
				uni.redirectTo({
					url: `/pages/transfer/redeploy?id=${user.id}&username=${user.userName}&taskNumber=${this.options.taskNumber}&type=${this.options.type}&taskId=${this.options.taskId}`
				});
			},
			handleCollapse(id) {
				this.current = this.current === id ? 0 : id;
			}
		}
	}
</script>

<style lang="scss" scoped>
	.content {
		overflow: hidden;
	}

	.device-wrap {
		margin-top: 16px;
		background-color: #FFFFFF;

		.select-item {
			background-color: #f2f2f2;
		}

		.collapse-wrap {
			// height: 96rpx;
			// margin-left: 30rpx;
			// overflow: hidden;
			border-bottom: 1rpx solid #E5E5E5;
			transition: all 0.3s;

			.collapse-header {
				height: 49px;
				display: flex;
				align-items: center;
				justify-content: space-between;
				padding-right: 20px;
			}

			.collapse-title {
				font-size: 15px;
				color: #000000;
			}

			.second-level {
				color: #b2b2b2;
			}

			.collapse-content {
				padding: 25rpx 0 25rpx 80rpx;


				.content-item {
					border-bottom: 1rpx solid #E5E5E5;

					&:last-child {
						border-bottom: 0;
					}

					.content-title {
						font-size: 15px;
						color: #000000;
						margin-bottom: 5px;

						.phone {
							font-size: 13px;
							color: #707070;
						}
					}

					.content-info {
						font-size: 13px;
						color: #707070;
						// margin-bottom: 10rpx;
					}
				}
			}
		}

		.collapse-open {
			height: auto;
			overflow: auto;
			border-bottom: 1rpx solid #E5E5E5;

			.right-icon {
				transform: rotate(90deg);
			}
		}
	}
</style>
