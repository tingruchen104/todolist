/* --------------------------------------------
  表單相關常數
    - 供 route、表單標題與表單邏輯共用
--------------------------------------------- */

/**
 * 表單模式 key
 */
export const FORM_MODE = {
  CREATE: 'create',
  EDIT: 'edit',
  CLONE: 'clone'
};

/**
 * 按鈕/操作文案
 */
export const FORM_MODE_LABELS = {
  [FORM_MODE.CREATE]: '新增',
  [FORM_MODE.EDIT]: '修改',
  [FORM_MODE.CLONE]: '新增'
};

/**
 * 表單標題文案
 */
export const FORM_MODE_TITLE = {
  [FORM_MODE.CREATE]: '新增',
  [FORM_MODE.EDIT]: '編輯',
  [FORM_MODE.CLONE]: '複製'
};
