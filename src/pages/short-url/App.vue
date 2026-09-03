<template>
  <section class="min-h-screen max-w-screen">
    <ConfigProvider>
      <router-view />
      <LoadingOverlay v-if="loadingStore.isLoading" />
    </ConfigProvider>
  </section>
</template>

<script setup>
// Store
import { useLoadingStore } from '@/stores/loading';

// Components
import ConfigProvider from '@/components/shared/ConfigProvider';
import LoadingOverlay from '@/components/shared/loading/LoadingOverlay.vue';

const loadingStore = useLoadingStore();
</script>
