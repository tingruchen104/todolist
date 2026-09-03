import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router';
import routes from '@/pages/short-url/router/routes';
import { shouldUseHashHistory } from '@/utils/urlHandler';

const BASE_PATH = '/c-backstage/short-url';

const router = createRouter({
  history:
    shouldUseHashHistory(window.location.href)
      ? createWebHashHistory(BASE_PATH)
      : createWebHistory(BASE_PATH),
  routes,
  scrollBehavior: () => ({ top: 0 })
});

router.afterEach(to => {
  document.title = to.meta.title || '短網址';
});

export default router;
