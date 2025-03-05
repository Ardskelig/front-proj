<template>
  <div>
    <div class="button-group">
      <van-button type="primary" @click="showStudentForm = true" icon="idcard">学生认证</van-button>
      <van-button type="success" @click="showSubForm = true" icon="add-o">创建子DID</van-button>
      <van-button type="warning" @click="showSubStudentForm = true" icon="certificate">申请子学生证</van-button>
    </div>

    <StudentAuth v-model:show="showStudentForm" />
    <SubDIDCreate v-model:show="showSubForm" />
    <SubStudentAuth v-model:show="showSubStudentForm" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import StudentAuth from '@/views/StudentAuth.vue';
import SubDIDCreate from '@/views/SubDIDCreate.vue';
import SubStudentAuth from '@/views/SubStudentAuth.vue';

const showStudentForm = ref(false);
const showSubForm = ref(false);
const showSubStudentForm = ref(false);
</script>

<style scoped>
/* 样式部分 */
</style>
