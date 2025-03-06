<template>
  <div class="card-container">
    <!-- <el-button type="success" :icon="Check" circle /> -->
    <!-- <van-button plain type="primary" @click="console.log(cards)">点击此处进行学生认证</van-button> -->

     <!-- 加载状态 -->
     <div v-if="loading" class="loading">加载中...</div>
    
    <!-- 错误提示 -->
    <div v-if="error" class="error">加载失败: {{ error }}</div>

    <div v-for="(card, index) in cards" :key="index" class="card">
      <div class="card-header">
        
        <span class="did-type" v-if=!card.isRoot>usage:{{ card.usage }}</span>
        <span class="did-type" v-else>root</span>
      </div>

      
      <div class="background"></div>
      <button @click="openStudentAuthForm" v-if="card.isRoot" class="add-box-btn"><van-icon name="plus" />学生认证</button>
      <button @click="openSubAuthForm(card)" v-else class="add-box-btn" >
        <van-icon name="plus" />子学生证申请
      </button>
      
      <div class="logo">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 29.667 31.69" class="logo-svg">
          <path id="Path_6" data-name="Path 6" d="M12.827,1.628A1.561,1.561,0,0,1,14.31,0h2.964a1.561,1.561,0,0,1,1.483,1.628v11.9a9.252,9.252,0,0,1-2.432,6.852q-2.432,2.409-6.963,2.409T2.4,20.452Q0,18.094,0,13.669V1.628A1.561,1.561,0,0,1,1.483,0h2.98A1.561,1.561,0,0,1,5.947,1.628V13.191a5.635,5.635,0,0,0,.85,3.451,3.153,3.153,0,0,0,2.632,1.094,3.032,3.032,0,0,0,2.582-1.076,5.836,5.836,0,0,0,.816-3.486Z" transform="translate(0 0)"></path>
          <path id="Path_7" data-name="Path 7" d="M75.207,20.857a1.561,1.561,0,0,1-1.483,1.628h-2.98a1.561,1.561,0,0,1-1.483-1.628V1.628A1.561,1.561,0,0,1,70.743,0h2.98a1.561,1.561,0,0,1,1.483,1.628Z" transform="translate(-45.91 0)"></path>
          <path id="Path_8" data-name="Path 8" d="M0,80.018A1.561,1.561,0,0,1,1.483,78.39h26.7a1.561,1.561,0,0,1,1.483,1.628v2.006a1.561,1.561,0,0,1-1.483,1.628H1.483A1.561,1.561,0,0,1,0,82.025Z" transform="translate(0 -51.963)"></path>
        </svg>
      </div>
      
      <!-- 动态渲染box内容 -->
      <!-- 动态渲染所有 box -->
      <div v-for="(box, boxIndex) in card.boxes" 
         :key="boxIndex" 
         class="box"
         :class="'box' + ((boxIndex % 4) + 1)"
         @click="handleClick(box)">
        <div class="box-content">
          <span class="vc-name">{{ box.vcName }}</span>
          <span class="expire-time">expire-time:{{ formatExpireTime(box.expireTime) }}</span>
        </div>
      </div>
  
    </div>
    <button @click="openSubForm" class="add-card-btn">创建子DID</button>
    <div style="padding-top: 5vh;"></div>
  </div>
  <!-- 弹窗组件 -->
  <SubDIDCreate ref="subDidFormRef" @didCreated="handleDidCreate" />
  <SubStudentAuth ref="subAuthRef" @submitted="handleSubAuthSuccess" :subDid="subDid"/>
  <StudentAuth ref="studentAuthRef" @studentAuthed="handleStudentAuth"/>


  <van-dialog
    v-model:show="showDialog"
    title="凭证二维码"
    show-cancel-button
    @confirm="showDialog = false"
  >
    <div class="dialog-content">
      <vue-qrcode 
        v-if="selectedBox"
        :value="qrContent"
        :options="{ width: 240, height: 240 }"
        class="qrcode"
      />
      <div class="box-info">
        <p><span class="label">名称：</span>{{ selectedBox?.vcName }}</p>
        <p><span class="label">有效期：</span>{{ formatExpireTime(selectedBox?.expireTime) }}</p>
      </div>
    </div>
  </van-dialog>
</template>

<script setup>
import { ref,onMounted } from 'vue'
import { Dialog as VanDialog } from 'vant'
import StudentAuth from '@/views/StudentAuth.vue';
import SubDIDCreate from '@/views/SubDIDCreate.vue';
import SubStudentAuth from '@/views/SubStudentAuth.vue';
import { 
  getAllDIDWithCredentials
} from '../db.js';
//父子组件传值变量定义
//申请子学生证：
const subDid = ref('')

