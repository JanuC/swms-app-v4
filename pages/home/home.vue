<template>
	<div class="home">
		<div class='content'>
			<div @click='goto(item.path)' v-for="(item, index) in subNav" :key="index">
				<image :src="item.img" alt=""></image>
				<text>{{item.text}}</text>
			</div>
		</div>

		<!-- 底部 -->
		<Footer />
	</div>

</template>

<script>
	import Footer from "@/components/Footer.vue";
	export default {
		components: {
			Footer
		},
		data() {
			return {
				subNav: [{
					path: '/pages/alarm/alarm',
					img: '../../static/home/icon2.png',
					text: '告警'
				}, {
					path: '/pages/order/order',
					img: '../../static/home/icon3.png',
					text: '工单'
				}, {
					path: '/pages/devOps/devOps',
					img: '../../static/home/icon1.png',
					text: '运维'
				},{
					path: '/pages/inspection/inspection',
					img: '../../static/home/index_nav2.png',
					text: '巡查'
				},{
					path: '/pages/patrol/patrol',
					img: '../../static/home/index_nav1.png',
					text: '巡检'
				},{
					path: '/pages/cardReplace/cardReplace',
					img: '../../static/home/index_nav3.png',
					text: '卡片更换'
				},{
					path: '/pages/clockRecord/clockRecord',
					img: '../../static/home/index_nav5.png',
					text: '打卡记录'
				},{
					path: '/pages/exceptionReport/exceptionReport',
					img: '../../static/home/icon1.png',
					text: '异常上报'
				}, ]
			}
		},
		created() {},
		mounted() {

		},
		methods: {
			// 页面跳转
			goto(path) {
				uni.navigateTo({
					url: path
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.content {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 20rpx;
		padding: 20rpx;

		div {
			height: 160rpx;
			background-color: #ffffff;
			border-radius: 16rpx;
			text-align: center;
			padding-top: 30rpx;

			image {
				width: 90rpx;
				height: 92rpx;
				display: block;
				margin: auto;
				margin-bottom: 5rpx;
			}

			text {
				font-family: PingFang-SC-Medium;
				font-size: 28rpx;
				font-weight: normal;
				font-stretch: normal;
				letter-spacing: 0rpx;
				color: #333333;
			}
		}
	}
</style>
