import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useLoadingStore = defineStore('loading', () => {
  const isLoading = ref(false);
  let loadingCount = 0;

  // 延遲顯示時間(ms) → 100-150 最自然
  const delay = 100;

  let delayTimer = null;

  const show = () => {
    loadingCount++;

    // 已在 loading，不需再延遲
    if (isLoading.value) return;

    // 若已有 delay 計時器 → 無需重複
    if (delayTimer) return;

    // 延遲顯示
    delayTimer = setTimeout(() => {
      // 仍有 loadingCount → 才真的顯示
      if (loadingCount > 0) {
        isLoading.value = true;
      }
      delayTimer = null;
    }, delay);
  };

  const hide = () => {
    loadingCount = Math.max(loadingCount - 1, 0);

    // 若 loading 尚未顯示 → 清掉 delayTimer 即可
    if (!isLoading.value) {
      if (loadingCount === 0) {
        clearTimeout(delayTimer);
        delayTimer = null;
      }
      return;
    }

    // loading 已顯示 → 正常 hide
    if (loadingCount === 0) {
      setTimeout(() => {
        // 若期間又有 API 進來 → 不 hide
        if (loadingCount === 0) {
          isLoading.value = false;
        }
      }, 200);
    }
  };

  const reset = () => {
    loadingCount = 0;
    isLoading.value = false;
    clearTimeout(delayTimer);
    delayTimer = null;
  };

  return { isLoading, show, hide, reset };
});
