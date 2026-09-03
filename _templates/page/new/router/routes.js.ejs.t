---
to: '<%= useRouter ? `src/pages/${workspace}/router/routes.js` : null %>'
---
const index = () => import('../views/Index.vue');

export default [
  {
    path: '/',
    name: 'index',
    component: index
  }
];
