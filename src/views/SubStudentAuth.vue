<template>
  
  <van-dialog 
    v-model:show="showSubStudentForm" 
    title="申请子学生证"
    show-cancel-button
    @confirm="handleSubStudentAuth"
    @cancel="resetSubStudentForm"
  >
  <button @click="console.log(props.subDid)">打印传过来的子did</button>
    <van-form ref="formRef">
      <van-cell-group inset>
        
        <!-- <van-field
          v-model="subStudentForm.did"
          readonly
          clickable
          name="did"
          label="选择子DID"
          :rules="[{ required: true, message: '必须选择子DID' }]"
          @click="showPicker = true"
        />

        
        <van-popup v-model:show="showPicker" round position="bottom">
          <van-picker
            :columns="subDIDOptions"
            @cancel="showPicker = false"
            @confirm="onPickerConfirm"
          />
        </van-popup> -->

        <!-- 选项复选框 -->
        <van-checkbox-group v-model="subStudentForm.options">
          <van-checkbox name="enrollment">学籍信息</van-checkbox>
          <van-checkbox name="faculty">院系信息</van-checkbox>
          <van-checkbox name="majority">专业信息</van-checkbox>
        </van-checkbox-group>
      </van-cell-group>
    </van-form>
  </van-dialog>
</template>


<script setup>
import { ref, reactive, onMounted } from 'vue';
import { 
  Field, Picker, Popup, Checkbox, CheckboxGroup,
  Dialog as VanDialog, Form, CellGroup 
} from 'vant';
import axios from 'axios';
import { 
  getCurrentRootDID,
  updateSubCredential,
  searchSubDIDsByUsagePrefix,
} from '../db.js';
//接收父组件
const props=defineProps({
  subDid: String
})
// const subDid=props.subDid


// 响应式状态
const showSubStudentForm = ref(false);
const showPicker = ref(false);
const subDIDOptions = ref([]);
const emit = defineEmits(['submitted'])
// 表单数据
const subStudentForm = reactive({
  did: '',
  options: ['enrollment']
});

// 初始化加载
onMounted(async () => {
  try {
    const root = await getCurrentRootDID();
    console.debug('根凭证数据:', root);
    // 使用前缀搜索代替全量获取（示例搜索"student"开头的usage）
    const searchPrefix = 'student'; // 可修改为动态参数
    // const subDIDs = props.subDid
    
    // 处理空结果情况
    if (subDIDs.length === 0) {
      console.warn('未找到匹配的子DID');
      return;
    }

    subDIDOptions.value = subDIDs.map(item => ({
      text: `${item.usage} - ${item.did}`,  // 组合显示用途和DID
      value: item.did   
    }));
    
    console.log('过滤后的子DID选项:', subDIDOptions.value);
    
    // 设置默认值逻辑优化
    subStudentForm.did = subDIDs[0]?.did || ''; // 安全访问
    console.log('默认子DID:', subStudentForm.did);

  } catch (error) {
    console.error('初始化失败:', error);
    // 可添加UI提示
    // alert('初始化失败: ' + error.message)
  }
});

// 选择器确认回调
const onPickerConfirm = (value) => {
  subStudentForm.did = value.selectedValues[0];
  showPicker.value = false;
};

// 提交处理函数
const handleSubStudentAuth = async () => {

  
  emit('submitted', "向父组件传值，subStudentAuth") // 添加事件触发

//用于测试暂时注释

  try {
    console.groupCollapsed('[SubStudent] 开始提交申请');
    
    
    // // 表单验证
    // if (!subStudentForm.did) {
    //   console.warn('[验证失败] 未选择子DID');
    //   return;
    // }
    // console.debug('已选择子DID:', subStudentForm.did);
    console.log("发送请求：******************子did",props.subDid)

    // 获取根凭证
    const root = await getCurrentRootDID();
    console.debug('根凭证数据:', root);
    if (!root?.credentialDataStr) {
      console.error('[凭证错误] 根凭证数据缺失');
      throw new Error('系统未初始化根凭证');
    }
    console.debug('根凭证数据长度:', root.credentialDataStr.length);

    // 准备请求
    const postData = {
      did: props.subDid,
      rootCredential: root.credentialDataStr[0],
      options: subStudentForm.options
    };
    console.log('请求参数:', JSON.parse(JSON.stringify(postData))); // 消除响应式引用

    // 发送请求
    console.time('[SubStudent] API请求耗时');
    const response = await axios.post(
      'http://117.72.80.248:9999/api/insider/getSubStudentCard',
      postData,
      { 
        timeout: 10000,
        validateStatus: () => true // 确保所有响应都进入then
      }
    );
    console.timeEnd('[SubStudent] API请求耗时');
    
    console.debug('响应结果:', response);

    // 处理响应
    if (response.data.code !== 1) {
      console.error(`[API错误] ${response.data.msg || '未知错误'}`);
      throw new Error(response.data.msg);
    }

    //这里建议增加response.data.code==1的判断
    //emit部分可以向父组件传值
    // xkb
    emit('submitted', response.data) // 添加事件触发
    // 更新凭证
    await updateSubCredential(props.subDid, {
      credentialDataStr: response.data.data.credentialDataStr,
      vcName: response.data.data.vcName,
      expireTime: response.data.data.expireTime,
      logo: response.data.data.logo
    });
    console.info('子凭证更新完成');

    console.groupEnd();
    resetSubStudentForm();
  } catch (error) {
    console.error('[操作异常]', error);
    console.groupEnd();
  }
};

// 重置表单
const resetSubStudentForm = () => {
  console.debug('正在重置表单');
  subStudentForm.did = '';
  subStudentForm.options = ['enrollment'];
  showSubStudentForm.value = false;
};

defineExpose({
  showSubStudentForm 
})
</script>
