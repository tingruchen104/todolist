<template>
  <!-- 全站 antdv 設定，theme 由 CSS variables 換算後才渲染內容 -->
  <a-config-provider v-if="theme" :theme="theme" :locale="zhTW">
    <slot />
    <template #renderEmpty>
      <a-empty description="暫無資料" />
    </template>
  </a-config-provider>
</template>

<script setup>
import { inject, ref, onMounted } from 'vue';
import zhTW from 'ant-design-vue/es/locale/zh_TW';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-tw';

dayjs.locale('zh-tw');

/* --------------------------------------------
   主題設定
   - CSS variables 需等 DOM mounted 後才能取得 computed value
   - 取值失敗時使用空 token，避免阻擋整個 app 渲染
--------------------------------------------- */
const initialCSSVariables = inject('initialCSSVariables', () => {});
const cssVariables = inject('cssVariables', {});
const updateTokensFromCSS = inject('updateTokensFromCSS');

const theme = ref(null);

onMounted(() => {
  if (initialCSSVariables) {
    initialCSSVariables();
  }

  if (cssVariables && updateTokensFromCSS) {
    theme.value = updateTokensFromCSS(cssVariables);
  }

  if (!theme.value) {
    theme.value = { token: {} };
  }
});
</script>