// 响应式状态
const showDialog = ref(false)
const selectedBox = ref(null)
const qrContent = ref('')



const formatExpireTime = (timestamp) => {
  if (!timestamp) return '永久有效';
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
};

// 添加加载状态
const loading = ref(true);
const error = ref(null);
const cards = ref([{}]);
// 辅助函数：缩短DID显示
const shortDid = (did) => {
  return did ? `${did.slice(0, 6)}...${did.slice(-4)}` : ''
}
// 加载DID数据
const loadDIDData = async () => {
  try {
    const allDID = await getAllDIDWithCredentials()
    console.log("打印所有did数据：",allDID)
    cards.value = allDID.flatMap(root => [
      // 根DID卡片
      {
        rootdid: root.did,
        isRoot: true,
        boxes: root.credentials.map((c,index) => ({ 
          credential: c, //凭证内容,之后根据需要渲染
          vcName:root.vcName[index],
          expireTime:root.expireTime[index],
          logoImage:root.logo[index]
        })),
        rawData: root
      },
      // 子DID卡片
      ...root.subDIDs.map(sub => ({
        subdid: sub.did,
        isRoot: false,
        parentDid: root.did,
        usage: sub.usage,
        boxes: sub.credentials.map((c,index) => ({ 
          credential: c,
          vcName:sub.vcName[index],
          expireTime:sub.expireTime[index],
          logoImage:sub.logo[index]
        })),
        rawData: sub
      }))
    ])
  } catch (err) {
    error.value = `数据加载失败: ${err.message}`
    console.error('❌ DID加载错误:', err)
  } finally {
    loading.value = false
  }
}
// 初始化加载
// onMounted(loadDIDData)

onMounted(async()=>{
  await loadDIDData()
})
// 推荐在onMounted中获取数据
// onMounted(async () => {
//   try {
//     const allDID = await getAllDIDWithCredentials();
//     console.log('✅ DID数据加载完成');

//     // 基础日志
//     console.log('📦 原始数据结构:', allDID);

//     // 空数据校验
//     if (!allDID || allDID.length === 0) {
//       console.warn('⚠️ 数据库为空，请先创建DID');
//       return;
//     }

//     // 结构化日志输出
//     console.group('🌳 DID层级详情');
//     allDID.forEach((root, index) => {
//       console.groupCollapsed(`🏠 根DID #${index + 1}: ${root.did}`);
//       console.log('📅 创建时间:', new Date(root.createdAt).toLocaleString());
//       console.log('🔑 凭证数量:', root.credentials.length);
//       console.table(root.credentials.map((cred, i) => ({
//         '凭证索引': i + 1,
//         '类型': typeof cred,
//         '前20字符': cred.slice(0, 20) + '...'
//       })));

//       // 子DID详情
//       console.group(`子DID列表 (共${root.subDIDs.length}个)`);
//       root.subDIDs.forEach((sub, subIndex) => {
//         console.groupCollapsed(`🔸 子DID #${subIndex + 1}: ${sub.did}`);
//         console.log('🏷️ 用途:', sub.usage);
//         console.log('📅 创建时间:', new Date(sub.createdAt).toLocaleString());
//         console.log('🔑 凭证数量:', sub.credentials.length);
//         console.table(sub.credentials.map((cred, i) => ({
//           '凭证索引': i + 1,
//           '类型': typeof cred,
//           '前20字符': cred.slice(0, 20) + '...'
//         })));
//         console.groupEnd();
//       });
//       console.groupEnd();
//       console.groupEnd();
//     });
//     console.groupEnd();

//     // 统计信息
//     console.log(
//       '📊 系统统计:',
//       `根DID: ${allDID.length}个 |`,
//       `总子DID: ${allDID.reduce((sum, root) => sum + root.subDIDs.length, 0)}个 |`,
//       `总凭证: ${allDID.reduce((sum, root) => sum + root.credentials.length + 
//         root.subDIDs.reduce((s, sub) => s + sub.credentials.length, 0), 0)}个`
//     );

//   } catch (err) {
//     error.value = err.message;
//     console.error('❌ 数据加载失败:', err);
//   } finally {
//     loading.value = false;
//   }
// });


const subDidFormRef = ref(null);
const subAuthRef = ref(null)
const studentAuthRef = ref(null)
let pendingCardIndex = null
let selectedCard = null
// const cards = ref([{}]);
// const addCard = () => {
//   cards.value.push({});
// }


