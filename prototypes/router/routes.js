import PrototypeIndex from '../system/PrototypeIndex.vue';
import PrototypeWrapper from '../system/PrototypeWrapper.vue';

export default [
  { path: '/', component: PrototypeIndex, meta: { title: 'Prototype 列表' } },
  { path: '/:name', component: PrototypeWrapper }
];
