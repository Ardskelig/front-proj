<template>
  <router-view />
  <van-tabbar v-model="active">
    <button class="animated-button" @click="goToNotifications">
      <span class="text">通知</span>
      <span class="circle"></span>
    </button>
    <van-tabbar-item icon="scan">扫描</van-tabbar-item>
     
    <button class="animated-button" @click="goToWallet">
      <span class="text">钱包</span>
      <span class="circle"></span>
    </button>
  </van-tabbar>
  
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
const active = ref(0);
const router=useRouter();

const goToNotifications = () => {
  router.push('/Notice')
};

const goToScan = () => {
  console.log('Navigating to Scan');
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





</style>
