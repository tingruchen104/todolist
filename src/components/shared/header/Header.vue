<template>
  <header class="bg-background border-base flex h-14.25 items-center justify-between border-b p-2">
    <div />
    <div class="flex items-center justify-end gap-4">
      <span class="text-label text-sm">{{ props.userName }}</span>
      <a-button v-variant="'primary'" @click="handleLogout">登出</a-button>
    </div>
  </header>
</template>

<script setup>
// Utils
import env from '@/utils/env';

const props = defineProps({
  /** 顯示於右上角的使用者名稱 */
  userName: {
    type: String,
    default: ''
  }
});

/* --------------------------------------------
   登出
   - 導向主站 logout，由主站清除登入狀態
--------------------------------------------- */
const handleLogout = () => {
  window.location.href = `${env.VUE_APP_DOMAIN_URL}logout`;
};
</script>
