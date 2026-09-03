/* --------------------------------------------
   標籤表單模式
   - 由 route name 決定，供 route、表單標題與送出流程共用
--------------------------------------------- */
/** 表單模式，值同時作為 route name 與網址片段。 */
export const FORM_MODE = {
  CREATE: 'create',
  EDIT: 'edit',
  CLONE: 'clone'
};

/** 送出按鈕與結果訊息使用的動作文案；複製視為新增。 */
export const FORM_MODE_LABELS = {
  [FORM_MODE.CREATE]: '新增',
  [FORM_MODE.EDIT]: '修改',
  [FORM_MODE.CLONE]: '新增'
};

/** 頁面標題使用的模式文案，需與動作文案分開。 */
export const FORM_MODE_TITLE = {
  [FORM_MODE.CREATE]: '新增',
  [FORM_MODE.EDIT]: '編輯',
  [FORM_MODE.CLONE]: '複製'
};
