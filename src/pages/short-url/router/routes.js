const index = () => import('@/pages/short-url/views/Index.vue');

export default [
  {
    path: '/',
    name: 'index',
    component: index,
    meta: { title: '短網址' }
  }
];
