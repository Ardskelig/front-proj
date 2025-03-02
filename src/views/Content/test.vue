<template>
    <button @click="testData">点击查看formData</button>
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
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import { showToast, showFailToast } from 'vant';
import axios from 'axios';
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
  // 处理文件上传字段
  const submitData = { ...formData };
  Object.keys(fileList).forEach(key => {
    submitData[key] = fileList[key].map(file => file.file.name); // 这里替换为实际的文件URL
  });
  
  console.log('提交数据:', submitData);
  showToast('提交成功');
};


const testData=()=>{
    console.log("formData",formData.value)
}

</script>