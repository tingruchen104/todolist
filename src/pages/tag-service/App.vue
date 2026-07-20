<template>
  <section class="min-h-screen max-w-screen">
    <Suspense>
      <ConfigProvider>
        <Header :user-name="userStore.userName" />
        <router-view />
        <FallowTooltip />
        <LoadingOverlay v-if="loadingStore.isLoading" />
      </ConfigProvider>
      <template #fallback>
        <LoadingOverlay />
      </template>
    </Suspense>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue';

// API
import { getUserTagProfile } from '@/api/user/profile';

// Store
import { useUserStore } from '@/pages/tag-service/stores/shared/user';
import { useLoadingStore } from '@/stores/loading';

// Components
import ConfigProvider from '@/components/shared/ConfigProvider';
import LoadingOverlay from '@/components/shared/loading/LoadingOverlay.vue';
import Header from '@/components/shared/header/Header.vue';
import FallowTooltip from '@/components/shared/tooltip/FallowTooltip.vue';

/* --------------------------------------------
   Store 與響應式資料
--------------------------------------------- */
const userStore = useUserStore();
const loadingStore = useLoadingStore();
const userInfo = ref(null);

onMounted(async () => {
  /* --------------------------------------------
   取得使用者資訊
  --------------------------------------------- */
  try {
    const { data } = await getUserTagProfile();
    userInfo.value = data;

    // 更新 User Store
    userStore.setUser(data.userId, data.userName);
  } catch (error) {
    console.error('取得使用者資訊失敗：', error);
  }
});
</script>
