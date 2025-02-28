<template>
  <div class="app">
    <van-button type="primary" @click="addCardGroup">添加卡片组</van-button>

    <div v-for="(cardGroup, index) in cardGroups" :key="index" class="card-group">
      <h3>卡片组 {{ index + 1 }}</h3>
      <van-button size="small" @click="addCard(index)">添加卡片</van-button>
      
      <div v-for="(card, cardIndex) in cardGroup.cards" :key="cardIndex" class="card">
        <van-card
          :title="card.title"
          :desc="card.desc"
          :thumb="card.thumb"
        ></van-card>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { Button, Card } from 'vant';  // 使用按需导入

export default {
  components: {
    'van-button': Button,  // 注册组件
    'van-card': Card
  },
  setup() {
    const cardGroups = ref([]);

    const addCardGroup = () => {
      cardGroups.value.push({
        cards: []
      });
    };

    const addCard = (groupIndex) => {
      const newCard = {
        title: `卡片标题 ${cardGroups.value[groupIndex].cards.length + 1}`,
        desc: `这是第 ${cardGroups.value[groupIndex].cards.length + 1} 张卡片的描述`,
        thumb: 'https://img01.yzcdn.cn/vant/cat.jpeg',
      };
      cardGroups.value[groupIndex].cards.push(newCard);
    };

    return {
      cardGroups,
      addCardGroup,
      addCard
    };
  }
};
</script>
