<template>
<router-view></router-view>
<van-tabbar v-model="active">
  <van-tabbar-item icon="home-o" to="/Notice">通知</van-tabbar-item>
  <van-tabbar-item icon="search">标签</van-tabbar-item>
  <van-tabbar-item icon="friends-o">标签</van-tabbar-item>
  <van-tabbar-item icon="setting-o" to="/Wallet">钱包</van-tabbar-item>
</van-tabbar>
</template>
<script setup>
import { ref } from 'vue';
const active = ref(0);
</script>