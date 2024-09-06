<template>
	<view class="page-loading">
		<view class="spinner"></view>
		<view class="tips">
			<text class="tips-text">努力加载中...</text>
		</view>
	</view>
</template>

<script>
</script>

<style lang="scss">
	page {
		background: transparent;
	}

	.page-loading {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 9999;
		background: rgba(0, 0, 0, 0.3);
	}

	.spinner {
		width: 40px;
		height: 40px;
		background-color: #999;

		margin: 200px auto 30px auto;
		-webkit-animation: sk-rotateplane 1.2s infinite ease-in-out;
		animation: sk-rotateplane 1.2s infinite ease-in-out;
	}

	@-webkit-keyframes sk-rotateplane {
		0% {
			-webkit-transform: perspective(120px)
		}

		50% {
			-webkit-transform: perspective(120px) rotateY(180deg)
		}

		100% {
			-webkit-transform: perspective(120px) rotateY(180deg) rotateX(180deg)
		}
	}

	@keyframes sk-rotateplane {
		0% {
			transform: perspective(120px) rotateX(0deg) rotateY(0deg);
			-webkit-transform: perspective(120px) rotateX(0deg) rotateY(0deg)
		}

		50% {
			transform: perspective(120px) rotateX(-180.1deg) rotateY(0deg);
			-webkit-transform: perspective(120px) rotateX(-180.1deg) rotateY(0deg)
		}

		100% {
			transform: perspective(120px) rotateX(-180deg) rotateY(-179.9deg);
			-webkit-transform: perspective(120px) rotateX(-180deg) rotateY(-179.9deg);
		}
	}
	.tips {
		text-align: center;
	}
	.tips-text {
		color: #999;
	}
</style>
