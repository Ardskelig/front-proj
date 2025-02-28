<template>
  <!-- 应用新的容器样式 -->
  <div class="notification-container">
    <!-- 替换原来的blog-card为van-cell结构 -->
    <van-cell-group inset>
      <van-cell
        v-for="item in blogList"
        :key="item.queryId"
        class="notification-cell"
        :style="cellStyle(item.photo)"
        @click="fetchBlogDetail(item.queryId, item.blogId)"
      >
        <div class="content-wrapper">
          <div class="header">
            <h3 class="title">{{ item.title }}</h3>
            <span class="org">{{ item.orgName }}</span>
          </div>

          <div class="footer">
            <div class="meta">
              <van-tag :color="typeColors[item.type]" plain>
                {{ typeMap[item.type] }}
              </van-tag>
              <van-tag :color="getTagColor(item.tag)">
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
    </van-cell-group>

    <!-- 保留原有消息提示 -->
    <div :class="['message', { error: isError }]">{{ message }}</div>
    <!-- 详情弹窗 -->
    <van-popup 
      v-model:show="dialogVisible" 
      position="center"
      round
      :style="{ width: '90%', maxHeight: '80vh' }"
    >
      <div class="detail-content" v-if="currentDetail">
        <!-- 头部 -->
        <van-cell 
          :title="currentDetail.blogTitle" 
          title-style="font-size: 18px; font-weight: 500;"
          size="large"
        />

        <!-- 内容区域 -->
        <div class="scroll-area">
          <!-- 博客内容 -->
          <van-cell-group inset>
            <van-cell title="正文内容">
              <template #value>
                <div class="content-box">{{ currentDetail.content }}</div>
              </template>
            </van-cell>
          </van-cell-group>

          <!-- 图片展示 -->
          <van-cell-group inset v-if="filteredImages.length">
            <van-cell title="相关图片" />
            <van-grid :column-num="3" gutter="8">
              <van-grid-item 
                v-for="(img, index) in filteredImages" 
                :key="index"
                @click="showImagePreview(filteredImages, index)"
              >
                <van-image 
                  :src="img" 
                  height="100" 
                  fit="cover"
                />
              </van-grid-item>
            </van-grid>
          </van-cell-group>

          <!-- 表单信息 -->
          <van-cell-group inset>
            <van-cell title="表单信息" />
            <van-form>
              <template v-for="(field, index) in formFields" :key="index">
                <!-- 单行文本 -->
                <van-field 
                  v-if="field.type === '单行文本'"
                  v-model="formContent[field.title]"
                  :label="field.title"
                  readonly
                  input-align="right"
                />

                <!-- 多行文本 -->
                <van-field 
                  v-if="field.type === '多行文本'"
                  v-model="formContent[field.title]"
                  :label="field.title"
                  type="textarea"
                  autosize
                  readonly
                  input-align="right"
                />

                <!-- 下拉选择 -->
                <van-field 
                  v-if="field.type === '下拉选择'"
                  v-model="formContent[field.title]"
                  :label="field.title"
                  readonly
                  input-align="right"
                  is-link
                />

                <!-- 日期选择 -->
                <van-field 
                  v-if="field.type === '日期选择'"
                  v-model="formContent[field.title]"
                  :label="field.title"
                  readonly
                  input-align="right"
                  is-link
                />

                <!-- 文件上传 -->
                <van-field 
                  v-if="field.type === '文件上传'"
                  :label="field.title"
                  input-align="right"
                >
                  <template #input>
                    <van-uploader 
                      v-model="fileList" 
                      readonly
                      :deletable="false"
                    />
                  </template>
                </van-field>
              </template>
            </van-form>
          </van-cell-group>
        </div>

        <!-- 底部关闭按钮 -->
        <div class="popup-footer">
          <van-button round block type="primary" @click="dialogVisible = false">关闭</van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script>
import { ref } from 'vue'
import axios from 'axios'
import { getCurrentRootDID } from '../db.js'
import { ImagePreview } from 'vant'  // 正确导入图片预览组件
import dayjs from 'dayjs'
const API_TIMEOUT = 8000
const ERROR_TIMEOUT = 5000
// 配置数据
const typeMap = {
  insider: '内部',
  both: '通用'
}

const typeColors = {
  insider: '#7232dd',
  both: '#00b578'
}

// 样式生成方法
const cellStyle = (photo) => ({
  '--bg-image': photo ? `url(${photo})` : 'none',
  '--bg-color': getRandomLightColor()
})

const getTagColor = (tag) => {
  const colorMap = {
    'ad': '#ff3b30',
    '凭证问卷': '#07c160',
    '进入许可': '#1989fa',
    '治愈教会': '#914cee'
  }
  return colorMap[tag] || '#666'
}

