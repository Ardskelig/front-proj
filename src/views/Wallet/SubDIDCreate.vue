<!-- 获取子DID -->


<template>
  <van-dialog 
    v-model:show="showSubForm" 
    title="创建子DID"
    show-cancel-button
    @confirm="createSubDID"
    @cancel="resetSubForm"
  >
    <van-form ref="subFormRef">
      <van-cell-group inset>
        <van-field 
          v-model="currentRootDid.did" 
          label="根DID" 
          readonly 
          input-align="right" 
        />
        <van-field 
          v-model="formData.usage" 
          label="用途说明" 
          placeholder="请输入详细用途" 
          :rules="[{ required: true, message: '用途说明不能为空' }]" 
        />
        <van-field name="phoneVerification" label="手机验证">
          <template #input>
            <van-switch v-model="formData.phoneVerification" size="20" />
          </template>
        </van-field>
      </van-cell-group>
    </van-form>
  </van-dialog>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import axios from 'axios'; // 确保已安装axios
import instance from "@/utils/request.js"
import { showSuccessToast, showFailToast } from 'vant';
import { 
    getCurrentRootDID,
    dbCreateSubDID,
  } from '@/db.js';;

const showSubForm = ref(false);
const currentRootDid = ref('');
const subFormRef = ref(null);//控制打开表单
const formData = reactive({
  usage: '',
  phoneVerification: false
});
const emit=defineEmits(['didCreated']);


const createSubDID = async () => {

  // emit('didCreated',"向父组件传值");//触发didCreated事件,通知父组件
  //用于测试组件传值，暂时注释
  try {
    // 发送创建子DID请求
    const response = await instance.post(
      '/api/insider/creSubDid',
      {
        rootDid: currentRootDid.value.did,
        usage: formData.usage,  // 使用的是 formData 中的值
        phoneNum: formData.phoneVerification  // 使用 formData 中的手机验证状态
      },
      { timeout: 10000 }
    );
    console.log('response:', response);

    // 判断响应代码，如果不为 1，表示失败
    if (response.data.code === 1) {
        // 成功后，存储数据到数据库
      await dbCreateSubDID(
        response.data.map.usage,
        response.data.data
      );
      showSuccessToast('子DID创建成功');
      emit('didCreated',response.data);//触发didCreated事件,通知父组件
      
    }else{
      showFailToast('子DID创建失败');
      throw new Error(response.data.msg || '子DID创建失败');
    }
    
  } catch (error) {
    // 处理错误并显示失败提示
    showFailToast('子DID创建失败');
    console.error('创建子DID失败:', error);

  }
};

const resetSubForm = () => {
  formData.usage = ''; // 清空用途说明
  formData.phoneVerification = false; // 清空手机验证
  showSubForm.value = false; // 隐藏表单
};


onMounted(async () => {
  currentRootDid.value = await getCurrentRootDID();
});
  

defineExpose({ showSubForm }); // 允许父组件直接控制弹窗
</script>

<style scoped>
/* 样式部分 */
</style>
