<template>
	<view class="content card-wrap">
		<view class="card-group card-group__top">
			<view class="label-title border-bottom__1">
				<text>描述</text>
			</view>
			<view class="card-content">
				<!-- <textarea v-if="details.descriptionType == 0"  :disabled="true"
					v-model="" placeholder="请输入" placeholder-class="input-placeholder" /> -->
				<text class="textarea" v-if="details.descriptionType == 0">{{details.description}}</text>
				<view v-else class="audio-wrap" @click="playVoice">
					<view class="audio-play">
						<text class="current-time">{{this.isPlaying ? currentTime : duration}}秒</text>
					</view>
					<image class="hear-audio" src="/static/hear.png" mode="scaleToFill">
					</image>
				</view>
			</view>
		</view>
		<view class="card-group">
			<view class="label-title border-bottom__1">
				<text>位置</text>
			</view>
			<view class="card-content">
				<!-- <input class="input" type="text" v-model="" placeholder="请输入"
					placeholder-class="input-placeholder" :disabled="true" /> -->
				<text class="input">{{details.location}}</text>
			</view>
		</view>
		<view class="card-group">
			<view class="label-title border-bottom__1">
				<text>现场图片</text>
			</view>
			<view class="card-content">
				<view class="scene-picture">
					<view class="img-wrap" v-for="(img, index) in localLocation" :key="index">
						<image @click="$utils.previewImg(links.preview+img)" class="patrol-photo"
							:src="links.preview+img" mode="scaleToFill"></image>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		mapGetters
	} from 'vuex';
	export default {
		data() {
			return {
				details: {},
				localLocation: [],
				isPlaying: false,
				isPlayEnd: false,
				currentTime: 0,
				duration: 0,
				links: uni.getStorageSync('links')
			}
		},
		computed: {
			...mapGetters({
				getUsers: 'user/getUserInfo'
			})
		},
		onLoad(option) {
			this.details = JSON.parse(option.data);
			console.log(this.details)
			this.localLocation = this.details.picture !== '' ? JSON.parse(this.details.picture) : [];
			this.duration = this.details.duration || 0;
			this.audioContext = null;
			this.createAudio();
		},
		onUnload() {
			if (this.audioContext != null && this.isPlaying) {
				this.stopVoice();
			}
		},
		methods: {
			createAudio() {
				let innerAudioContext = this.audioContext = uni.createInnerAudioContext();
				innerAudioContext.autoplay = false;
				innerAudioContext.src = this.links.preview + this.details.description;
				innerAudioContext.onPlay(() => {
					console.log('开始播放');
				});
				innerAudioContext.onTimeUpdate((e) => {
					this.currentTime = Math.round(innerAudioContext.currentTime) || 0;
				});
				innerAudioContext.onEnded(() => {
					this.currentTime = 0;
					this.isPlaying = false;
					this.isPlayEnd = true;
				});
				innerAudioContext.onError((res) => {
					this.isPlaying = false;
					console.log('onError', res.errMsg);
					console.log('onError', res.errCode);
				});
				innerAudioContext.onCanplay((res) => {
					console.log(innerAudioContext.duration)
					console.log(res)
				})
				return innerAudioContext;
			},
			playVoice() {
				if (this.isPlaying) {
					this.stopVoice();
					return;
				}
				this.isPlaying = true;
				this.audioContext.play();
				this.isPlayEnd = false;
			},
			pause() {
				this.audioContext.pause();
				this.isPlaying = false;
			},
			stopVoice() {
				this.audioContext.stop();
				this.currentTime = 0;
				this.isPlaying = false;
			},
		}
	}
</script>

<style lang="scss" scoped>
	.card-wrap {
		.card-group {
			padding-left: 15px;
			background-color: #FFFFFF;
		}

		.label-title {
			font-size: 17px;
			color: #000000;
			padding: 10px 0;
			display: flex;
			align-items: center;
			justify-content: space-between;
		}

		.card-content {
			padding: 8px 15px 0 0;
			overflow: hidden;

			.textarea {
				display: inline-block;
				width: 100%;
				padding: 10px;
				box-sizing: border-box !important;
			}

			.input {
				height: 40px;
				padding-left: 10px;
			}
		}

		.scene-picture {
			display: flex;
			flex-wrap: wrap;
			padding: 10px 0 20px;

			.img-wrap {
				width: 100px;
				height: 80px;
				position: relative;
				margin-bottom: 10px;
				margin-right: 10px;
			}
		}
	}

	.audio-wrap {
		height: 30px;
		line-height: 30px;
		border-radius: 15px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		background-color: #000000;
		padding: 0 20px;
		margin: 20px 0;

		.current-time {
			font-size: 12px;
			color: #FFFFFF;
			margin-right: 10px;
		}

		.hear-audio {
			width: 20px;
			height: 20px;
		}
	}
</style>