const getRandomLightColor = () => {
  const hue = Math.floor(Math.random() * 360)
  return `hsl(${hue}, 30%, 85%)`
}
export default {
  setup() {
    return {
      blogList: ref([]),
      message: ref(''),
      isError: ref(false),
      dialogVisible: ref(false),
      currentDetail: ref(null),
      formContent: ref({}),
      formFields: ref([]),
      fileList: ref([])
    }
  },

  computed: {
    filteredImages() {
      if (!this.currentDetail) return []
      return Array.from({length: 9}, (_, i) => {
        const img = this.currentDetail[`image${i + 1}`]
        return img && img !== 'null' ? img : null
      }).filter(Boolean)
    }
  },

  mounted() {
    this.fetchBlogList()
  },

  methods: {
    async fetchBlogList() {
      try {
        this.isError = false
        this.message = '正在加载列表...'
        
        const root = await getCurrentRootDID()
        const response = await axios.post(
          'http://chaindid.natapp1.cc/api/query/queryList',
          { did: root.did },
          {
            headers: { 'Content-Type': 'application/json' },
            timeout: API_TIMEOUT
          }
        )

        if (response.data.code === 1) {
          this.blogList = response.data.data.map(blog => ({
            queryId: blog.queryId,
            title: blog.title,
            orgName: blog.orgName,
            deadline: blog.deadline,
            tag: blog.tag,
            blogId: blog.blogId
          }))
          this.message = `加载完成，共 ${this.blogList.length} 条数据`
        } else {
          throw new Error(response.data.msg || '接口返回异常')
        }
      } catch (err) {
        this.handleError(err, '列表加载')
      }
    },

    async fetchBlogDetail(queryId, blogId) {
      try {
        this.isError = false
        this.message = '正在获取详情...'
        
        const response = await axios.post(
          'http://chaindid.natapp1.cc/api/query/getQueryDetails',
          { queryId, blogId },
          {
            headers: { 'Content-Type': 'application/json' },
            timeout: API_TIMEOUT
          }
        )

        if (response.data.code === 1) {
          this.currentDetail = response.data.data || {}
          this.formFields = Array.isArray(this.currentDetail.result) 
            ? this.currentDetail.result 
            : []
          this.initFormContent()
          this.dialogVisible = true
          this.message = '详情加载完成'
        } else {
          throw new Error(response.data.msg || '详情获取失败')
        }
      } catch (err) {
        this.handleError(err, '详情获取')
      }
    },

    initFormContent() {
      this.formContent = this.formFields.reduce((acc, field) => {
        if (field?.title) {
          acc[field.title] = this.getDefaultValue(field.type)
        }
        return acc
      }, {})
    },

    getDefaultValue(type) {
      const defaults = {
        '单行文本': '',
        '多行文本': '',
        '下拉选择': null,
        '日期选择': null,
        '文件上传': []
      }
      return defaults[type] ?? ''
    },

    handleError(err, type = '') {
      this.isError = true
      this.message = `${type}失败: ${err.message}`
      console.error('[ERROR]', err)

      setTimeout(() => {
        this.isError = false
        this.message = ''
      }, ERROR_TIMEOUT)
    },

    formatDate(timestamp) {
      try {
        return timestamp ? new Date(Number(timestamp)).toLocaleString() : '未知时间'
      } catch {
        return '无效时间'
      }
    },

    // 修改后的图片预览方法
    showImagePreview(images, index = 0) {
      ImagePreview.show({
        images,
        startPosition: index,
        closeable: true
      })
    }
  }
}
</script>

<style scoped>
.notification-container {
  padding: 12px 0;
  background-color: #f7f8fa;
  min-height: 100vh;
}

/* 通知卡片样式 */
.notification-cell {
  height: 120px;
  margin: 10px 0;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  background: 
    linear-gradient(rgba(255,255,255,0.8), rgba(255,255,255,0.9)),
    var(--bg-image),
    var(--bg-color);
  background-size: cover;
  background-position: center;
  transition: transform 0.2s;
}

.notification-cell:active {
  transform: scale(0.98);
}

/* 内容布局 */
.content-wrapper {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 12px;
  position: relative;
  z-index: 1;
}

.header .title {
  margin: 0;
  font-size: 16px;
  color: #333;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.header .org {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
  display: block;
}

/* 底部元信息 */
.footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.footer .meta {
  display: flex;
  gap: 6px;
}

.footer .deadline {
  font-size: 12px;
  color: #666;
  display: flex;
  align-items: center;
}

/* 覆盖Vant组件样式 */
:deep(.van-cell__value) {
  overflow: visible;
}

:deep(.van-tag) {
  border-radius: 4px;
  font-size: 12px;
  line-height: 18px;
}

.custom-tag {
  color: white !important;
  border: none !important;
}

/* 消息提示 */
.message {
  padding: 12px;
  margin: 20px 16px;
  border-radius: 6px;
  background: #f3f4f6;
  text-align: center;
  font-size: 14px;
}

.message.error {
  background: #fee2e2;
  color: #dc2626;
}

/* 弹窗样式 */
.detail-modal {
  border-radius: 16px 16px 0 0;
}

.modal-content {
  padding: 20px;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin: 16px 0;
}

/* 图片预览 */
.preview-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  z-index: 1001;
  display: flex;
  justify-content: center;
  align-items: center;
}

.full-image {
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
}
</style>
