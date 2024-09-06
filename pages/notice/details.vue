<template>
	<view class="content patrol-wrap">
		<view class="task-card list-children">
			<view class="list-header" v-if="details.record">
				<text class="list-number">{{details.record.taskNumber}}</text>
				<view class="list-status">
					<image v-if="details.record.status == 0 || details.record.status == 1" class="status-icon"
						src="/static/status_1.png" mode="scaleToFill"></image>
					<image v-else-if="details.record.status == 2" class="status-icon" src="/static/status_2.png"
						mode="scaleToFill"></image>
					<image v-else-if="details.record.status == -1" class="status-icon" src="/static/status_3.png"
						mode="scaleToFill"></image>
					<text v-if="details.record.status == 2" class="list-status__text2">
						已完成
					</text>
					<text v-if="details.record.status == 0 || details.record.status == 1" class="list-status__text1">
						未完成
					</text>
					<text v-if="details.record.status == 3" class="list-status__text4">
						转派中
					</text>
					<text v-if="details.record.status == -1" class="list-status__text3">
						逾期
					</text>
				</view>
			</view>
			<view class="list-content">
				<view class="list-content__item">
					<text class="list-left_text">任务进度</text>
					<view class="list-right__content" v-if="details.type == 0">
						<view class="progress-bar">
							<view class="progress"
								:style="{width: (details.record.completed/details.record.total*100)+'%'}">
							</view>
						</view>
						<text>{{details.record.completed}}/{{details.record.total}}</text>
					</view>
					<view class="list-right__content" v-if="details.type == 1">
						<view class="progress-bar">
							<view class="progress"
								:style="{width: (details.record.finishNum/details.record.total*100)+'%'}">
							</view>
						</view>
						<text>{{details.record.finishNum}}/{{details.record.total}}</text>
					</view>
				</view>
				<view class="list-content__item" v-if="details.type == 0">
					<text class="list-left_text list-left_type">类<text class="letter-spacing__0">型</text></text>
					<view class="list-right__content">
						<text>{{details.record.type == '0' ? '无序巡查' : (details.record.type == '1' ? '有序巡查' : '-' )}}</text>
					</view>
				</view>
				<view class="list-content__item" v-if="details.type == 1">
					<text class="list-left_text">开始时间</text>
					<view class="list-right__content">
						<text>{{details.record.startTime}}</text>
					</view>
				</view>
				<view class="list-content__item" v-if="details.type == 1">
					<text class="list-left_text">截止时间</text>
					<view class="list-right__content">
						<text>{{details.record.endTime}}</text>
					</view>
				</view>
				<view class="list-content__item" v-if="details.type == 0">
					<text class="list-left_text">开始时间</text>
					<view class="list-right__content">
						<text>{{details.record.createTime}}</text>
					</view>
				</view>
				<view class="list-content__item" v-if="details.type == 0">
					<text class="list-left_text">截止时间</text>
					<view class="list-right__content">
						<text>{{details.record.deadline}}</text>
					</view>
				</view>
				<view class="list-content__item align-items__end" v-if="details.type == 0">
					<text class="list-left_text">限制班次</text>
					<view class="list-right__content list-right__tabs">
						<text class="list-tabs" v-for="classes in details.record.frequency"
							:key="classes">{{classes}}</text>
						<text v-if="!details.record.frequency.length">无</text>
					</view>
				</view>
			</view>
		</view>
		<view class="list-children single-group" v-if="details.type == 1">
			<view class="list-header" v-for="item in details.record.devices">
				<text class="list-number">{{item.deviceName}}</text>
				<view class="list-status">
					<image v-if="item.status == 0" class="status-icon" src="/static/status_1.png" mode="scaleToFill">
					</image>
					<image v-else-if="item.status == 1 || item.status == -1" class="status-icon"
						src="/static/status_2.png" mode="scaleToFill"></image>
					<text v-if="item.status == 1 || item.status == -1" class="list-status__text2">
						已完成
					</text>
					<text v-if="item.status == 0" class="list-status__text1">
						未完成
					</text>
				</view>
			</view>
		</view>
		<view class="list-children single-group" v-if="details.type == 0">
			<view class="list-header" v-for="item in details.record.patrol">
				<text class="list-number">{{item.name}}</text>
				<view class="list-status">
					<image v-if="item.status == 0" class="status-icon" src="/static/status_1.png" mode="scaleToFill">
					</image>
					<image v-else-if="item.status == 1 || item.status == -1" class="status-icon"
						src="/static/status_2.png" mode="scaleToFill"></image>
					<text v-if="item.status == 1 || item.status == -1" class="list-status__text2">
						已完成
					</text>
					<text v-if="item.status == 0" class="list-status__text1">
						未完成
					</text>
				</view>
			</view>
		</view>
		<view class="footer-wrap" v-if="details.record">
			<view class="button-wrap">
				<button type="default" @click="handleSubmit(2)">拒绝</button>
			</view>
			<view class="button-wrap">
				<button type="primary" @click="handleSubmit(1)">接收</button>
			</view>
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
				details: {},
				taskId: ''
			}
		},
		onLoad(option) {
			this.setShowDots(false);
			this.taskId = option.id;
			this.getDetails(option.id);
		},
		methods: {
			...mapMutations({
				setShowDots: 'user/SET_SHOW_DOTS'
			}),
			getDetails(id) {
				this.$request(`/v1/taskTransfer/getTaskTransfer`, {
					id
				}).then(res => {
					// if (res.code === 200) {
					if (res.data) {
						this.details = res.data;
					} else {
						uni.switchTab({
							url: '/pages/tabbar/index'
						});
					}
					// }
				})
			},
			handleSubmit(result) {
				let params = {
					"taskNumber": this.details.record.taskNumber, // tasknumber
					"id": this.taskId, // 通知id
					"sendType": "0", // 发送对象
					"result": result, // 转派结果 1--同意 2--拒绝
				}
				this.$request('/v1/taskTransfer/updateTaskTransfer', params, 'POST').then(res => {
					// if (res.code === 200) {
					// 0巡查1巡检
					uni.navigateBack({
						delta: 1
					});
					// }
				}).catch(error => {
					// this.$utils.toast(error.errInfo.msg)
					this.$utils.toast(error.err.info)
				})
			}
		}
	}
</script>

<style lang="scss">
	.patrol-wrap {
		overflow: hidden;
		height: 100%;
		background-color: #F5F5F5;
	}

	.task-card {
		margin-top: 17px;
	}

	.single-group {
		.list-header {
			.list-number {
				font-size: 16px;
			}

			&:last-child {
				border-bottom: 0;
			}
		}
	}
</style>