import { defineStore } from 'pinia';
import { ref } from 'vue';

// 短 request 不顯示，連續 request 之間也保留緩衝，避免 loading 閃爍。
const SHOW_DELAY = 100;
const HIDE_DELAY = 200;

export const useLoadingStore = defineStore('loading', () => {
  const isLoading = ref(false);
  /** 同時進行的 request 全部完成後才隱藏 loading。 */
  let loadingCount = 0;
  let showTimer = null;
  let hideTimer = null;

  /** request 開始時累加計數，延遲顯示以避免短 request 造成閃爍。 */
  const show = () => {
    loadingCount++;
    clearTimeout(hideTimer);
    hideTimer = null;

    if (isLoading.value) return;
    if (showTimer) return;

    showTimer = setTimeout(() => {
      if (loadingCount > 0) {
        isLoading.value = true;
      }
      showTimer = null;
    }, SHOW_DELAY);
  };

  /** request 完成時遞減計數，全部完成後保留短暫緩衝再隱藏。 */
  const hide = () => {
    loadingCount = Math.max(loadingCount - 1, 0);

    if (!isLoading.value) {
      if (loadingCount === 0) {
        clearTimeout(showTimer);
        showTimer = null;
      }
      return;
    }

    if (loadingCount === 0) {
      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => {
        if (loadingCount === 0) {
          isLoading.value = false;
        }
        hideTimer = null;
      }, HIDE_DELAY);
    }
  };

  /** 強制清除 request 計數、loading 狀態與所有 timer。 */
  const reset = () => {
    loadingCount = 0;
    isLoading.value = false;
    clearTimeout(showTimer);
    clearTimeout(hideTimer);
    showTimer = null;
    hideTimer = null;
  };

  return { isLoading, show, hide, reset };
});
