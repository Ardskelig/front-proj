<template>
    <van-dialog 
      v-model:show="showStudentForm" 
      title="学生认证"
      show-cancel-button
      @confirm="handleStudentAuth"
      @cancel="resetStudentForm"
    >
      <van-form ref="studentForm">
        <van-cell-group inset>
          <van-field v-model="currentRootDid" label="根DID" readonly input-align="right" />
          <van-field v-model="studentForm.name" label="姓名" placeholder="请输入姓名" :rules="[{ required: true, message: '姓名不能为空' }]" />
          <van-field v-model="studentForm.idNum" label="身份证号" placeholder="请输入18位身份证号" :rules="idNumberRules" />
          <van-field v-model="studentForm.faculty" label="学部" placeholder="请输入所属学部" :rules="[{ required: true, message: '学部不能为空' }]" />
          <van-field v-model="studentForm.majority" label="专业" placeholder="请输入专业名称" :rules="[{ required: true, message: '专业不能为空' }]" />
          <van-field v-model="studentForm.class" label="班级" placeholder="请输入班级编号" :rules="[{ required: true, message: '班级不能为空' }]" />
          <van-field v-model="studentForm.enrollment" label="入学年份" placeholder="请输入4位年份" :rules="yearRules" />
          <van-field v-model="studentForm.duration" label="学制" placeholder="请输入学制年限" type="number" :rules="[{ required: true, message: '请输入学制' }]" />
          <van-field name="gender" label="性别">
            <template #input>
              <van-radio-group v-model="studentForm.gender" direction="horizontal">
                <van-radio name="M">男</van-radio>
                <van-radio name="F">女</van-radio>
              </van-radio-group>
            </template>
          </van-field>
          <van-field v-model="studentForm.nation" label="民族" placeholder="请输入民族" :rules="[{ required: true, message: '民族不能为空' }]" />
        </van-cell-group>
      </van-form>
    </van-dialog>
  </template>
  
  <script setup>
  import { showNotify } from 'vant';
  import { 
    initDB,
    getCurrentRootDID,
    dbCreateSubDID,
    updateRootCredential,
    updateSubCredential
  } from '@/db.js';
  import { ref, reactive } from 'vue';
  import axios from 'axios';  // 导入 axios
  import instance from "@/utils/request.js"
  
  // 定义表单
  const showStudentForm = ref(false);
  const studentForm = reactive({
    name: '令狐敬彪',
    idNum: '123456789012345678',
    faculty: '计算学部',
    majority: '计算机科学与技术',
    class: '2203102',
    enrollment: '2022',
    duration: 4,  // 设置为数字类型
    gender: 'F',
    nation: '汉'
  });
  //父子组件传值
  const emit=defineEmits(['studentAuthed'])
  // 定义规则
  const idNumberRules = [{ required: true, message: '身份证号不能为空' }];  // 确保 idNumberRules 定义
  const yearRules = [{ required: true, message: '学制年限不能为空' }];  // 确保 yearRules 定义
  
  // 学生认证方法
  const handleStudentAuth = async () => {
    try {
      // 1. 获取当前根DID
      const rootDID = await getCurrentRootDID();//从数据库中获取根DID
      if (!rootDID) {
        throw new Error('未找到根DID配置');
      }
  
      // 2. 提交学生认证请求
      const response = await instance.post(
        '/api/insider/getStudentCard',
        {
          rootDid: rootDID.did,  // 使用完整的根DIDf
          ...studentForm
        },
        { timeout: 10000 }
      );
      if(response.data.code===1){
      // 3. 直接更新根DID凭证
            // xkb
            await updateRootCredential(
              response.data.data.credentialDataStr,
              response.data.data.vcName,
              response.data.data.expireTime,
              response.data.data.logo
            );
            emit('studentAuthed',"认证成功")
            showNotify({ type: 'success', message: '认证成功' });
            
            // 4. 记录操作日志
            addOperationLog({
              type: '学生证签发',
              data: {
                rootDid: rootDID.did,
                credential: response.data.data,
                formData: { ...studentForm }
              }
            });
          
            // 5. 输出关键信息
            console.log('学生证签发信息:', {
              vcName: response.data.data.vcName,
              orgName: response.data.data.orgName,
              expireTime: response.data.data.expireTime
            });
          
            resetStudentForm();
      }else{
        emit('studentAuthed',"认证失败")
        showNotify({ type: 'warning', message: '认证失败' });
        throw new Error(response.data.msg || '学生证申请失败');
      }
      // if (response.data.code !== 1) {
      //   emit('studentAuthed',"认证失败")
      //   showNotify({ type: 'warning', message: '认证失败' });
      //   throw new Error(response.data.msg || '学生证申请失败');
        
      // }
    } catch (error) {
      console.error('认证失败:', error.message);
    }
  };
  
  // 重置表单
  const resetStudentForm = () => {
    studentForm.name = '令狐敬彪';
    studentForm.idNum = '123456789012345678';
    studentForm.faculty = '计算学部';
    studentForm.majority = '计算机科学与技术';
    studentForm.class = '2203103';
    studentForm.enrollment = '2022';
    studentForm.duration = 4;
    studentForm.gender = 'F';
    studentForm.nation = '汉';
    showStudentForm.value = false;
  };
  
  // 确保操作日志函数存在，如果没有定义需要提供一个实现
  const addOperationLog = (log) => {
    console.log('操作日志:', log);
  };

  defineExpose({ showStudentForm }); // 允许父组件直接控制弹窗

  </script>
  
  <style scoped>
  /* 样式部分 */
  </style>
  