<template>
  <div class="avatar-maker">
    <div class="decoration">
      <img src="@/assets/fu.png" class="fu-icon" />
      <div class="music-control" @click="toggleMusic">
        <img src="@/assets/music.png" :class="{ 'rotating': isPlaying }" />
      </div>
    </div>

    <div class="main-content">
      <div class="preview-area">
        <div class="avatar-frame" ref="avatarRef">
          <img :src="mergedAvatar" v-if="mergedAvatar" class="merged-avatar" />
          <img :src="selectedAvatar" v-else-if="selectedAvatar" class="user-avatar" />
          <div class="placeholder" v-else>
            <van-icon name="photo" size="40" />
            <p>请选择头像</p>
          </div>
          <img 
            :src="frames[selectedFrameIndex].url" 
            class="frame-overlay"
            v-if="selectedAvatar"
          />
        </div>
      </div>

      <div class="action-buttons">
        <van-button class="action-btn" @click="useCurrentAvatar">使用当前头像</van-button>
        <van-button class="action-btn" @click="uploadPhoto">上传照片或拍照</van-button>
      </div>

      <div class="frame-selector">
        <div class="title">选择你的头像框</div>
        <div class="frames-grid">
          <div 
            v-for="(frame, index) in frames" 
            :key="index"
            class="frame-item"
            :class="{ active: selectedFrameIndex === index }"
            @click="selectFrame(index)"
          >
            <img :src="frame.url" />
          </div>
        </div>
      </div>

      <div class="bottom-buttons">
        <van-button class="bottom-btn" @click="goBack">返回</van-button>
        <van-button 
          class="bottom-btn" 
          type="primary" 
          @click="generateAvatar"
          :disabled="!selectedAvatar"
        >
          生成新头像
        </van-button>
        <van-button class="bottom-btn" type="info" @click="showQRCode">分享链接</van-button>
      </div>

      <!-- 添加二维码弹窗 -->
      <van-popup v-model:show="qrVisible" round>
        <div class="qr-container">
          <h3>扫码访问</h3>
          <qrcode-vue :value="pageUrl" :size="200" level="H" />
          <p>{{pageUrl}}</p>
        </div>
      </van-popup>
    </div>

    <input 
      type="file" 
      ref="fileInput"
      style="display: none"
      accept="image/*"
      @change="handleFileChange"
    />

    <image-cropper
      v-model:visible="showCropper"
      :image-url="cropperImage"
      @confirm="handleCroppedImage"
    />

    <audio ref="audioRef" loop>
      <source src="@/assets/music.mp3" type="audio/mpeg">
    </audio>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import QrcodeVue from 'qrcode.vue'
import { Button, Icon, Toast, Popup } from 'vant'
import html2canvas from 'html2canvas'
import { saveAs } from 'file-saver'
import ImageCropper from '@/components/ImageCropper.vue'

const frames = ref([
  { url: require('@/assets/frames/frame1.png') },
  { url: require('@/assets/frames/frame2.png') },
  { url: require('@/assets/frames/frame3.png') },
  { url: require('@/assets/frames/frame4.png') },
  { url: require('@/assets/frames/frame5.png') },
  { url: require('@/assets/frames/frame6.png') }
])

const selectedFrameIndex = ref(0)
const selectedAvatar = ref('')
const mergedAvatar = ref('')
const showCropper = ref(false)
const cropperImage = ref('')
const fileInput = ref<HTMLInputElement>()
const avatarRef = ref<HTMLElement>()
const audioRef = ref<HTMLAudioElement>()
const isPlaying = ref(false)

const useCurrentAvatar = async () => {
  try {
    const userInfo = await wx.getUserInfo()
    selectedAvatar.value = userInfo.avatarUrl
  } catch (error) {
    Toast('获取头像失败')
  }
}

const uploadPhoto = () => {
  fileInput.value?.click()
}

const handleFileChange = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    cropperImage.value = URL.createObjectURL(file)
    showCropper.value = true
  }
}

const handleCroppedImage = (data: string) => {
  selectedAvatar.value = data
  mergedAvatar.value = ''
}

const selectFrame = (index: number) => {
  selectedFrameIndex.value = index
  mergedAvatar.value = ''
}

const generateAvatar = async () => {
  if (!avatarRef.value) return
  
  try {
    const canvas = await html2canvas(avatarRef.value, {
      useCORS: true,
      backgroundColor: null
    })
    
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob as Blob)
      }, 'image/png')
    })
    
    saveAs(blob, '新年头像.png')
    Toast('头像已保存')
  } catch (error) {
    Toast('生成失败，请重试')
  }
}

const toggleMusic = () => {
  if (!audioRef.value) return
  
  if (audioRef.value.paused) {
    audioRef.value.play()
    isPlaying.value = true
  } else {
    audioRef.value.pause()
    isPlaying.value = false
  }
}

const pageUrl = 'https://powerzzjohn.github.io/desktop-tutorial/'
const qrVisible = ref(false)

const showQRCode = () => {
  qrVisible.value = true
}

const goBack = () => {
  history.back()
}

onMounted(() => {
  // 自动播放音乐
  audioRef.value?.play().then(() => {
    isPlaying.value = true
  }).catch(() => {
    isPlaying.value = false
  })
})

onUnmounted(() => {
  audioRef.value?.pause()
})
</script>

<style scoped>
.avatar-maker {
  min-height: 100vh;
  background-color: #FF0000;
  padding: 20px;
  box-sizing: border-box;
  background-image: url('@/assets/bg-pattern.png');
  background-repeat: repeat;
  background-size: 200px 200px;
  position: relative;
}

.avatar-maker::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 0, 0, 0.1));
  pointer-events: none;
}

.main-content {
  position: relative;
  z-index: 1;
}

.decoration {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  margin-bottom: 20px;
}

.fu-icon {
  width: 80px;
  height: 80px;
  filter: drop-shadow(0 0 5px rgba(255, 215, 0, 0.5));
  transform: rotate(-15deg);
  transition: transform 0.3s;
}

.fu-icon:hover {
  transform: rotate(0deg) scale(1.1);
}

.music-control {
  width: 60px;
  height: 60px;
  background: rgba(255, 215, 0, 0.15);
  border: 2px solid rgba(255, 215, 0, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
}

.music-control:hover {
  background: rgba(255, 215, 0, 0.25);
  transform: scale(1.05);
}

.music-control:active {
  transform: scale(0.95);
}

.music-control img {
  width: 40px;
  height: 40px;
  filter: drop-shadow(0 0 3px rgba(255, 215, 0, 0.5));
}

.rotating {
  animation: rotate 8s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.frames-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 15px;
  padding: 10px;
}

.frame-item {
  aspect-ratio: 1;
  border: 2px solid transparent;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.8);
  padding: 5px;
}

.merged-avatar {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.frame-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.qr-container {
  padding: 20px;
  text-align: center;
}

.qr-container h3 {
  margin-bottom: 15px;
  color: #333;
}

.qr-container p {
  margin-top: 15px;
  word-break: break-all;
  color: #666;
  font-size: 14px;
}
</style>