//新cards，每个card有一个box数组，每个cards内部可以再次添加对象属性
// const cards = ref([
//   { 
//     boxes: [
//       { name: "Instagram", icon: { viewBox: "0 0 30 30", path: "M 9.9980469 3 C 6.1390469 3 3 6.1419531 3 10.001953 L 3 20.001953 C 3 23.860953 6.1419531 27 10.001953 27 L 20.001953 27 C 23.860953 27 27 23.858047 27 19.998047 L 27 9.9980469 C 27 6.1390469 23.858047 3 19.998047 3 L 9.9980469 3 z M 22 7 C 22.552 7 23 7.448 23 8 C 23 8.552 22.552 9 22 9 C 21.448 9 21 8.552 21 8 C 21 7.448 21.448 7 22 7 z M 15 9 C 18.309 9 21 11.691 21 15 C 21 18.309 18.309 21 15 21 C 11.691 21 9 18.309 9 15 C 9 11.691 11.691 9 15 9 z M 15 11 A 4 4 0 0 0 11 15 A 4 4 0 0 0 15 19 A 4 4 0 0 0 19 15 A 4 4 0 0 0 15 11 z" } },
//       { name: "Twitter", icon: { viewBox: "0 0 512 512", path: "M459.37 151.716c..." } },
//       // { name: "Discord", icon: { viewBox: "0 0 640 512", path: "M524.531,69.836a1.5,1.5,0,0,0..." } }
// ] 
//   }
// ]);
//新addCard
// const addCard = () => {
//   cards.value.push({ boxes: [{ name: "Discord", icon: { viewBox: "0 0 640 512", path: "M524.531,69.836a1.5,1.5,0,0,0..." } }] });
// }

// // 给指定的 Card 增加一个 Box
// const addBox = (cardIndex) => {
//   cards.value[cardIndex].boxes.push({});
// }


// 点击处理
const handleClick = (box) => {
  selectedBox.value = box
  generateQRContent(box)
  showDialog.value = true
}

// 生成二维码内容
const generateQRContent = (box) => {
  qrContent.value = JSON.stringify({
    // credential: box.credential,
    vcName: box.vcName,
    expireTime: box.expireTime,
    timestamp: Date.now(),
    // 可以添加更多需要包含的信息
  }, null, 2)
}

// xkb
// 打开表单弹窗
const openSubAuthForm = (card) => {
  console.log("子学生证申请,子学生证明内容",card)
  subDid.value = card.subdid
  console.log("传递子did",subDid.value)
  // pendingCardIndex = cardIndex
  // console.log('pendingCardIndex:', pendingCardIndex)
  // console.log(subAuthRef.value.showSubStudentForm)
  subAuthRef.value.showSubStudentForm = true
  // console.log(subAuthRef.value.showSubStudentForm)
  // addBox(cardIndex)
}

//学生认证
const openStudentAuthForm = (card) => {
  selectedCard = card
  studentAuthRef.value.showStudentForm = true

}

const openSubForm = () => {
  subDidFormRef.value.showSubForm = true;//打开表单
}

// 处理表单提交成功
// 处理凭证添加成功
const handleSubAuthSuccess = async (submitted) => {
  console.log("子学生证申请结果：",submitted)
  if (submitted) {
    await loadDIDData() // 重新加载最新数据
  }
  selectedCard = null
}

// 处理DID创建
const handleDidCreate = async () => {
  await loadDIDData() // 重新加载包含新DID的数据
}
// 处理学生认证
const handleStudentAuth = async (studentAuthed) => {
  console.log("学生认证结果：",studentAuthed)

  await loadDIDData() // 重新加载包含新凭证的数据
}

</script>

<style scoped>
    /* 新增样式 */
    .card-header {
      position: absolute;
      top: 10px;
      left: 10px;
      z-index: 2;
      /* background: rgba(255, 255, 255, 0.9); */
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.8em;
    }

    .did-type {
    color: #fff;
    font-weight: 500;
    background: rgba(0, 0, 0, 0.25);
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 14px;
    backdrop-filter: blur(4px);
  }

    .did-id {
      font-family: monospace;
    }

    .add-box-btn {
  background-color: #00ffee;
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 2;
  padding: 6px 12px;
  border: none;
  border-radius: 8px; /* 圆角 */
  font-size: 14px;
  font-weight: bold;
  color: #003333; /* 深色字体提高可读性 */
  cursor: pointer;
  transition: all 0.3s ease-in-out;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1); /* 添加阴影 */
}

.add-box-btn:hover {
  background-color: #00ddcc;
  box-shadow: 0px 6px 8px rgba(0, 0, 0, 0.15);
  transform: scale(1.05); /* 悬浮时稍微放大 */
}

