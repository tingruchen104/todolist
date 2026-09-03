<template>
  <ProductLayout v-if="withLayout" />
  <RouterView v-else />
</template>

<script setup>
import { computed } from 'vue';
import { RouterView, useRoute } from 'vue-router';
import ProductLayout from '@/pages/short-url/App.vue';

const route = useRoute();
const withLayout = computed(() => route.path !== '/');
</script>
