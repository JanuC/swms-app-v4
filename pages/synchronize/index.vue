<template>
	<view class="content">
		<view class="cache-content">
			<image class="cache-icon" src="/static/synchronization_swms.png" mode="widthFix"></image>
			<view class="cache-data">
				<text>您当前共离线任务{{total}}条</text>
				<view>(系统检测有网情况下将自动同步数据)</view>
			</view>
		</view>
		<!-- <view class="button-wrap">
			<button :loading="getReportLoading" type="primary" :disabled="getReportLoading"
				@click="synchrodataPatrol">{{getReportLoading? '上传中' : '同步数据'}}</button>
		</view> -->
	</view>
</template>

<script>
	import {
		mapGetters
	} from "vuex"
	import syncFunc from "@/utils/dataSync.js";
	export default {
		data() {
			return {
				total: 0
			};
		},
		computed: {
			...mapGetters({
				getUsers: 'user/getUserInfo',
				getReportLoading: 'app/getReportLoading'
			})
		},
		watch: {
			getReportLoading(val) {
				console.log(val, '上传状态');
				setTimeout(() => {
					this.getSynchronousData()
				}, 100)
			}
		},
		onLoad() {
			this.getSynchronousData();
		},
		methods: {
			// 获取同步数据
			async getSynchronousData() {
				let selectSql = `SELECT * FROM ipis_task  WHERE userid="${this.getUsers.id}"`;
				let sql = `SELECT * FROM ipis_exception WHERE status="0" AND userid="${this.getUsers.id}"`;
				let exception = await this.$db.selectSQL(sql);
				let task = await this.$db.selectSQL(selectSql);
				// let patrolData = await syncFunc.selectPatrolData(this.getUsers.id);
				// console.log('巡检数据', patrolData);
				// let inspectionData = await syncFunc.selectInspectionData(this.getUsers.id);
				// console.log('巡查数据', inspectionData);
				// this.total = patrolData.length + inspectionData.length;
				this.total = task.length + exception.length;
			},
			// 同步巡检数据
			async synchrodataPatrol() {
				uni.showLoading({
					title: '正在同步中...'
				});
				let isNetwork = await this.$utils.monitorNetwork();
				if (isNetwork) {
					// 巡检数据同步
					await syncFunc.handlePatrolSync();
					// 巡查数据同步
					await syncFunc.handleInspectionSync();
					// 异常上报同步
					await syncFunc.reportException();
					// 重新计算离线数据
					this.getSynchronousData();
				} else {
					this.$utils.toast('当前状态没有网络!')
				}
			},
		}
	}
</script>

<style lang="scss">
	.cache-content {
		padding: 30px 0 38px 0;
		background-color: #FFFFFF;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		margin-bottom: 38px;

		.cache-icon {
			width: 54px;
			height: 54px;
			margin-bottom: 24px;
		}

		.cache-data {
			font-size: 18px;
			text-align: center;
			color: #333333;
			// margin-bottom: 7px;
			view{
				margin-top: 10px;
				font-size: 14px;
			}
		}
	}
</style>
