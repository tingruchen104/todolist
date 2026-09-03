import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router';
import routes from '@/pages/tag-service/router/routes';
import { shouldUseHashHistory } from '@/utils/urlHandler';

/* --------------------------------------------
   Router history 與頁面標題
   - 本機開發、preview 與 CDN 使用 hash history，一般站台路徑使用 web history
   - 每次導頁以 route meta 更新 title，未設定時使用標籤服務預設名稱
--------------------------------------------- */
const router = createRouter({
  history: shouldUseHashHistory(window.location.href)
    ? createWebHashHistory('/tag-service')
    : createWebHistory('/tag-service'),
  routes,
  scrollBehavior: () => ({ top: 0 })
});

router.afterEach(to => {
  document.title = to.meta.title || '標籤 2.0';
});

export default router;
