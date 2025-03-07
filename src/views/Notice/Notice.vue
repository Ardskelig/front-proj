<template>
  <!-- <van-nav-bar title="通知" fixed="true" /> -->
  <router-view v-slot="{ Component }">
    <transition name="slide-fade" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
  <div class="notification-container">
    <van-loading v-if="loading" class="loading-tip" size="24px">
      加载中...
    </van-loading>

    <div v-if="error" class="error-tip">
      <van-icon name="warning" class="warning-icon" />
      数据加载失败，请稍后重试
    </div>

    <van-cell-group inset v-if="!loading && !error">
      <van-cell
        v-for="item in notifications"
        :key="item.queryId"
        class="notification-cell"
        :style="cellStyle(item.photo)"
        @click="handleClick(item)"
      >
        <div class="content-wrapper">
          <div class="header">
            <h2 class="title">{{ item.title }}</h2>
            <span class="org">{{ item.orgName }}</span>
          </div>

          <div class="footer">
            <div class="meta">
              <van-tag plain class="type-tag">
                {{ typeMap[item.type] }}
              </van-tag>
              <van-tag >
                {{ item.tag }}
              </van-tag>
            </div>
            <span class="deadline">
              <van-icon name="clock" /> 
              {{ formatDate(item.deadline) }}
            </span>
          </div>
        </div>
      </van-cell>
      <div style="padding-top: 5vh;"></div>
    </van-cell-group>

    <div v-if="!loading && !error && notifications.length === 0" class="empty-tip">
      <van-icon name="info" class="info-icon" />
      暂无最新通知
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { showNotify } from 'vant';
import instance from '@/utils/request.js'
// import axios from 'axios'
import { useRouter } from 'vue-router'
import { getCurrentRootDID } from '../../db.js'
import dayjs from 'dayjs'

// 状态管理
const notifications = ref([])
const loading = ref(true)
const error = ref(false)
const router = useRouter()

// 类型配置
const typeMap = {
  insider: '内部',
  both: '通用'
}

const typeColors = {
  insider: '#7232dd',
  both: '#00b578'
}

// 生命周期钩子
onMounted(async () => {
  try {
    const root = await getCurrentRootDID()
    // const response = await axios.post(
    //   'http://117.72.80.248:9999/api/query/queryList',
    //   { did: root.did },
    //   {
    //     headers: { 'Content-Type': 'application/json',
    //       'X-Requested-With': 'XMLHttpRequest'
    //      },
    //     timeout:16000
    //     }
    // )
    //使用封装的axios发送请求
    const response = await instance.post('/api/query/queryList', { did: root.did })
    console.log("查询通知返回响应：",response)
    if (response.data.code === 1) {
      notifications.value = response.data.data.map(blog => ({
        queryId: blog.queryId,
        title: blog.title || '未命名通知',
        orgName: blog.orgName || '未知机构',
        deadline: blog.deadline || new Date().toISOString(),
        photo: validateImage(blog.photo) || getRandomImagePlaceholder(),
        type: ['insider', 'both'].includes(blog.type) ? blog.type : 'both',
        tag: blog.tag || '通知',
        blogId: blog.blogId || 0
      }))
    } else {
      showNotify({ type: 'warning', message: '服务异常' });
      throw new Error(response.data.msg || '接口返回异常')
    }
  } catch (err) {
    showNotify({ type: 'warning', message: '服务异常' });
    console.error('数据加载失败:', err)
    error.value = true
  } finally {
    loading.value = false
  }
})

// 图片验证
const validateImage = (url) => {
  try {
    new URL(url)
    return url
  } catch {
    return null
  }
}

// 随机图片占位
const getRandomImagePlaceholder = () => {
  const randomId = Math.floor(Math.random() * 1000)
  return `https://picsum.photos/400/400?random=${randomId}`
}

// 样式处理
const cellStyle = (photo) => ({
  '--bg-image': photo ? `url(${photo})` : 'none',
  '--bg-color': getRandomLightColor()
})

// 辅助函数
const formatDate = (dateString) => {
  return dayjs(dateString).format('MM-DD HH:mm')
}

const getTagColor = (tag) => {
  const colorMap = {
    '进入许可': '#1989fa',
    '治愈教会': '#914cee'
  }
  return colorMap[tag] || '#666'
}

const getRandomLightColor = () => {
  const hue = Math.floor(Math.random() * 360)
  return `hsl(${hue}, 30%, 85%)`
}

// 点击处理
const handleClick = (item) => {
  router.push({
    name: 'BlogDetail',
    params: {
      queryId: item.queryId,
      blogId: item.blogId
    }
  })
}
</script>
<style scoped>
.notification-container {
  padding: 12px 0;
  min-height: 200px;
  position: relative;
}

.loading-tip {
  display: flex;
  justify-content: center;
  padding: 40px 20px;
  color: #666;
}

.error-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #f5222d;
  .warning-icon {
    margin-right: 8px;
    font-size: 16px;
  }
}

.empty-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #666;
  .info-icon {
    margin-right: 8px;
    font-size: 16px;
  }
}

.notification-cell {
  height: auto;
  margin: 10px 0;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background: 
    linear-gradient(rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.9)),
    var(--bg-image),
    var(--bg-color);
  background-size: cover;
  background-position: center;
  padding: 18px;
  min-height: 140px;
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  z-index: 1;
  height: 100%;
}

.header .title {
  margin: 0 0 10px 0;
  font-size: 20px;
  font-weight: 500;
  color: #333;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.header .org {
  font-size: 15px;
  color: #666;
  padding: 6px 12px;
  background: rgba(255,255,255,0.9);
  border-radius: 16px;
  display: inline-block;
}

.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 14px;
  padding-top: 14px;
}

.footer .meta {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.footer .deadline {
  font-size: 14px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: rgba(255,255,255,0.95);
  border-radius: 16px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.06);
  .van-icon {
    font-size: 16px;
  }
}

:deep(.van-tag) {
  font-size: 13px !important;
  padding: 6px 10px;
  margin: 2px;
}

.custom-tag {
  color: white !important;
  border: none !important;
  background-color: #1a73e8 !important;
}

.notification-cell:active {
  transform: scale(0.98);
  opacity: 0.9;
  transition: all 0.2s ease;
}
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(20px);
  opacity: 0;
}

:root:root {
  --van-nav-bar-background:#1A1A1A;
}

.type-tag {
  color: #fff;
    font-weight: 500;
    background: rgba(0, 0, 0, 0.25);
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 14px;
    backdrop-filter: blur(4px);
}

</style>