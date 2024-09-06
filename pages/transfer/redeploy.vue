<template>
	<view class="content task-content">
		<view class="form-wrap">
			<view class="form-group">
				<view class="form-item border-bottom__1">
					<text class="form-label">接收人员</text>
					<navigator class="select" open-type="redirect" hover-class="none"
						:url="`/pages/transfer/userList?taskNumber=${formData.taskNumber}&type=${type}&taskId=${taskId}`">
						<input type="text" v-model="formData.receiver" placeholder-class="input-placeholder" disabled
							placeholder="请选择" />
						<image class="right-icon" src="/static/my_right.png" mode="scaleToFill"></image>
					</navigator>
				</view>
				<view class="form-item">
					<text class="form-label">转派原因</text>
					<view>
						<input type="text" v-model="formData.transfertReason" placeholder-class="input-placeholder"
							maxlength="150" placeholder="请输入" />
					</view>
				</view>
			</view>
			<view class="button-wrap">
				<button type="primary" :loading="submit_loading" @click="handleTaskRedeploy">确定</button>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		mapGetters,
		mapMutations
	} from 'vuex';
	import moment from 'moment';
	import syncFunc from '@/utils/dataSync.js';
	import {
		generate_UUID
	} from "@/common/js/uuid.js";
	export default {
		data() {
			return {
				submit_loading: false,
				formData: {
					"sponsor": "", //转派任务发起人
					"transfertReason": "", //转派原因
					"receiver": "", //任务接收人
					"createTime": "", //转派发起时间
					"taskNumber": "", //任务ID
					"sponsorId": "", //转派任务发起人id
					"receiverId": "", //任务接收人_id
					"sendType": "0" // 发送对象 0--app,1--web
				},
				type: '', // 1巡检 2巡查
				taskId: '', // 任务id
			};
		},
		computed: {
			...mapGetters({
				getUsers: 'user/getUserInfo'
			})
		},
		onLoad(option) {
			this.formData.taskNumber = option.taskNumber === undefined ? this.formData.taskNumber : option.taskNumber;
			this.formData.receiverId = option.id === undefined ? this.formData.receiverId : option.id;
			this.formData.receiver = option.username === undefined ? this.formData.receiver : option.username;
			this.type = option.type === undefined ? this.type : option.type;
			this.taskId = option.taskId === undefined ? this.taskId : option.taskId;
		},
		onUnload() {
			uni.$off('onTipsPopupConfirm')
		},
		methods: {
			...mapMutations({
				setPopupId: 'app/SET_POPUP_ID',
				setPopupData: 'app/SET_POPUP_DATA'
			}),
			async handleTaskRedeploy() {
				let updateSql = '';
				if (!this.formData.receiverId) {
					this.$utils.toast('请选择接收任务人员')
				} else if (!this.formData.transfertReason) {
					this.$utils.toast('请输入转派原因')
				} else {
					uni.showLoading({
						mask: true,
						title: '正在转派任务...'
					})
					this.submit_loading = true;
					if (this.type == 1) {
						updateSql =
							`UPDATE ipis_inspection_list SET status="3" WHERE taskId="${this.taskId}" AND userid="${this.getUsers.id}"`;
						await syncFunc.handleInspectionSync();
					} else if (this.type == 2) {
						updateSql =
							`UPDATE ipis_patrol_list SET status="3" WHERE taskId="${this.taskId}" AND userid="${this.getUsers.id}"`;
						await syncFunc.handlePatrolSync();
					}
					this.formData.sponsor = this.getUsers.userName; // 转派任务发起人
					this.formData.createTime = moment().format('YYYY-MM-DD hh:mm:ss');
					this.formData.sponsorId = this.getUsers.id; // 转派任务发起人id
					this.$request('/v1/taskTransfer/creatTaskTransfer', this.formData, 'POST').then(async res => {
						// if (res.code === 200) {
							await this.$db.executeSQL(updateSql);
							uni.hideLoading();
							let uuid = generate_UUID();
							this.setPopupId(uuid);
							let params = {
								taskSubmitTips: 'success',
								successTipsTitle: '转派申请提交成功',
								successTipsContnet: '若接收人在一个小时内接收任务，则转派成功，否则转派失败',
								confirmType: 3
							}
							this.setPopupData(params);
							uni.getSubNVueById('redeploy-tips-popup').show('zoom-fade-out', 250);
							uni.$on('onTipsPopupConfirm', (res) => {
								if (res == 'confirm') {
									uni.navigateBack({
										delta: 2
									});
								}
							});
							this.submit_loading = false;
						// } else {
						// 	uni.hideLoading();
						// 	this.submit_loading = false;
						// }
					}).catch(error => {
						console.log(error)
						this.$utils.toast(error.errInfo.msg);
						this.submit_loading = false;
						uni.hideLoading();
					})
				}
			}
		}
	}
</script>

<style lang="scss">
	.task-content {
		overflow: hidden;

		.form-wrap {
			margin-top: 32px;

			.form-group {
				background-color: #FFFFFF;
				padding-left: 15px;
			}

			.form-item {
				height: 49px;
				display: flex;
				align-items: center;

				.form-label {
					font-size: 17px;
					color: #000000;
					margin-right: 21px;
				}

				.select {
					flex: 1;
					display: flex;
					align-items: center;
					justify-content: space-between;
					padding-right: 20px;
				}

				.right-icon {
					width: 9px;
					height: 15px;
				}
			}

			.button-wrap {
				margin-top: 27px;
			}
		}
	}
</style>
