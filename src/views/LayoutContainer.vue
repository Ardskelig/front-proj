<template>
  <van-nav-bar :title="pageTitle" fixed="true" placeholder="true" class="header"/>
  <router-view />
  <van-tabbar v-model="active">
    <button class="animated-button" @click="goToNotifications">
      <span class="text">通知</span>
      <span class="circle"></span>
    </button>
    <van-tabbar-item icon="scan" @click="goToScan">扫描</van-tabbar-item>
     
    <button class="animated-button" @click="goToWallet">
      <span class="text">钱包</span>
      <span class="circle"></span>
    </button>
  </van-tabbar>
  
</template>

<script setup>
import { ref } from 'vue';
import { useRoute, useRouter} from 'vue-router'
import { computed } from 'vue'
const route = useRoute()
const active = ref(0);
const router=useRouter();

// 动态计算页面标题
const pageTitle = computed(() => {
  // 获取当前路由的元信息中的title
  const matchedRoute = route.matched.find(r => r.meta?.title)
  return matchedRoute?.meta.title || '默认标题'
})


const goToNotifications = () => {
  router.push('/Notice')
};

const goToScan = () => {
  console.log('Navigating to Scan');
  router.push('/qr-scanner')
};

const goToWallet = () => {
  router.push('/Wallet')
};
</script>

<style scoped>
/* From Uiverse.io by ryota1231 */ 
.animated-button {
  margin: 5px;
  position: relative;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 10px 50px;
  border: 4px solid;
  border-color: transparent;
  font-size: 16px;
  background-color:white ;
  border-radius: 100px;
  font-weight: 600;
  color: #1f387e;
  box-shadow: 0 0 0 2px #ffffff;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
}

.animated-button svg {
  position: absolute;
  width: 24px;
  fill: #1f387e;
  z-index: 9;
  transition: all 0.8s cubic-bezier(0.23, 1, 0.32, 1);
}

.animated-button .arr-1 {
  right: 16px;
}

.animated-button .arr-2 {
  left: -25%;
}

.animated-button .circle {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 20px;
  height: 20px;
  background-color: #ECF9FF;
  border-radius: 50%;
  opacity: 0;
  transition: all 0.8s cubic-bezier(0.23, 1, 0.32, 1);
}

.animated-button .text {
  position: relative;
  z-index: 1;
  transform: translateX(-12px);
  transition: all 0.8s cubic-bezier(0.23, 1, 0.32, 1);
}

.animated-button:hover {
  box-shadow: 0 0 0 12px transparent;
  color: #212121;
  border-radius: 12px;
}

.animated-button:hover .arr-1 {
  right: -25%;
}

.animated-button:hover .arr-2 {
  left: 16px;
}

.animated-button:hover .text {
  transform: translateX(0px);
}

.animated-button:hover svg {
  fill: #1f387e;
}

.animated-button:active {
  scale: 0.95;
  box-shadow: 0 0 0 4px#AEEBFE;
}

.animated-button:hover .circle {
  width: 220px;
  height: 220px;
  opacity: 1;
}

.header {
  /* 固定定位让导航栏脱离文档流 */
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000; /* 设置较高层级确保在最前 */
  background: white; /* 可选：添加背景色避免透明穿透 */
  box-shadow: 0 2px 4px rgba(0,0,0,0.1); /* 可选：添加阴影增强层次感 */
}

/* 给后续内容区域添加顶部内边距，防止内容被遮挡 */
.content {
  padding-top: 60px; /* 值 = 导航栏高度 + 适当间距 */
  position: relative; /* 创建新的层叠上下文 */
  z-index: 1; /* 确保内容在默认层级 */
}



</style>
