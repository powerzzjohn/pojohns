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
        <div class="title">选择你的标签</div>
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

    <!-- 添加确认对话框 -->
    <van-dialog
      v-model:show="showConfirmDialog"
      title="确认使用此图片？"
      show-cancel-button
      @confirm="handleConfirm"
      :before-close="handleDialogClose"
    >
      <img :src="selectedImage" style="width: 100%; max-height: 300px; object-fit: contain;" />
    </van-dialog>

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
import { Button, Icon, Toast, Popup, Dialog } from 'vant'  // 添加 Dialog
import html2canvas from 'html2canvas'
import { saveAs } from 'file-saver'
import ImageCropper from '@/components/ImageCropper.vue'
import { nextTick } from 'vue'

const frames = ref([
  { url: new URL('@/assets/frames/frame1.png', import.meta.url).href },
  { url: new URL('@/assets/frames/frame2.png', import.meta.url).href },
  { url: new URL('@/assets/frames/frame3.png', import.meta.url).href },
  { url: new URL('@/assets/frames/frame4.png', import.meta.url).href },
  { url: new URL('@/assets/frames/frame5.png', import.meta.url).href },
  { url: new URL('@/assets/frames/frame6.png', import.meta.url).href }
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

const useCurrentAvatar = () => {
  // 在Web环境中直接跳转到上传照片模式
  uploadPhoto()
}

const uploadPhoto = () => {
  fileInput.value?.click()
}

const showConfirmDialog = ref(false)
const selectedImage = ref('')

const handleFileChange = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    selectedImage.value = URL.createObjectURL(file)
    showConfirmDialog.value = true
  }
}

const handleDialogClose = (action: string) => {
  showConfirmDialog.value = false
  if (action === 'cancel') {
    selectedImage.value = ''
  }
  return true
}

const handleConfirm = async () => {
  if (selectedImage.value) {
    cropperImage.value = selectedImage.value
    await nextTick()
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
  background: #FF0000 url('@/assets/bg-pattern.png') repeat;
  padding: 20px;
  position: relative;
}

.decoration {
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  gap: 10px;
}

.fu-icon {
  width: 60px;
  height: 60px;
}

.music-control {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
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

.main-content {
  max-width: 500px;
  margin: 0 auto;
  padding-top: 40px;
}

.preview-area {
  margin-bottom: 30px;
}

.avatar-frame {
  width: 200px;
  height: 200px;
  margin: 0 auto;
  position: relative;
  border-radius: 10px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.user-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.frame-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.action-buttons {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.action-btn {
  flex: 1;
  height: 40px;
  border-radius: 20px;
  background: #FF4D4F;
  color: white;
  border: none;
}

.frame-selector {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 15px;
  padding: 15px;
  margin-bottom: 20px;
}

.title {
  text-align: center;
  font-size: 18px;
  color: #333;
  margin-bottom: 15px;
}

.frames-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.frame-item {
  aspect-ratio: 1;
  border: 2px solid transparent;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
  padding: 5px;
}

.frame-item.active {
  border-color: #FF4D4F;
  transform: scale(1.05);
}

.frame-item img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.bottom-buttons {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.bottom-btn {
  flex: 1;
  height: 40px;
  border-radius: 20px;
}

.placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.9);
  color: #666;
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
  color: #666;
  font-size: 14px;
  word-break: break-all;
}
</style>