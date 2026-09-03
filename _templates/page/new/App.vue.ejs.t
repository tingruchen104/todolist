---
to: 'src/pages/<%=workspace%>/App.vue'
---
<template>
  <ConfigProvider>
    <router-view />
  </ConfigProvider>
</template>

<script setup>
import ConfigProvider from '@/components/shared/ConfigProvider.vue';
</script>
