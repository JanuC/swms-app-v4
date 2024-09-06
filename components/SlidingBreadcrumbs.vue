<template>
	<view class="sliding-breadcrumbs">
		<scroll-view class="scroll-view" scroll-x="true" :show-scrollbar="true" @scroll="scroll"
			:scroll-left="scrollLeft">
			<view v-for="(item,index) in organs" :key="item.organId" class="scroll-view-item"
				:id="[index===organsNum-1?'lastItem':'']">
				<text v-if="index===0||index<organsNum-1" class="organ-name active"
					@click="getOrgansId(item.id, index)">{{item.name}}</text>
				<text v-else class="organ-name">{{item.name}}</text>
				<image v-if="index!==organsNum-1" class="right-image" src="@/static/right.png" mode="aspectFill">
				</image>
			</view>
		</scroll-view>
	</view>
</template>

<script>
	export default {
		name: "SlidingBreadcrumbs",
		props: {
			selectOrgans: {
				type: Array,
				default: []
			},
		},
		data() {
			return {
				scrollLeft: 0
			};
		},
		watch: {
			selectOrgans(val) {
				this.$nextTick(() => {
					this.setScrollLeft();
				})
			}
		},
		created() {

		},
		computed: {
			organsNum() {
				return this.organs.length;
			},
			organs() {
				return this.selectOrgans;
			}
		},
		mounted() {},
		methods: {
			getOrgansId(id, i) {
				this.$emit('onOrgansId', id, i)
			},
			scroll(e) {
				// console.log(e)
			},
			setScrollLeft() {
				const {
					windowWidth
				} = uni.getSystemInfoSync();
				const query = uni.createSelectorQuery().in(this);
				query.select('#lastItem').boundingClientRect(data => {
					let scrollLeft = Math.ceil((data.right - windowWidth) + data.width + 28);
					this.scrollLeft += scrollLeft;
					// console.log(data.right, data.left, data.width, windowWidth, this.scrollLeft)
				}).exec();
			}
		}
	}
</script>

<style lang="scss">
	.sliding-breadcrumbs {
		// height: 128rpx;
		padding: 0 30rpx;
		background-color: #FFFFFF;

		.scroll-view {
			white-space: nowrap;
			// width: 100%;
			// display: flex;
			// align-items: center;
		}

		.scroll-view-item {
			display: inline-flex;
			align-items: center;
			height: 128rpx;
			// line-height: 128rpx;

			.organ-name {
				font-size: 32rpx;
				color: #999999;
			}

			.active {
				color: #9f4b63;
			}
		}
	}
</style>
