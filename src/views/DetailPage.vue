<template>
    <div class="detail-page">
      <!-- 导航栏 -->
      <van-nav-bar
        title="详情信息"
        left-text="返回"
        left-arrow
        @click-left="router.back"
      />
      <button @click="testData">点击查看formData</button>
  
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
  import { ImagePreview } from 'vant'
  
  const route = useRoute()
  const router = useRouter()
  
  // 响应式数据
  const loading = ref(true)
  const detailData = ref({})
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
      
      const response = await axios.post(
        'http://chaindid.natapp1.cc/api/query/getQueryDetails',
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
        // console.log('问卷渲染数据',queryContent.value)
        // showPicker.value = new Array(queryContent.value.length).fill(false);
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


  //问卷渲染


// 表单数据
const formData = ref({});
const fileList = ref({}); // 专门处理文件上传列表

//问卷渲染内容
const queryContent=ref([
    {
        "options": null,
        "type": "单行文本",
        "title": "姓名",
        "required": true
    },
    {
        "options": null,
        "type": "多行文本",
        "title": "自我介绍",
        "required": true
    },
    {
        "options": [
            "教师",
            "学生",
            "工人"
        ],
        "type": "下拉选择",
        "title": "职业",
        "required": true
    },
    {
        "options": [
            "计算机",
            "数学",
            "物理"
        ],
        "type": "下拉选择",
        "title": "专业",
        "required": true
    },
    {
        "options": null,
        "type": "文件上传",
        "title": "证件上传",
        "required": true
    },
    {
        "options": null,
        "type": "日期选择",
        "title": "日期",
        "required": true
    }
])


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

    const response = await axios.post('http://chaindid.natapp1.cc/api/file/upload', formdata, {
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
      showFailToast('上传失败1231');
    }
  } catch (error) {
    console.log(error)
    file.status = 'failed';
    showFailToast('上传失败0000');
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


// 提交表单
const onSubmit = () => {
  //数据库读取did
  const did = "did:tdid:w1:0xe2b76db07b3a7ede271bb72c986ef37610353ba4";

  // 转换表单数据为后端要求的格式
  const submitData = {
    queryId,
    did,
    keyList: Object.keys(formData.value),
    valueList: Object.values(formData.value)
  };

  // 过滤空值（如果需要）
  // submitData.keyList = submitData.keyList.filter((_, i) => submitData.valueList[i]);
  // submitData.valueList = submitData.valueList.filter(v => v);

  console.log('最终提交数据:', submitData);
  
  // 发送请求
  axios.post('http://chaindid.natapp1.cc/api/did/getCredential', submitData, {
    headers: {
      'Content-Type': 'application/json'
    }
  })
  .then(response => {
    showToast('提交成功');
    router.push('/Notice');
    console.log('接口响应:', response.data);
  })
  .catch(error => {
    showFailToast('提交失败');
    console.error('错误详情:', error);
  });
};



const testData=()=>{
    console.log("formData",formData.value)
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
  