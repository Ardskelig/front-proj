<template>
    <div class="detail-page">
      <!-- 导航栏 -->
      <van-nav-bar
        title="详情信息"
        left-text="返回"
        left-arrow
        @click-left="router.back"
        fixed="true"
        placeholder="true"
      />
  
      <!-- 内容区域 -->
      <div v-if="loading" class="loading-wrapper">
        <van-loading size="24px">加载中...</van-loading>
      </div>
      <div v-else-if="isNone" style="text-align: center;">
        无内容
      </div>
      <template v-else>
        <!-- 标题 -->
         <div class="detail-container">
           <van-cell
             :title="detailData.blogTitle"
             title-class="detail-title"
             class="title-cell"
           />

           <!-- 内容区块 -->
           <div class="content-section">
             <!-- <van-cell title="正文内容" class="content-header" />   -->
             <div class="content-box">{{ detailData.content }}</div>
           </div>
         
           <!-- 图片展示 -->
           <div class="image-section" v-if="filteredImages.length">
             <!-- <van-cell title="相关图片" class="content-header" /> -->
             <van-grid :column-num="3" gutter="8">
               <van-grid-item
                 v-for="(img, index) in filteredImages"
                 :key="index"
                 @click="showImagePreview2(filteredImages, index)"
                 class="image-item"
               >
                 <van-image :src="img" height="100" fit="cover" class="rounded-image" />
               </van-grid-item>
             </van-grid>
           </div>
        </div>
        <div class="detail-page">
    <!-- 导航栏等其他内容保持不变 -->

        <!-- 表单信息 -->
        <div class="form-section">
          <van-cell title="表单信息" />
          <van-form @submit="onSubmit">
            <div v-for="(item, index) in queryContent" :key="index">
              <!-- 下拉选择 -->
              <van-field
                v-if="item.type === '下拉选择'"
                v-model="formData[item.title]"
                :name="item.title"
                :label="item.title"
                :placeholder="'请选择' + item.title"
                readonly
                clickable
                @click="showSinglePicker(item)"
              />
            
              <!-- 单行文本 -->
              <van-field
                v-if="item.type === '单行文本'"
                v-model="formData[item.title]"
                :name="item.title"
                :label="item.title"
                :rules="[{ required: item.required, message: '请输入' + item.title }]"
              />
            
              <!-- 多行文本 -->
              <van-field
                v-if="item.type === '多行文本'"
                v-model="formData[item.title]"
                :name="item.title"
                :label="item.title"
                type="textarea"
                autosize
                :rules="[{ required: item.required, message: '请输入' + item.title }]"
              />
            
              <!-- 日期选择 -->
              <van-field
                v-if="item.type === '日期选择'"
                v-model="formData[item.title]"
                :name="item.title"
                :label="item.title"
                readonly
                clickable
                @click="showDatePicker(item)"
              />
            
              <!-- 文件上传 -->
              <van-field
                v-if="item.type === '文件上传'"
                :name="item.title"
                :label="item.title"
                :rules="[{ required: item.required, message: '请上传文件' }]"
              >
                <template #input>
                  <van-uploader
                    v-model="fileList[item.title]"
                    :after-read="(file) => handleFileUpload(file, item.title)"
                    :max-count="3"
                    :before-delete="beforeDelete"
                  />
                </template>
              </van-field>
            </div>
          
            <!-- 提交按钮 -->
            <div style="margin: 16px">
              <van-button round block type="primary" native-type="submit">
                提交
              </van-button>
            </div>
          </van-form>
    </div>
      
        <!-- 选择器弹窗 -->
        <van-popup v-model:show="showPicker" round position="bottom">
          <van-picker
            :columns="currentPickerOptions"
            @confirm="onPickerConfirm"
            @cancel="showPicker = false"
          />
        </van-popup>
      
        <!-- 日期选择器 -->
        <van-calendar
          v-model:show="showDate"
          @confirm="onDateConfirm"
        />
      </div>
      </template>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { showToast, showFailToast } from 'vant';
  import axios from 'axios'
  import { showImagePreview } from 'vant';
  import instance from '@/utils/request.js'
  
  const isNone=ref(true)
  const route = useRoute()
  const router = useRouter()
  
  // 响应式数据
  const loading = ref(true)
  const detailData = ref(null)
  const errorMessage = ref('')
  const { queryId, blogId } = route.params

  
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
      
      const response = await instance.post(
        '/api/query/getQueryDetails',
        { queryId, blogId },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 8000
        }
      )
      console.log(response)
      if (response.data.code === 1) {
        detailData.value = response.data.data || {}
        queryContent.value=response.data.data.result
        isNone.value=false
        // console.log('问卷渲染数据',queryContent.value)
        // showPicker.value = new Array(queryContent.value.length).fill(false);
      } else {
        showFailToast(response.data.msg)
        throw new Error(response.data.msg || '详情获取失败')
      }
    } catch (err) {
      showFailToast("加载失败",err)
      errorMessage.value = `加载失败: ${err.message}`
    } finally {
      loading.value = false
    }

  })
  
  // 图片预览
  const showImagePreview2 = (images, index) => {
    showImagePreview(images)
    // ImagePreview.show({
    //   images,
    //   startPosition: index,
    //   closeable: true
    // })
  }


  //问卷渲染


// 表单数据
const formData = ref({});
const fileList = ref({}); // 专门处理文件上传列表

//问卷渲染内容
const queryContent=ref('')


// 选择器相关
const showPicker = ref(false);
const currentPickerOptions = ref([]);
const currentPickerField = ref('');

