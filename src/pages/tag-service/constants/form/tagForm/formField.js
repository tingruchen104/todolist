/* --------------------------------------------
  標籤設定 - 表單欄位 key / label 定義
    - 用於組裝/讀取 標籤設定表單 payload 的固定欄位名稱
    - 用於顯示標籤設定表單欄位的標題
--------------------------------------------- */

/**
 * 標籤設定表單欄位 key
 */
export const FORM_FIELD = {
  // ===== 標籤設定 =====
  EDITOR: 'editor',
  PRODUCT: 'product', // 傳時
  PRODUCTS: 'products', // 取得時
  SITE: 'site', // 傳時
  SITES: 'sites', // 取得時
  TAG: 'tag',
  TAG_NAME: 'tagName',
  DESCRIPTION: 'description',
  SCHEDULE: 'schedule',
  OWNER: 'owner',
  INDEX: 'index',
  GROUPS: 'groups',

  // ===== 其他 =====
  STATUS: 'status',
  TAGS: 'tags'
};

/**
 * 標籤設定表單欄位顯示文案
 */
export const FORM_FIELD_LABELS = {
  // ===== 標籤設定 =====
  [FORM_FIELD.TAG_NAME]: '中文名稱 tag_name',
  [FORM_FIELD.TAG]: '英文名稱 tag',
  [FORM_FIELD.DESCRIPTION]: '標籤敘述 description',
  [FORM_FIELD.SCHEDULE]: '更新設定 schedule',
  [FORM_FIELD.PRODUCT]: '標籤分類 product',
  [FORM_FIELD.SITE]: '標籤對象 site',
  [FORM_FIELD.INDEX]: '搜尋索引 index',
  [FORM_FIELD.GROUPS]: '同步設定 groups',
  [FORM_FIELD.TAGS]: '標籤'
};
