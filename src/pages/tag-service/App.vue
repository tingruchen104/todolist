<template>
  <!-- 全站框架：登入者頁首、路由頁面、共用 tooltip 與 request loading -->
  <section class="min-h-screen max-w-screen">
    <Suspense>
      <ConfigProvider>
        <Header :user-name="userStore.userName" />
        <router-view />
        <FollowTooltip />
        <LoadingOverlay v-if="loadingStore.isLoading" />
      </ConfigProvider>
      <!-- 非同步頁面尚未完成 setup 時顯示全頁 loading -->
      <template #fallback>
        <LoadingOverlay />
      </template>
    </Suspense>
  </section>
</template>

<script setup>
import { onMounted } from 'vue';

// Components
import ConfigProvider from '@/components/shared/ConfigProvider';
import LoadingOverlay from '@/components/shared/loading/LoadingOverlay.vue';
import Header from '@/components/shared/header/Header.vue';
import FollowTooltip from '@/components/shared/tooltip/FollowTooltip.vue';

// Store
import { useUserStore } from '@/pages/tag-service/stores/shared/user';
import { useLoadingStore } from '@/stores/loading';

// API
import { getUserTagProfile } from '@/api/user/profile';

/* --------------------------------------------
   載入登入者資料
--------------------------------------------- */
const userStore = useUserStore();
const loadingStore = useLoadingStore();

/** 進入 tag-service 時取得目前使用者，供頁首與 API 操作者欄位使用。 */
const fetchUserProfile = async () => {
  try {
    const { data } = await getUserTagProfile();
    userStore.setUser(data.userId, data.userName);
  } catch (error) {
    console.error('取得使用者資訊失敗：', error);
  }
};

onMounted(fetchUserProfile);
</script>
