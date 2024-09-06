<template>
<<<<<<< HEAD
	<view v-if="isShow" ref="ani" :animation="animationData" :class="customClass" :style="transformStyles" @click="onClick"><slot></slot></view>
</template>

<script>
import { createAnimation } from './createAnimation'

/**
 * Transition 过渡动画
 * @description 简单过渡动画组件
 * @tutorial https://ext.dcloud.net.cn/plugin?id=985
 * @property {Boolean} show = [false|true] 控制组件显示或隐藏
 * @property {Array|String} modeClass = [fade|slide-top|slide-right|slide-bottom|slide-left|zoom-in|zoom-out] 过渡动画类型
 *  @value fade 渐隐渐出过渡
 *  @value slide-top 由上至下过渡
 *  @value slide-right 由右至左过渡
 *  @value slide-bottom 由下至上过渡
 *  @value slide-left 由左至右过渡
 *  @value zoom-in 由小到大过渡
 *  @value zoom-out 由大到小过渡
 * @property {Number} duration 过渡动画持续时间
 * @property {Object} styles 组件样式，同 css 样式，注意带’-‘连接符的属性需要使用小驼峰写法如：`backgroundColor:red`
 */
export default {
	name: 'uniTransition',
	emits:['click','change'],
	props: {
		show: {
			type: Boolean,
			default: false
		},
		modeClass: {
			type: [Array, String],
			default() {
				return 'fade'
			}
		},
		duration: {
			type: Number,
			default: 300
		},
		styles: {
			type: Object,
			default() {
				return {}
			}
		},
		customClass:{
			type: String,
			default: ''
		}
	},
	data() {
		return {
			isShow: false,
			transform: '',
			opacity: 1,
			animationData: {},
			durationTime: 300,
			config: {}
		}
	},
	watch: {
		show: {
			handler(newVal) {
				if (newVal) {
					this.open()
				} else {
					// 避免上来就执行 close,导致动画错乱
					if (this.isShow) {
						this.close()
					}
				}
			},
			immediate: true
		}
	},
	computed: {
		// 生成样式数据
		stylesObject() {
			let styles = {
				...this.styles,
				'transition-duration': this.duration / 1000 + 's'
			}
			let transform = ''
			for (let i in styles) {
				let line = this.toLine(i)
				transform += line + ':' + styles[i] + ';'
			}
			return transform
		},
		// 初始化动画条件
		transformStyles() {
			return 'transform:' + this.transform + ';' + 'opacity:' + this.opacity + ';' + this.stylesObject
		}
	},
	created() {
		// 动画默认配置
		this.config = {
			duration: this.duration,
			timingFunction: 'ease',
			transformOrigin: '50% 50%',
			delay: 0
		}
		this.durationTime = this.duration
	},
	methods: {
		/**
		 *  ref 触发 初始化动画
		 */
		init(obj = {}) {
			if (obj.duration) {
				this.durationTime = obj.duration
			}
			this.animation = createAnimation(Object.assign(this.config, obj),this)
		},
		/**
		 * 点击组件触发回调
		 */
		onClick() {
			this.$emit('click', {
				detail: this.isShow
			})
		},
		/**
		 * ref 触发 动画分组
		 * @param {Object} obj
		 */
		step(obj, config = {}) {
			if (!this.animation) return
			for (let i in obj) {
				try {
					if(typeof obj[i] === 'object'){
						this.animation[i](...obj[i])
					}else{
						this.animation[i](obj[i])
					}
				} catch (e) {
					console.error(`方法 ${i} 不存在`)
				}
			}
			this.animation.step(config)
			return this
		},
		/**
		 *  ref 触发 执行动画
		 */
		run(fn) {
			if (!this.animation) return
			this.animation.run(fn)
		},
		// 开始过度动画
		open() {
			clearTimeout(this.timer)
			this.transform = ''
			this.isShow = true
			let { opacity, transform } = this.styleInit(false)
			if (typeof opacity !== 'undefined') {
				this.opacity = opacity
			}
			this.transform = transform
			// 确保动态样式已经生效后，执行动画，如果不加 nextTick ，会导致 wx 动画执行异常
			this.$nextTick(() => {
				// TODO 定时器保证动画完全执行，目前有些问题，后面会取消定时器
				this.timer = setTimeout(() => {
					this.animation = createAnimation(this.config, this)
					this.tranfromInit(false).step()
					this.animation.run()
					this.$emit('change', {
						detail: this.isShow
					})
				}, 20)
			})
		},
		// 关闭过度动画
		close(type) {
			if (!this.animation) return
			this.tranfromInit(true)
				.step()
				.run(() => {
					this.isShow = false
					this.animationData = null
					this.animation = null
					let { opacity, transform } = this.styleInit(false)
					this.opacity = opacity || 1
					this.transform = transform
					this.$emit('change', {
						detail: this.isShow
					})
				})
		},
		// 处理动画开始前的默认样式
		styleInit(type) {
			let styles = {
				transform: ''
			}
			let buildStyle = (type, mode) => {
				if (mode === 'fade') {
					styles.opacity = this.animationType(type)[mode]
				} else {
					styles.transform += this.animationType(type)[mode] + ' '
				}
			}
			if (typeof this.modeClass === 'string') {
				buildStyle(type, this.modeClass)
			} else {
				this.modeClass.forEach(mode => {
					buildStyle(type, mode)
				})
			}
			return styles
		},
		// 处理内置组合动画
		tranfromInit(type) {
			let buildTranfrom = (type, mode) => {
				let aniNum = null
				if (mode === 'fade') {
					aniNum = type ? 0 : 1
				} else {
					aniNum = type ? '-100%' : '0'
					if (mode === 'zoom-in') {
						aniNum = type ? 0.8 : 1
					}
					if (mode === 'zoom-out') {
						aniNum = type ? 1.2 : 1
					}
					if (mode === 'slide-right') {
						aniNum = type ? '100%' : '0'
					}
					if (mode === 'slide-bottom') {
						aniNum = type ? '100%' : '0'
					}
				}
				this.animation[this.animationMode()[mode]](aniNum)
			}
			if (typeof this.modeClass === 'string') {
				buildTranfrom(type, this.modeClass)
			} else {
				this.modeClass.forEach(mode => {
					buildTranfrom(type, mode)
				})
			}

			return this.animation
		},
		animationType(type) {
			return {
				fade: type ? 1 : 0,
				'slide-top': `translateY(${type ? '0' : '-100%'})`,
				'slide-right': `translateX(${type ? '0' : '100%'})`,
				'slide-bottom': `translateY(${type ? '0' : '100%'})`,
				'slide-left': `translateX(${type ? '0' : '-100%'})`,
				'zoom-in': `scaleX(${type ? 1 : 0.8}) scaleY(${type ? 1 : 0.8})`,
				'zoom-out': `scaleX(${type ? 1 : 1.2}) scaleY(${type ? 1 : 1.2})`
			}
		},
		// 内置动画类型与实际动画对应字典
		animationMode() {
			return {
				fade: 'opacity',
				'slide-top': 'translateY',
				'slide-right': 'translateX',
				'slide-bottom': 'translateY',
				'slide-left': 'translateX',
				'zoom-in': 'scale',
				'zoom-out': 'scale'
			}
		},
		// 驼峰转中横线
		toLine(name) {
			return name.replace(/([A-Z])/g, '-$1').toLowerCase()
		}
	}
}
</script>

