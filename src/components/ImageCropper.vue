<template>
  <div class="image-cropper">
    <van-popup :show="visible" @update:show="(val) => emit('update:visible', val)" position="bottom" :style="{ height: '70%' }">
      <div class="cropper-container">
        <vue-cropper
          ref="cropperRef"
          :img="imageUrl"
          :outputSize="1"
          :outputType="'png'"
          :info="true"
          :full="true"
          :canMove="true"
          :canMoveBox="true"
          :original="false"
          :autoCrop="true"
          :fixed="true"
          :fixedNumber="[1, 1]"
          :centerBox="true"
          @realTime="realTime"
        />
        <div class="cropper-buttons">
          <van-button type="default" @click="cancel">取消</van-button>
          <van-button type="primary" @click="confirm">确定</van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import VueCropper from 'vue-cropper'
import 'vue-cropper/dist/index.css'

const props = defineProps<{
  visible: boolean
  imageUrl: string
}>()

const emit = defineEmits(['update:visible', 'confirm'])

const cropperRef = ref()

const cancel = () => {
  emit('update:visible', false)
}

const confirm = () => {
  cropperRef.value.getCropData((data: string) => {
    emit('confirm', data)
    emit('update:visible', false)
  })
}

const realTime = (data: any) => {
  // 实时预览
}
</script>

<style scoped>
.cropper-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.cropper-buttons {
  padding: 16px;
  display: flex;
  justify-content: space-between;
}
</style>