// 日期选择相关
const showDate = ref(false);
const currentDateField = ref('');

// 显示下拉选择器
const showSinglePicker = (item) => {
    console.log("目前的对象",item)
  currentPickerField.value = item.title;
  console.log('当前选择的标题：',item.title)
  currentPickerOptions.value = item.options.map(opt => ({ text: opt, value: opt }));
  console.log('目前的选择项：',currentPickerOptions.value)
  showPicker.value = true;
};

// 处理选择器确认
const onPickerConfirm = ({ selectedOptions }) => {
    console.log('选择的选项：',selectedOptions)
  formData.value[currentPickerField.value] = selectedOptions[0].text;
  console.log("formData",formData)
  showPicker.value = false;
};

// 显示日期选择器
const showDatePicker = (item) => {
  currentDateField.value = item.title;
  showDate.value = true;
};

// 处理日期选择
const onDateConfirm = (date) => {
    console.log("当前日期",date)
  formData.value[currentDateField.value] = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  showDate.value = false;
};

// 处理文件上传
// 新增上传状态常量
const UPLOAD_STATUS = {
  PENDING: 'pending',
  UPLOADING: 'uploading',
  DONE: 'done',
  FAILED: 'failed'
};


const handleFileUpload = async (file, fieldName) => {
  // 处理多文件情况
  if (Array.isArray(file)) {
    return Promise.all(file.map(f => uploadSingleFile(f, fieldName)));
  }
  return uploadSingleFile(file, fieldName);
};

const uploadSingleFile = async (file, fieldName) => {
  try {
    const formdata = new FormData();
    formdata.append('file', file.file);

    const response = await instance.post('/api/file/upload', formdata, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    console.log('上传结果:', response.data);
    console.log("fieldName",fieldName)
    if (response.data.code === 1) {
      // 仅更新文件状态（v-model 会自动更新列表）
      file.status = 'done';
      file.url = response.data.data;
      formData.value[fieldName] = response.data.data;
      return response.data.data;
    } else {
      file.status = 'failed';
      showFailToast('上传失败');
    }
  } catch (error) {
    console.log(error)
    file.status = 'failed';
    showFailToast('上传失败');
  }
};

// 文件删除前的处理
const beforeDelete = (file) => {
  // 从文件列表中移除
  const index = fileList.value[fieldName].findIndex(f => f.uid === file.uid);
  if (index !== -1) {
    fileList.value[fieldName].splice(index, 1);
  }
  return true;
};

import { getRootDID, updateRootCredential } from '@/db.js';

// 提交表单
const onSubmit = async() => {
  // IndexedDB读取did
  // 获取DID列表
  const queryResult = await getRootDID();
    console.log("DID查询结果：", queryResult);

    // 校验数据有效性（关键修改点）
    if (!Array.isArray(queryResult) || queryResult.length === 0) {
      throw new Error('未查询到有效的DID记录');
    }

    // 明确选择第一个DID（根据业务需求调整）
    const firstValidDID = queryResult.find(item => item?.did);
    if (!firstValidDID) {
      throw new Error('DID数据格式异常');
    }
    const did = firstValidDID.did;
    console.log("使用的DID:", did);

  // 转换表单数据为后端要求的格式
  const submitData = {
    queryId,
    did,
    keyList: Object.keys(formData.value),
    valueList: Object.values(formData.value)
  };

  console.log('最终提交数据:', submitData);
  
  // 发送请求
  try{
    const response=await instance.post('/api/did/getCredential', submitData, {
    headers: {
      'Content-Type': 'application/json'
    }})
    if(response.data.code===1){
      showToast('提交成功');
    // 获取response中的凭证数据，并且存储到indexedDB
    await updateRootCredential(
            response.data.data.credentialDataStr,
            response.data.data.vcName,
            response.data.data.expireTime,
            response.data.data.logo
        );

        router.push('/Notice');
        console.log('接口响应:', response.data);
    }else{
      showFailToast('提交失败');
    }
  
  }catch{
    showFailToast('提交失败');
  }
  
  
  // .then(async response => {
  //   showToast('提交成功');

  //   console.log(response)

  //   // 获取response中的凭证数据，并且存储到indexedDB
  //   await updateRootCredential(
  //       response.data.data.credentialDataStr,
  //       response.data.data.vcName,
  //       response.data.data.expireTime,
  //       response.data.data.logo
  //   );

  //   router.push('/Notice');
  //   console.log('接口响应:', response.data);
  // })
  // .catch(error => {
  //   showFailToast('提交失败');
  //   console.error('错误详情:', error);
  // });
};



const testData=()=>{
    console.log("formData",formData.value)
}



  </script>
  
  <style scoped>
  /* 页面整体布局 */
.detail-container {
  padding: 16px;
  background-color: #f5f7fa; /* 浅色背景 */
  /* min-height: 100vh; */
}

/* 标题样式 */
.title-cell {
  background: #ffffff;
  font-size: 20px;
  font-weight: bold;
  color: #333;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 12px;
}

/* 内容区块 */
.content-section {
  background: #ffffff;
  padding: 12px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 12px;
}

.content-header {
  font-size: 16px;
  font-weight: bold;
  color: #444;
  margin-bottom: 8px;
}

.content-box {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  background: #f9f9f9;
  padding: 12px;
  border-radius: 6px;
}

/* 图片展示区域 */
.image-section {
  background: #ffffff;
  padding: 12px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.image-item {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 6px;
}

.rounded-image {
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-section {
  padding: 5px;
}
  </style>
  