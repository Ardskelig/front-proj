<template>
<van-radio-group v-model="checked">
  <van-cell-group inset>
    <van-cell title="访客注册" clickable @click="router.push('/VisitorRegister')">
    </van-cell>
    <van-cell title="学生注册" clickable @click="router.push('/StudentRegister')">
    </van-cell>
  </van-cell-group>
</van-radio-group>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router'
const router = useRouter();


</script>