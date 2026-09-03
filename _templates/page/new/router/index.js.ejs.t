---
to: '<%= useRouter ? `src/pages/${workspace}/router/index.js` : null %>'
---
import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router';

// Utils
import { shouldUseHashHistory } from '@/utils/urlHandler';

import routes from './routes';

const router = createRouter({
  history: shouldUseHashHistory(window.location.href)
    ? createWebHashHistory('/<%= workspace %>')
    : createWebHistory('/<%= workspace %>'),
  routes,
  scrollBehavior: () => ({ top: 0 })
});

export default router;