.add-box-btn:active {
  background-color: #00ccb8;
  box-shadow: 0px 3px 5px rgba(0, 0, 0, 0.2);
  transform: scale(0.98); /* 按下时稍微缩小 */
}


    .loading, .error {
      padding: 20px;
      text-align: center;
      color: #666;
    }

    .error {
      color: #ff4444;
    }
  .card-container {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 20px;
  }

  .card {
    position: relative;
    width: 100%;
    height: 220px;
    background: lightgrey;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
    transition: all 1s ease-in-out;
  }

  .background {
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 100% 107%, #ff89cc 0%, #9cb8ec 30%, #00ffee 60%, #62c2fe 100%);
  }

  .logo {
    position: absolute;
    right: 50%;
    bottom: 50%;
    transform: translate(50%, 50%);
    transition: all 0.6s ease-in-out;
  }

  .logo .logo-svg {
    fill: white;
    width: 30px;
    height: 30px;
  }

  .icon {
    display: inline-block;
    width: 20px;
    height: 20px;
  }

  .icon .svg {
    fill: rgba(255, 255, 255, 0.797);
    width: 100%;
    transition: all 0.5s ease-in-out;
  }

  .box {
    position: absolute;
    padding: 10px;
    text-align: right;
    background: rgba(255, 255, 255, 0.389);
    border-top: 2px solid rgb(255, 255, 255);
    border-right: 1px solid white;
    border-radius: 10% 13% 42% 0%/10% 12% 75% 0%;
    box-shadow: rgba(100, 100, 111, 0.364) -7px 7px 29px 0px;
    transform-origin: bottom left;
    transition: all 1s ease-in-out;
  }

  .box::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    opacity: 0;
    transition: all 0.5s ease-in-out;
  }

  .box:hover .svg {
    fill: white;
  }

  .box1 {
    width: 70%;
    height: 70%;
    bottom: -70%;
    left: -70%;
  }

  .box1::before {
    background: radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #ff53d4 60%, #62c2fe 90%);
  }

  .box1:hover::before {
    opacity: 1;
  }

  .box1:hover .icon .svg {
    filter: drop-shadow(0 0 5px white);
  }

  .box2 {
    width: 50%;
    height: 50%;
    bottom: -50%;
    left: -50%;
    transition-delay: 0.2s;
  }

  .box2::before {
    background: radial-gradient(circle at 30% 107%, #91e9ff 0%, #00ACEE 90%);
  }

  .box2:hover::before {
    opacity: 1;
  }

  .box2:hover .icon .svg {
    filter: drop-shadow(0 0 5px white);
  }

  .box3 {
    width: 30%;
    height: 30%;
    bottom: -30%;
    left: -30%;
    transition-delay: 0.4s;
  }

  .box3::before {
    background: radial-gradient(circle at 30% 107%, #969fff 0%, #b349ff 90%);
  }

  .box3:hover::before {
    opacity: 1;
  }

  .box3:hover .icon .svg {
    filter: drop-shadow(0 0 5px white);
  }

  .box4 {
    width: 10%;
    height: 10%;
    bottom: -10%;
    left: -10%;
    transition-delay: 0.6s;
  }

  .vc-name {
  font-size: 14px;
  font-weight: 600;
  font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
  color: #24A9B8;
  line-height: 1.2;
  display: -webkit-box;
  /* -webkit-line-clamp: 2; */
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.expire-time {
  font-size: 12px;
  font-family: Cambria, Cochin, Georgia, Times, 'Times New Roman', serif;
  color: #A4B4E9;
  font-weight: 300;
  position: relative;
  padding-left: 18px;
}

  .card:hover {
    transform: scale(1.1);
  }

  .card:hover .box {
    bottom: -1px;
    left: -1px;
  }

  .card:hover .logo {
    transform: translate(0, 0);
    bottom: 20px;
    right: 20px;
  }

  .add-card-btn {
    margin-top: 20px;
    padding: 10px 20px;
    background-color: #E594D3;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }

  .add-card-btn:hover {
    background-color: #E594D3;
  }


  /* 新增弹窗样式 */
.dialog-content {
  padding: 20px;
  text-align: center;
}

.qrcode {
  margin: 0 auto 15px;
  border: 1px solid #eee;
  padding: 10px;
  background: white;
}

.box-info {
  font-size: 14px;
  line-height: 1.6;
  padding: 0 15px;

  p {
    margin: 8px 0;
    display: flex;
    justify-content: space-between;
  }

  .label {
    color: #666;
    margin-right: 10px;
  }
}

:deep(.van-dialog) {
  width: 85%;
  border-radius: 12px;
  
  &__header {
    font-size: 18px;
    padding: 20px 0 15px;
    font-weight: 500;
  }
  
  &__content {
    padding-bottom: 20px;
  }
}
</style>