<style></style>
=======
	<view v-if="isShow" ref="ani" class="uni-transition" :class="[ani.in]" :style="'transform:' +transform+';'+stylesObject"
	 @click="change">
		 <slot></slot>
	</view>
</template>

<script>
	// #ifdef APP-NVUE
	const animation = uni.requireNativePlugin('animation');
	// #endif
	/**
	 * Transition 过渡动画
	 * @description 简单过渡动画组件
	 * @tutorial https://ext.dcloud.net.cn/plugin?id=985
	 * @property {Boolean} show = [false|true] 控制组件显示或隐藏
     * @property {Array} modeClass = [fade|slide-top|slide-right|slide-bottom|slide-left|zoom-in|zoom-out] 过渡动画类型
     *  @value fade 渐隐渐出过渡
     *  @value slide-top 由上至下过渡
     *  @value slide-right 由右至左过渡
     *  @value slide-bottom 由下至上过渡
     *  @value slide-left 由左至右过渡
     *  @value zoom-in 由小到大过渡
     *  @value zoom-out 由大到小过渡
	 * @property {Number} duration 过渡动画持续时间
	 * @property {Object} styles 组件样式，同 css 样式，注意带’-‘连接符的属性需要使用小驼峰写法如：`backgroundColor:red`
	 */
	export default {
		name: 'uniTransition',
		props: {
			show: {
				type: Boolean,
				default: false
			},
			modeClass: {
				type: Array,
				default () {
					return []
				}
			},
			duration: {
				type: Number,
				default: 300
			},
			styles: {
				type: Object,
				default () {
					return {}
				}
			}
		},
		data() {
			return {
				isShow: false,
				transform: '',
				ani: { in: '',
					active: ''
				}
			};
		},
		watch: {
			show: {
				handler(newVal) {
					if (newVal) {
						this.open()
					} else {
						this.close()
					}
				},
				immediate: true
			}
		},
		computed: {
			stylesObject() {
				let styles = {
					...this.styles,
					'transition-duration': this.duration / 1000 + 's'
				}
				let transfrom = ''
				for (let i in styles) {
					let line = this.toLine(i)
					transfrom += line + ':' + styles[i] + ';'
				}
				return transfrom
			}
		},
		created() {
			// this.timer = null
			// this.nextTick = (time = 50) => new Promise(resolve => {
			// 	clearTimeout(this.timer)
			// 	this.timer = setTimeout(resolve, time)
			// 	return this.timer
			// });
		},
		methods: {
			change() {
				this.$emit('click', {
					detail: this.isShow
				})
			},
			open() {
				clearTimeout(this.timer)
				this.isShow = true
				this.transform = ''
				this.ani.in = ''
				for (let i in this.getTranfrom(false)) {
					if (i === 'opacity') {
						this.ani.in = 'fade-in'
					} else {
						this.transform += `${this.getTranfrom(false)[i]} `
					}
				}
				this.$nextTick(() => {
					setTimeout(() => {
						this._animation(true)
					}, 50)
				})

			},
			close(type) {
				clearTimeout(this.timer)
				this._animation(false)
			},
			_animation(type) {
				let styles = this.getTranfrom(type)
				// #ifdef APP-NVUE
				if(!this.$refs['ani']) return
				animation.transition(this.$refs['ani'].ref, {
					styles,
					duration: this.duration, //ms
					timingFunction: 'ease',
					needLayout: false,
					delay: 0 //ms
				}, () => {
					if (!type) {
						this.isShow = false
					}
					this.$emit('change', {
						detail: this.isShow
					})
				})
				// #endif
				// #ifndef APP-NVUE
				this.transform = ''
				for (let i in styles) {
					if (i === 'opacity') {
						this.ani.in = `fade-${type?'out':'in'}`
					} else {
						this.transform += `${styles[i]} `
					}
				}
				this.timer = setTimeout(() => {
					if (!type) {
						this.isShow = false
					}
					this.$emit('change', {
						detail: this.isShow
					})

				}, this.duration)
				// #endif

			},
			getTranfrom(type) {
				let styles = {
					transform: ''
				}
				this.modeClass.forEach((mode) => {
					switch (mode) {
						case 'fade':
							styles.opacity = type ? 1 : 0
							break;
						case 'slide-top':
							styles.transform += `translateY(${type?'0':'-100%'}) `
							break;
						case 'slide-right':
							styles.transform += `translateX(${type?'0':'100%'}) `
							break;
						case 'slide-bottom':
							styles.transform += `translateY(${type?'0':'100%'}) `
							break;
						case 'slide-left':
							styles.transform += `translateX(${type?'0':'-100%'}) `
							break;
						case 'zoom-in':
							styles.transform += `scale(${type?1:0.8}) `
							break;
						case 'zoom-out':
							styles.transform += `scale(${type?1:1.2}) `
							break;
					}
				})
				return styles
			},
			_modeClassArr(type) {
				let mode = this.modeClass
				if (typeof(mode) !== "string") {
					let modestr = ''
					mode.forEach((item) => {
						modestr += (item + '-' + type + ',')
					})
					return modestr.substr(0, modestr.length - 1)
				} else {
					return mode + '-' + type
				}
			},
			// getEl(el) {
			// 	console.log(el || el.ref || null);
			// 	return el || el.ref || null
			// },
			toLine(name) {
				return name.replace(/([A-Z])/g, "-$1").toLowerCase();
			}
		}
	}
</script>

<style>
	.uni-transition {
		transition-timing-function: ease;
		transition-duration: 0.3s;
		transition-property: transform, opacity;
		z-index: 998;
	}

	.fade-in {
		opacity: 0;
	}

	.fade-active {
		opacity: 1;
	}

	.slide-top-in {
		/* transition-property: transform, opacity; */
		transform: translateY(-100%);
	}

	.slide-top-active {
		transform: translateY(0);
		/* opacity: 1; */
	}

	.slide-right-in {
		transform: translateX(100%);
	}

	.slide-right-active {
		transform: translateX(0);
	}

	.slide-bottom-in {
		transform: translateY(100%);
	}

	.slide-bottom-active {
		transform: translateY(0);
	}

	.slide-left-in {
		transform: translateX(-100%);
	}

	.slide-left-active {
		transform: translateX(0);
		opacity: 1;
	}

	.zoom-in-in {
		transform: scale(0.8);
	}

	.zoom-out-active {
		transform: scale(1);
	}

	.zoom-out-in {
		transform: scale(1.2);
	}
</style>
>>>>>>> origin/swms-itps
