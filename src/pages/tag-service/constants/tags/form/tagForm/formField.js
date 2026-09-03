/* --------------------------------------------
   標籤設定欄位
   - 組裝與讀取標籤設定 payload 的固定欄位名稱
   - 值為 wire format，不得因程式命名調整而變更
--------------------------------------------- */
export const FORM_FIELD = {
  EDITOR: 'editor', // 送出與下載操作的執行者
  PRODUCT: 'product', // 送出時的單值欄位
  PRODUCTS: 'products', // metadata options 回傳的選項清單
  SITE: 'site', // 送出時的單值欄位
  SITES: 'sites', // metadata options 回傳的選項清單
  TAG: 'tag', // 標籤英文代碼與 API path 識別值
  TAG_NAME: 'tagName', // 標籤中文名稱
  DESCRIPTION: 'description', // 標籤敘述
  SCHEDULE: 'schedule', // 更新頻率的 type／days 巢狀節點
  OWNER: 'owner', // 編輯沿用原 owner，新增／複製使用目前登入者
  INDEX: 'index', // 依 site 限制的搜尋索引
  GROUPS: 'groups', // 同步群組，送出時使用 groups[]

  // 僅由既有標籤的讀取結果使用，不在新增流程出現
  STATUS: 'status', // 決定名單是否可下載
  TAGS: 'tags' // metadata 篩選器中動態補入的標籤分類節點
};

/* --------------------------------------------
   欄位顯示文案
   - 表單欄位標題，同時作為篩選器標籤節點的名稱來源
--------------------------------------------- */
export const FORM_FIELD_LABELS = {
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
