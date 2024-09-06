<template>
	<view class="uni-popup-dialog">
		<view class="uni-dialog-title">
<<<<<<< HEAD
			<text class="uni-dialog-title-text" :class="['uni-popup__'+dialogType]">{{titleText}}</text>
		</view>
		<view v-if="mode === 'base'" class="uni-dialog-content">
			<slot>
				<text class="uni-dialog-content-text">{{content}}</text>
			</slot>
		</view>
		<view v-else class="uni-dialog-content">
			<slot>
				<input class="uni-dialog-input" v-model="val" type="text" :placeholder="placeholderText" :focus="focus" >
			</slot>
		</view>
		<view class="uni-dialog-button-group">
			<view class="uni-dialog-button" @click="closeDialog">
				<text class="uni-dialog-button-text">{{cancelText}}</text>
			</view>
			<view class="uni-dialog-button uni-border-left" @click="onOk">
				<text class="uni-dialog-button-text uni-button-color">{{okText}}</text>
=======
			<text class="uni-dialog-title-text" :class="['uni-popup__'+dialogType]">{{title}}</text>
		</view>
		<view class="uni-dialog-content">
			<text class="uni-dialog-content-text" v-if="mode === 'base'">{{content}}</text>
			<input v-else class="uni-dialog-input" v-model="val" type="text" :placeholder="placeholder" :focus="focus" >
		</view>
		<view class="uni-dialog-button-group">
			<view class="uni-dialog-button" @click="close">
				<text class="uni-dialog-button-text">取消</text>
			</view>
			<view class="uni-dialog-button uni-border-left" @click="onOk">
				<text class="uni-dialog-button-text uni-button-color">确定</text>
>>>>>>> origin/swms-itps
			</view>
		</view>

	</view>
</template>

<script>
<<<<<<< HEAD
	import popup from '../uni-popup/popup.js'
	import {
	initVueI18n
	} from '@dcloudio/uni-i18n'
	import messages from '../uni-popup/i18n/index.js'
	const {	t	} = initVueI18n(messages)
=======
>>>>>>> origin/swms-itps
	/**
	 * PopUp 弹出层-对话框样式
	 * @description 弹出层-对话框样式
	 * @tutorial https://ext.dcloud.net.cn/plugin?id=329
	 * @property {String} value input 模式下的默认值
	 * @property {String} placeholder input 模式下输入提示
	 * @property {String} type = [success|warning|info|error] 主题样式
	 *  @value success 成功
	 * 	@value warning 提示
	 * 	@value info 消息
	 * 	@value error 错误
	 * @property {String} mode = [base|input] 模式、
	 * 	@value base 基础对话框
	 * 	@value input 可输入对话框
	 * @property {String} content 对话框内容
	 * @property {Boolean} beforeClose 是否拦截取消事件
	 * @event {Function} confirm 点击确认按钮触发
	 * @event {Function} close 点击取消按钮触发
	 */

	export default {
		name: "uniPopupDialog",
<<<<<<< HEAD
		mixins: [popup],
		emits:['confirm','close'],
=======
>>>>>>> origin/swms-itps
		props: {
			value: {
				type: [String, Number],
				default: ''
			},
			placeholder: {
				type: [String, Number],
<<<<<<< HEAD
				default: ''
			},
=======
				default: '请输入内容'
			},
			/**
			 * 对话框主题 success/warning/info/error	  默认 success
			 */
>>>>>>> origin/swms-itps
			type: {
				type: String,
				default: 'error'
			},
<<<<<<< HEAD
=======
			/**
			 * 对话框模式 base/input
			 */
>>>>>>> origin/swms-itps
			mode: {
				type: String,
				default: 'base'
			},
<<<<<<< HEAD
			title: {
				type: String,
				default: ''
			},
=======
			/**
			 * 对话框标题
			 */
			title: {
				type: String,
				default: '提示'
			},
			/**
			 * 对话框内容
			 */
>>>>>>> origin/swms-itps
			content: {
				type: String,
				default: ''
			},
<<<<<<< HEAD
=======
			/**
			 * 拦截取消事件 ，如果拦截取消事件，必须监听close事件，执行 done()
			 */
>>>>>>> origin/swms-itps
			beforeClose: {
				type: Boolean,
				default: false
			}
		},
		data() {
			return {
				dialogType: 'error',
				focus: false,
				val: ""
			}
		},
