<template>
  <a-config-provider v-if="theme" :theme="theme" :locale="zhTW">
    <slot />
    <template #renderEmpty>
      <a-empty description="暫無資料" />
    </template>
  </a-config-provider>
</template>

<script setup>
/* --------------------------------------------
   套件與 locale 設定
--------------------------------------------- */
import { inject, ref, onMounted } from 'vue';
import zhTW from 'ant-design-vue/es/locale/zh_TW';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-tw';

dayjs.locale('zh-tw'); // 設定 dayjs 語系

/* --------------------------------------------
   Inject CSS 相關函式與資料
--------------------------------------------- */
const initialCSSVariables = inject('initialCSSVariables', () => {});
const cssVariables = inject('cssVariables', {});
const updateTokensFromCSS = inject('updateTokensFromCSS');

/* --------------------------------------------
   響應式主題資料
--------------------------------------------- */
const theme = ref(null);

/* --------------------------------------------
   初始化主題
--------------------------------------------- */
onMounted(() => {
  // 初始化 CSS Variables
  if (initialCSSVariables) {
    initialCSSVariables();
  }

  // 從 CSS 更新主題 token
  if (cssVariables && updateTokensFromCSS) {
    theme.value = updateTokensFromCSS(cssVariables);
  }

  // 若 theme 尚未設定，給空物件保底
  if (!theme.value) {
    theme.value = { token: {} };
  }
});
</script>
