import FlowDoc from '../system/FlowDoc.vue';
import PrototypeIndex from '../system/PrototypeIndex.vue';
import PrototypeWrapper from '../system/PrototypeWrapper.vue';

export default [
  { path: '/', component: PrototypeIndex, meta: { title: 'Prototype 列表' } },
  // 操作流程文件（放在 :name 之前優先比對；page-name 不可命名為 flow）
  { path: '/flow/:name', component: FlowDoc, meta: { title: 'Prototype 操作流程' } },
  { path: '/:name', component: PrototypeWrapper }
];
