<template>
  <van-nav-bar :title="pageTitle" fixed="true" placeholder="true"/>
  <router-view />
  <!-- <van-tabbar v-model="active">
    <button class="animated-button" @click="goToNotifications">
      <span class="text">通知</span>
      <span class="circle"></span>
    </button>
    <van-tabbar-item icon="scan" @click="goToScan">扫描</van-tabbar-item>
     
    <button class="animated-button" @click="goToWallet">
      <span class="text">钱包</span>
      <span class="circle"></span>
    </button>
  </van-tabbar> -->
  <van-tabbar v-model="active">
  <van-tabbar-item name="notice" icon="comment-o" @click="goToNotifications">通知</van-tabbar-item>
  <van-tabbar-item icon="scan" @click="goToScan">扫描</van-tabbar-item>
  <!-- <van-tabbar-item name="friends" icon="friends-o">标签</van-tabbar-item> -->
  <van-tabbar-item name="wallet" icon="ecard-pay" @click="goToWallet">钱包</van-tabbar-item>
</van-tabbar> 

  
</template>

<script setup>
import { ref } from 'vue';
import { useRoute, useRouter} from 'vue-router'
import { computed } from 'vue'
const route = useRoute()
const active = ref("notice");
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

<style>
/* 全局样式或非scoped样式 */
:root {
  /* 导航栏整体 */
  /* --van-nav-bar-z-index:10000 */
  --van-nav-bar-z-index: 10000;
  --van-nav-bar-height: 60px;
  --van-nav-bar-background: #ffffff;
  --van-nav-bar-title-font-size: 18px;
  
  /* 文字颜色 */
  --van-nav-bar-title-text-color: #000000;
  --van-nav-bar-text-color: #000000;
  
  /* 图标颜色 */
  --van-nav-bar-icon-color: #ffffff;
  
  /* 悬停效果 */
  --van-nav-bar-icon-active-color: rgba(255,255,255,0.6);
}

</style>
