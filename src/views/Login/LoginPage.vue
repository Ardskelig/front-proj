<template>
    <div class="login-container">
      <!-- Logo 区域 -->
      <div class="logo-area">
        <van-image
          width="80"
          height="80"
          src="/logo.png"
          round
          fit="cover"
        />
        <h1 class="title">DID 身份系统</h1>
      </div>
  
      <!-- 登录卡片 -->
      <van-cell-group inset class="login-card">
        <!-- DID 展示区 -->
        <van-cell v-if="did" title="当前身份" :value="did" value-class="did-value">
          <template #icon>
            <van-icon name="certificate" size="18" class="cell-icon" />
          </template>
        </van-cell>
  
        <div class="tip-text" v-else>
          <van-icon name="warning" color="#ff976a" />
          <span>尚未检测到有效身份信息</span>
        </div>
      </van-cell-group>
  
      <!-- 操作按钮 -->
      <div class="action-buttons">
        <van-button
          round
          block
          type="primary"
          :loading="loading"
          loading-text="验证中..."
          @click="handleLogin"
          class="login-btn"
        >
          <template #icon>
            <van-icon name="shield-o" />
          </template>
          立即登录
        </van-button>
  
        <van-button
          plain
          round
          block
          type="primary"
          @click="router.push('/ChooseRegister')"
          class="register-btn"
        >
          <template #icon>
            <van-icon name="edit" />
          </template>
          前往注册
        </van-button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { showConfirmDialog, showToast } from 'vant'
  import { openDB } from 'idb'
  
  const router = useRouter()
  const did = ref('')
  const loading = ref(false)
  
  // IndexedDB配置（需与注册页面一致）
  const DB_NAME = 'visitorDB'
  const STORE_NAME = 'visitors'
  const DB_VERSION = 1
  
  // 初始化数据库
  const initDB = async () => {
    return openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'did' })
        }
      }
    })
  }
  
  // 获取最新DID
  const getLatestDID = async () => {
    try {
      const db = await initDB()
      const tx = db.transaction(STORE_NAME, 'readonly')
      const store = tx.objectStore(STORE_NAME)
      
      // 获取所有键（DID）
      const allKeys = await store.getAllKeys()
      if (allKeys.length === 0) return null
  
      // 按时间排序获取最新DID
      const index = store.index('createdAt')
      const cursor = await index.openCursor(null, 'prev')
      return cursor ? cursor.key : null
    } catch (error) {
      console.error('DID查询失败:', error)
      return null
    }
  }
  
  // 检测DID
  const checkDID = async () => {
    loading.value = true
    try {
      const latestDID = await getLatestDID()
      did.value = latestDID || ''
      
      if (!latestDID) {
        showToast({
          message: '未找到身份凭证',
          icon: 'warning-o',
        })
      }
    } finally {
      loading.value = false
    }
  }
  
  // 登录处理
  const handleLogin = async () => {
    if (!did.value) {
      showConfirmDialog({
        title: '身份验证',
        message: '您尚未注册身份信息，是否立即注册？',
        confirmButtonText: '去注册',
      }).then(() => {
        router.push('/ChooseRegister')
      })
      return
    }
  
    loading.value = true
    try {
      // 实际应调用验证接口
      const isValid = await validateDID(did.value)
      
      if (isValid) {
        showToast({ message: '登录成功', icon: 'passed' })
        router.push('/home')
      } else {
        showToast({ message: '身份凭证已过期', icon: 'clear' })
        did.value = ''
      }
    } catch (error) {
      showToast('验证失败，请重试')
    } finally {
      loading.value = false
    }
  }
  
  // 模拟DID验证
  const validateDID = async (did) => {
    // 实际应替换为API调用
    return new Promise(resolve => {
      setTimeout(() => resolve(true), 1000)
    })
  }
  
  onMounted(() => {
    checkDID()
  })
  </script>
  
  
  <style scoped>
  .login-container {
    padding: 20px;
    min-height: 100vh;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  }
  
  .logo-area {
    text-align: center;
    padding: 40px 0;
    .title {
      margin-top: 15px;
      color: #2c3e50;
      font-weight: 500;
    }
  }
  
  .login-card {
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    
    :deep(.van-cell__value) {
      flex: 2;
    }
  }
  
  .did-value {
    color: #07c160;
    font-weight: 500;
  }
  
  .tip-text {
    padding: 16px;
    text-align: center;
    color: #969799;
    font-size: 14px;
    
    .van-icon {
      vertical-align: middle;
      margin-right: 5px;
    }
  }
  
  .action-buttons {
    margin-top: 40px;
    padding: 0 20px;
    
    .login-btn {
      background: linear-gradient(to right, #3f87f5, #6ba8f5);
      border: none;
      margin-bottom: 15px;
      
      :deep(.van-icon) {
        margin-right: 8px;
      }
    }
    
    .register-btn {
      color: #3f87f5;
      border-color: #3f87f5;
    }
  }
  
  .cell-icon {
    margin-right: 10px;
    color: #3f87f5;
    vertical-align: middle;
  }
  </style>
  