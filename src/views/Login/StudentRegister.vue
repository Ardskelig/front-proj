<template>
    <div class="registration-container">
      <van-nav-bar
        title="游客注册"
        left-arrow
        @click-left="router.go(-1)"
      />
      
      <van-form 
        ref="formRef"
        class="student-form"
        validate-first
        @failed="onFailed"
        @submit="handleSubmit"
      >
        <!-- 姓名 -->
        <van-cell-group inset>
          <van-field
            v-model="formValue.name"
            label="姓名"
            placeholder="请输入真实姓名"
            :rules="[
              { required: true, message: '姓名不能为空' },
              { validator: validateName, message: '姓名长度2-10个字符' }
            ]"
            maxlength="10"
            show-word-limit
          />
        </van-cell-group>
  
        <!-- 生日 -->
        <van-cell-group inset>
          <van-field
            v-model="formValue.birthday"
            label="生日"
            placeholder="请选择出生日期"
            :rules="[
              { required: true, message: '请选择出生日期' },
              { validator: validateDateFormat }
            ]"
            readonly
            is-link
            @click="showDatePicker = true"
          />
          <van-popup v-model:show="showDatePicker" round position="bottom">
            <van-date-picker
              title="选择日期"
              :min-date="minDate"
              :max-date="maxDate"
              @confirm="onConfirmDate"
              @cancel="showDatePicker = false"
            />
          </van-popup>
        </van-cell-group>
  
        <!-- 手机号 -->
        <van-cell-group inset>
          <van-field
            v-model="formValue.phone"
            label="手机号"
            placeholder="请输入手机号码"
            type="tel"
            :rules="[
              { required: true, message: '手机号不能为空' },
              { pattern: /^\d{11}$/, message: '11位有效号码' }
            ]"
            maxlength="11"
            clearable
            :formatter="formatPhone"
          />
        </van-cell-group>
  
        <!-- 入学年份 -->
        <van-cell-group inset>
          <van-field
            v-model="formValue.admissionYear"
            label="入学年份"
            placeholder="请输入4位年份"
            :rules="[
              { required: true, message: '入学年份必填' },
              { validator: validateAdmissionYear }
            ]"
            type="number"
            maxlength="4"
            clearable
            :formatter="formatYear"
          />
        </van-cell-group>
  
        <!-- 籍贯 -->
        <van-cell-group inset>
          <van-field
            v-model="formValue.hometown"
            label="籍贯"
            placeholder="请输入籍贯"
            :rules="[{ required: true, message: '籍贯不能为空' }]"
            clearable
          />
        </van-cell-group>
  
        <!-- 学院 -->
        <van-cell-group inset>
          <van-field
            v-model="formValue.college"
            label="学院"
            placeholder="请输入学院"
            :rules="[{ required: true, message: '学院不能为空' }]"
            clearable
          />
        </van-cell-group>
  
        <!-- 专业 -->
        <van-cell-group inset>
          <van-field
            v-model="formValue.major"
            label="专业"
            placeholder="请输入专业"
            :rules="[{ required: true, message: '专业不能为空' }]"
            clearable
          />
        </van-cell-group>
  
        <!-- 身份证号 -->
        <van-cell-group inset>
          <van-field
            v-model="formValue.idNumber"
            label="身份证号"
            placeholder="请输入18位身份证号"
            :rules="[
              { required: true, message: '身份证号必填' },
              { validator: validateIDNumber }
            ]"
            maxlength="18"
            clearable
            :formatter="formatIDCard"
          />
        </van-cell-group>
  
        <!-- 提交按钮 -->
        <div class="submit-btn">
          <van-button 
            round 
            block 
            type="primary" 
            native-type="submit"
            :loading="isSubmitting"
            loading-text="提交中..."
          >
            立即注册
          </van-button>
        </div>
      </van-form>
    </div>
  </template>
  
  <script setup>
  import { ref, reactive } from 'vue'
  import { useRouter } from 'vue-router'
  import { showToast } from 'vant'
  
  const router = useRouter()
  
  // 表单状态
  const formRef = ref(null)
  const isSubmitting = ref(false)
  const showDatePicker = ref(false)
  
  // 表单数据
  const formValue = reactive({
    name: '',
    birthday: '',
    phone: '',
    admissionYear: '',
    hometown: '',
    college: '',
    major: '',
    idNumber: ''
  })
  
  // 日期范围
  const minDate = new Date(1900, 0, 1)
  const maxDate = new Date()
  
  // 验证方法
  const validateName = (val) => val.length >= 2 && val.length <= 10
  const validateDateFormat = (val) => /^\d{4}-\d{2}-\d{2}$/.test(val)
  const validateAdmissionYear = (val) => /^\d{4}$/.test(val) && parseInt(val) > 1900
  const validateIDNumber = (val) => /^\d{17}[\dX]$/i.test(val)
  
  // 输入格式化
  const formatPhone = (value) => value.replace(/\D/g, '').slice(0, 11)
  const formatYear = (value) => value.replace(/\D/g, '').slice(0, 4)
  const formatIDCard = (value) => value.replace(/[^\dXx]/g, '').toUpperCase()
  
  // 日期选择
  const onConfirmDate = ({ selectedValues }) => {
    const [year, month, day] = selectedValues
    formValue.birthday = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
    showDatePicker.value = false
  }
  
  // 表单提交
  const handleSubmit = async () => {
    try {
      isSubmitting.value = true
      
      // 手动触发完整验证
      await formRef.value.validate()
      
      // 模拟API调用
      console.log('提交数据:', JSON.stringify(formValue, null, 2))
      showToast({ message: '注册成功', position: 'top' })
      
      // 跳转逻辑
      setTimeout(() => {
        router.push('/registration-success')
      }, 1500)
      
    } catch (error) {
      showToast({ message: '请完善表单信息', position: 'top' })
    } finally {
      isSubmitting.value = false
    }
  }
  
  // 验证失败处理
  const onFailed = ({ errors }) => {
    showToast({
      message: errors[0].message,
      position: 'top'
    })
  }
  </script>
  
  <style scoped>
  .registration-container {
    background: #f7f8fa;
    min-height: 100vh;
  }
  
  .student-form {
    padding: 20px 16px;
  }
  
  .van-cell-group {
    margin-bottom: 16px;
    background: #fff;
    border-radius: 8px;
  }
  
  :deep(.van-field__label) {
    width: 80px;
    color: #666;
  }
  
  .submit-btn {
    margin: 32px 16px;
  }
  
  :deep(.van-button--primary) {
    background: linear-gradient(135deg, #3f87f5, #66a6ff);
    border: none;
  }
  
  :deep(.van-popup) {
    background: #f7f8fa;
  }
  
  :deep(.van-picker__toolbar) {
    background: #fff;
  }
  </style>
  