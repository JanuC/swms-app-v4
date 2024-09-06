<script>
	import {
		mapGetters
	} from 'vuex';
	import appInit from "@/utils/init.js";
	import NFC from '@/utils/nfc.js';
	export default {
		data() {
			return {}
		},
		onLaunch() { // 当uni-app 初始化完成时触发（全局只触发一次）
			NFC.listenNFCStatus();
			appInit.createTable();
			if (this.isTokenValid) {
				// #ifdef APP-PLUS
				plus.navigator.closeSplashscreen()
				// #endif
				appInit.init(); // 登录初始化
			} else {
				uni.reLaunch({
					url: 'pages/user/login',
					success: () => {
						// #ifdef APP-PLUS
						plus.navigator.closeSplashscreen()
						// #endif
					}
				})
			}
		},
		onShow() {
			console.log('App Show') // 当 uni-app 启动，或从后台进入前台显示
		},
		onHide() {
			console.log('App Hide') // 当 uni-app 从前台进入后台
		},
		onPageNotFound(msg) { // 页面不存在监听函数
			uni.redirectTo({
				url: '/pages/error/404'
			})
		},
		onUnload() {
			console.log('onUnload')
		},
		computed: {
			...mapGetters({
				isTokenValid: 'user/isTokenValid',
			})
		},
		methods: {}
	}
</script>

<style lang="scss">
	// #ifndef APP-NVUE
	@import url("./common/css/index.scss");

	// button
	uni-button[type=primary] {
		color: #fff;
		background-color: $uni-color-primary;
	}

	.button-hover[type=primary] {
		color: hsla(0, 0%, 100%, 0.6);
		background-color: $uni-color-primary;
	}

	uni-button[loading][type=primary] {
		color: hsla(0, 0%, 100%, .6);
		background-color: $uni-color-primary;
	}

	uni-button[disabled][type=primary] {
		background-color: rgba(158, 74, 99, .6);
	}

	// checkbox
	uni-checkbox .uni-checkbox-input.uni-checkbox-input-checked {
		color: $uni-color-primary !important;
	}

	uni-checkbox:not([disabled]) .uni-checkbox-input:hover {
		border-color: $uni-color-primary;
	}

	// #endif
</style>
