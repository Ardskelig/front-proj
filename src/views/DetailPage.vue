<template>
    <div class="detail-page">
      <!-- 导航栏 -->
      <van-nav-bar
        title="详情信息"
        left-text="返回"
        left-arrow
        @click-left="router.back"
      />
  
      <!-- 内容区域 -->
      <div v-if="loading" class="loading-wrapper">
        <van-loading size="24px">加载中...</van-loading>
      </div>
  
      <template v-else>
        <!-- 标题 -->
        <van-cell 
          :title="detailData.blogTitle" 
          title-class="detail-title"
        />
  
        <!-- 内容区块 -->
        <div class="content-section">
          <van-cell title="正文内容" />
          <div class="content-box">{{ detailData.content }}</div>
        </div>
  
        <!-- 图片展示 -->
        <div class="image-section" v-if="filteredImages.length">
          <van-cell title="相关图片" />
          <van-grid :column-num="3" gutter="8">
            <van-grid-item
              v-for="(img, index) in filteredImages"
              :key="index"
              @click="showImagePreview(filteredImages, index)"
            >
              <van-image :src="img" height="100" fit="cover" />
            </van-grid-item>
          </van-grid>
        </div>
  
        <!-- 表单信息 -->
        <div class="form-section">
          <van-cell title="表单信息" />
          <van-form>
            <!-- 表单字段渲染... -->
          </van-form>
        </div>
      </template>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import axios from 'axios'
  import { ImagePreview } from 'vant'
  
  const route = useRoute()
  const router = useRouter()
  
  // 响应式数据
  const loading = ref(true)
  const detailData = ref({})
  const errorMessage = ref('')
  
  // 计算属性
  const filteredImages = computed(() => {
    return Array.from({length: 9}, (_, i) => {
      const img = detailData.value[`image${i + 1}`]
      return img && img !== 'null' ? img : null
    }).filter(Boolean)
  })
  
  // 生命周期
  onMounted(async () => {
    try {
      const { queryId, blogId } = route.params
      const response = await axios.post(
        'http://chaindid.natapp1.cc/api/query/getQueryDetails',
        { queryId, blogId },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 8000
        }
      )
  
      if (response.data.code === 1) {
        detailData.value = response.data.data || {}
      } else {
        throw new Error(response.data.msg || '详情获取失败')
      }
    } catch (err) {
      errorMessage.value = `加载失败: ${err.message}`
    } finally {
      loading.value = false
    }
  })
  
  // 图片预览
  const showImagePreview = (images, index) => {
    ImagePreview.show({
      images,
      startPosition: index,
      closeable: true
    })
  }
  </script>
  
  <style scoped>
  .detail-page {
    min-height: 100vh;
    background: #ffffff;
  }
  
  .loading-wrapper {
    padding: 100px 0;
    text-align: center;
  }
  
  .detail-title {
    font-size: 20px;
    font-weight: 500;
    padding: 16px;
  }
  
  .content-section {
    margin: 16px 0;
  }
  
  .content-box {
    padding: 12px 16px;
    line-height: 1.6;
    color: #666;
  }
  </style>
  