<<<<<<< HEAD
		computed: {
			okText() {
				return t("uni-popup.ok")
			},
			cancelText() {
				return t("uni-popup.cancel")
			},
			placeholderText() {
				return this.placeholder || t("uni-popup.placeholder")
			},
			titleText() {
				return this.title || t("uni-popup.title")
			}
		},
=======
		inject: ['popup'],
>>>>>>> origin/swms-itps
		watch: {
			type(val) {
				this.dialogType = val
			},
			mode(val) {
				if (val === 'input') {
					this.dialogType = 'info'
				}
			},
			value(val) {
				this.val = val
			}
		},
		created() {
			// 对话框遮罩不可点击
<<<<<<< HEAD
			this.popup.disableMask()
			// this.popup.closeMask()
=======
			this.popup.mkclick = false
>>>>>>> origin/swms-itps
			if (this.mode === 'input') {
				this.dialogType = 'info'
				this.val = this.value
			} else {
				this.dialogType = this.type
			}
		},
		mounted() {
			this.focus = true
		},
		methods: {
			/**
			 * 点击确认按钮
			 */
			onOk() {
				if (this.mode === 'input'){
					this.$emit('confirm', this.val)
				}else{
<<<<<<< HEAD
					this.$emit('confirm')
				}
				if(this.beforeClose) return
				this.popup.close()
=======
					this.popup.close()
				}
>>>>>>> origin/swms-itps
			},
			/**
			 * 点击取消按钮
			 */
<<<<<<< HEAD
			closeDialog() {
				this.$emit('close')
				if(this.beforeClose) return
				this.popup.close()
			},
			close(){
=======
			close() {
				if (this.beforeClose) {
					this.$emit('close', () => {
						this.popup.close()
					})
					return
				}
>>>>>>> origin/swms-itps
				this.popup.close()
			}
		}
	}
</script>

<<<<<<< HEAD
<style lang="scss" scoped>
	.uni-popup-dialog {
		width: 300px;
		border-radius: 11px;
=======
<style scoped>
	.uni-popup-dialog {
		width: 300px;
		border-radius: 15px;
>>>>>>> origin/swms-itps
		background-color: #fff;
	}

	.uni-dialog-title {
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */
		flex-direction: row;
		justify-content: center;
<<<<<<< HEAD
		padding-top: 25px;
=======
		padding-top: 15px;
		padding-bottom: 5px;
>>>>>>> origin/swms-itps
	}

	.uni-dialog-title-text {
		font-size: 16px;
		font-weight: 500;
	}

	.uni-dialog-content {
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */
		flex-direction: row;
		justify-content: center;
		align-items: center;
<<<<<<< HEAD
		padding: 20px;
=======
		padding: 5px 15px 15px 15px;
>>>>>>> origin/swms-itps
	}

	.uni-dialog-content-text {
		font-size: 14px;
<<<<<<< HEAD
		color: #6C6C6C;
=======
		color: #6e6e6e;
>>>>>>> origin/swms-itps
	}

	.uni-dialog-button-group {
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */
		flex-direction: row;
		border-top-color: #f5f5f5;
		border-top-style: solid;
		border-top-width: 1px;
	}

	.uni-dialog-button {
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */

		flex: 1;
		flex-direction: row;
		justify-content: center;
		align-items: center;
		height: 45px;
	}

	.uni-border-left {
		border-left-color: #f0f0f0;
		border-left-style: solid;
		border-left-width: 1px;
	}

	.uni-dialog-button-text {
<<<<<<< HEAD
		font-size: 16px;
		color: #333;
=======
		font-size: 14px;
>>>>>>> origin/swms-itps
	}

	.uni-button-color {
		color: #007aff;
	}

	.uni-dialog-input {
		flex: 1;
		font-size: 14px;
<<<<<<< HEAD
		border: 1px #eee solid;
		height: 40px;
		padding: 0 10px;
		border-radius: 5px;
		color: #555;
=======
>>>>>>> origin/swms-itps
	}

	.uni-popup__success {
		color: #4cd964;
	}

	.uni-popup__warn {
		color: #f0ad4e;
	}

	.uni-popup__error {
		color: #dd524d;
	}

	.uni-popup__info {
		color: #909399;
	}
<<<<<<< HEAD
</style>
=======
</style>
>>>>>>> origin/swms-itps
