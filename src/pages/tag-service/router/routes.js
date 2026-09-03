import { FORM_MODE, FORM_MODE_TITLE } from '@/pages/tag-service/constants/tags/form/formMode';
const TagIndex = () => import('@/pages/tag-service/views/tags/Index.vue');

export default [
  {
    path: `/tags/${FORM_MODE.CREATE}`,
    name: FORM_MODE.CREATE,
    component: TagIndex,
    meta: { title: `標籤 2.0｜${FORM_MODE_TITLE[FORM_MODE.CREATE]}` }
  },
  {
    path: `/tags/:tag/${FORM_MODE.CLONE}`,
    name: FORM_MODE.CLONE,
    component: TagIndex,
    meta: { title: `標籤 2.0｜${FORM_MODE_TITLE[FORM_MODE.CLONE]}` }
  },
  {
    path: `/tags/:tag/${FORM_MODE.EDIT}`,
    name: FORM_MODE.EDIT,
    component: TagIndex,
    meta: { title: `標籤 2.0｜${FORM_MODE_TITLE[FORM_MODE.EDIT]}` }
  }
];
