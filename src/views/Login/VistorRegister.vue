<template>
    <div class="registration-container">
      <van-nav-bar
        title="访客注册"
        left-arrow
        @click-left="router.go(-1)"
      />
      
      <van-form 
        ref="formRef"
        @submit="handleSubmit"
        class="custom-form"
        validate-first
        @failed="handleValidationFailed"
      >
        <!-- 公共字段 - 姓名 -->
        <van-cell-group inset>
          <van-field
            v-model="formData.name"
            label="姓名"
            placeholder="请输入姓名"
            :rules="[
              { required: true, message: '姓名不能为空' },
              { validator: validateName, message: '姓名不能超过10字符' }
            ]"
            maxlength="10"
            show-word-limit
          />
        </van-cell-group>
  
        <!-- 联系电话 -->
        <van-cell-group inset>
          <van-field
            v-model="formData.phoneNum"
            label="联系电话"
            label-align="top"
            placeholder="11位手机号码"
            :rules="phoneRules"
            type="tel"
            maxlength="11"
            clearable
            :formatter="formatPhone"
          />
        </van-cell-group>
  
         <!-- 入校时间 -->
        <van-cell-group inset>
          <van-field
            v-model="displayComeTime"
            label="入校时间"
            label-align="top"
            placeholder="选择日期时间"
            :rules="comeTimeRules"
            readonly
            is-link
            @click="showComePicker = true"
          />
          <van-popup v-model:show="showComePicker" position="bottom">
            <van-date-picker
              :min-date="minDate"
              :max-date="maxDate"
              @confirm="(v) => handleTimeConfirm(v, 'come')"
              @cancel="showComePicker = false"
            />
          </van-popup>
        </van-cell-group>

        <!-- 出校时间 -->
        <van-cell-group inset>
          <van-field
            v-model="displayExitTime"
            label="出校时间"
            label-align="top"
            placeholder="选择日期时间"
            :rules="exitTimeRules"
            readonly
            is-link
            @click="showExitPicker = true"
          />
          <van-popup v-model:show="showExitPicker" position="bottom">
            <van-date-picker
              :min-date="minDate"
              :max-date="maxDate"
              @confirm="(v) => handleTimeConfirm(v, 'exit')"
              @cancel="showExitPicker = false"
            />
          </van-popup>
        </van-cell-group>
  
        <!-- 时间顺序错误提示 -->
        <van-notice-bar
          v-if="showErrors && !isTimeOrderValid"
          color="#ee0a24"
          background="#ffe1e1"
          mode="closeable"
          left-icon="warning-o"
        >
          出校时间必须晚于入校时间
        </van-notice-bar>
  
        <!-- 身份证号 -->
        <van-cell-group inset>
          <van-field
            v-model="formData.idNum"
            label="身份证号"
            label-align="top"
            placeholder="18位身份证号码"
            :rules="idNumberRules"
            maxlength="18"
            clearable
            :formatter="formatIDNumber"
          />
        </van-cell-group>
  
        <!-- 提交按钮 -->
        <div style="margin: 32px 16px;">
          <van-button 
            round 
            block 
            type="primary" 
            native-type="submit"
            :loading="isSubmitting"
            loading-text="正在提交..."
          >
            立即注册
          </van-button>
        </div>
      </van-form>
  
      <!-- 错误提示 -->
      <van-dialog 
        v-model:show="showError"
        title="注册失败"
        :message="errorMessage"
        show-cancel-button
        cancel-button-text="关闭"
      />
    </div>
  </template>
  
  <script setup>
  import { ref, reactive, computed, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { showToast, showSuccessToast } from 'vant'
  import { openDB } from 'idb'
  
  const router = useRouter()
  const formRef = ref(null)
  const isSubmitting = ref(false)
  const showError = ref(false)
  const errorMessage = ref('')
  // IndexedDB 配置
  const DB_NAME = 'visitorDB'
  const STORE_NAME = 'visitors'
  const DB_VERSION = 1
  
  // 初始化数据库
  const initDB = async () => {
    return openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, {
            keyPath: 'did',
            autoIncrement: false
          })
          store.createIndex('phone', 'phoneNum', { unique: true })
          store.createIndex('createdAt', 'createdAt')
        }
      }
    })
  }
  
  let dbPromise
  onMounted(() => {
    dbPromise = initDB()
  })
  // 数据库操作方法
  const storeVisitorData = async (visitorData) => {
    try {
      const db = await dbPromise
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      
      const dataWithMeta = {
        ...visitorData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
  
      await store.put(dataWithMeta)
      await tx.done
      return true
    } catch (error) {
      console.error('IndexedDB存储失败:', error)
      return false
    }
  }
  // 表单数据
  const formData = reactive({
    name: '',
    phoneNum: '',
    comeTime: '',
    exitTime: '',
    idNum: ''
  })
  
  // 日期选择相关
  const showEntryPicker = ref(false)
  const showExitPicker = ref(false)
  const minDate = new Date(2020, 0, 1)
  const maxDate = new Date(2030, 11, 31)
  const comeDate = ref([])
  const exitDate = ref([])
  
  // 初始化日期
  const initDates = () => {
    const now = new Date()
    const initDate = [now.getFullYear(), now.getMonth() + 1, now.getDate()]
    
    comeDate.value = formData.comeTime 
      ? formatToPickerArray(formData.comeTime)
      : initDate
    
    exitDate.value = formData.exitTime 
      ? formatToPickerArray(formData.exitTime)
      : initDate
  }
  
  // 格式化显示时间
  const displayComeTime = computed(() => formData.comeTime)
  const displayExitTime = computed(() => formData.exitTime)
  
  // 日期处理函数
  const pad = (n) => n.toString().padStart(2, '0')
  const formatToPickerArray = (dateString) => {
    const [datePart] = dateString.split(' ')
    return datePart.split('-').map(Number)
  }
  
  const handleComeConfirm = ({ selectedValues }) => {
    const [year, month, day] = selectedValues
    const now = new Date()
    formData.comeTime = `${year}-${pad(month)}-${pad(day)} ${pad(now.getHours())}:${pad(now.getMinutes())}:00`
    showEntryPicker.value = false
  }
  
  const handleExitConfirm = ({ selectedValues }) => {
    const [year, month, day] = selectedValues
    const now = new Date()
    formData.exitTime = `${year}-${pad(month)}-${pad(day)} ${pad(now.getHours())}:${pad(now.getMinutes())}:00`
    showExitPicker.value = false
  }
  
  // 验证规则
  const validateName = val => val.length <= 50
  const phoneRules = [
    { required: true, message: '请输入手机号码' },
    { pattern: /^1[3-9]\d{9}$/, message: '无效的手机号码' }
  ]
  const idNumberRules = [
    { required: true, message: '请输入身份证号' },
    { validator: val => /^\d{17}[\dX]$/i.test(val), message: '无效的身份证号码' }
  ]
  const comeTimeRules = [{ required: true, message: '请选择入校时间' }]
  const exitTimeRules = [{ required: true, message: '请选择出校时间' }]
  
  // 时间顺序验证
  const isTimeOrderValid = computed(() => {
    if (!formData.comeTime || !formData.exitTime) return true
    const come = new Date(formData.comeTime.replace(' ', 'T'))
    const exit = new Date(formData.exitTime.replace(' ', 'T'))
    return exit > come
  })
  
  // 输入格式化
  const formatPhone = value => value.replace(/\D/g, '').slice(0, 11)
  const formatIDNumber = value => value.replace(/[^\dXx]/g, '').toUpperCase()
  
  // 表单验证处理
  const handleValidationFailed = ({ errors }) => {
    if (errors[0]) {
      showToast({
        message: errors[0].message,
        position: 'top'
      })
    }
  }
  
  // 提交处理
  // 修改后的提交处理函数
  const handleSubmit = async () => {
    try {
      isSubmitting.value = true
      
      if (!isTimeOrderValid.value) {
        showToast('出校时间必须晚于入校时间')
        return
      }
  
      const requestData = { 
        name: formData.name,
        phoneNum: formData.phoneNum,
        comeTime: formData.comeTime,
        exitTime: formData.exitTime,
        idNum: formData.idNum
      }
      // 打印请求数据
      console.log('提交数据:', JSON.stringify(requestData, null, 2))
  
      const response = await fetch('http://chaindid.natapp1.cc/api/guest/creGuest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      })
  
      console.log(response)
      const result = await response.json()
      
      if (result.code === 1) {
        // 提取DID
        const didMatch = result.msg.match(/did:tdid:w1:(0x\w+)/)
        if (!didMatch) {
          throw new Error('无效的DID格式')
        }
        const did = didMatch[1]
  
        // 构建存储数据
        const visitorData = {
          did: did,
          name: formData.name,
          phoneNum: formData.phoneNum,
          idNum: formData.idNum,
          accessTimes: {
            entry: formData.comeTime,
            exit: formData.exitTime
          }
        }
  
        // 存储到IndexedDB
        const storageSuccess = await storeVisitorData(visitorData)
        
        if (storageSuccess) {
          showSuccessToast({
            message: '注册成功，数据已保存',
            duration: 1500,
            onClose: () => router.push('/login')
          })
        } else {
          showSuccessToast({
            message: '注册成功，但本地保存失败',
            duration: 1500,
            onClose: () => router.push('/login')
          })
        }
      } else {
        // 错误处理保持不变 */
      }
    } catch (error) {
      // 错误处理增强 */
      if (error.message.includes('DID')) {
        errorMessage.value = '系统数据格式错误，请联系管理员'
      } else {
        errorMessage.value = '网络请求失败，请稍后重试'
      }
      showError.value = true
    } finally {
      isSubmitting.value = false
    }
  }
  
  
  // 初始化日期选择器
  onMounted(initDates)
  </script>
  
  <style scoped>
  .registration-container {
    background: #f7f8fa;
    min-height: 100vh;
  }
  
  .custom-form {
    margin-top: 20px;
  }
  
  :deep(.van-field__label) {
    width: 80px;
  }
  
  .van-cell-group {
    margin-bottom: 16px;
  }
  
  :deep(.van-notice-bar) {
    margin: 12px 16px;
    border-radius: 6px;
  }
  </style>
  