<template>
  <component :is="page" v-if="page" />
  <div v-else class="text-label p-6">找不到 prototype：{{ name }}</div>
</template>

<script setup>
import { computed, defineAsyncComponent, provide } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const name = computed(() => route.params.name);

// 讓 ?state=loading 等 query 設定各 prototype 的初始 viewState（深連結預覽用）。
// 各 prototype 以 inject('prototypeInitialState', 'normal') 讀取。
provide('prototypeInitialState', route.query.state || 'normal');

const pages = import.meta.glob('/prototypes/views/*/index.vue');

const page = computed(() => {
  const key = `/prototypes/views/${name.value}/index.vue`;
  return pages[key] ? defineAsyncComponent(pages[key]) : null;
});
</script>
