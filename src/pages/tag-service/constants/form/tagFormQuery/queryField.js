/* --------------------------------------------
  標籤規則 - 欄位 Key 與型別定義
    - 用於組裝/讀取 標籤規則表單 payload 的固定欄位名稱
    - 用於顯示標籤規則表單欄位的標題
--------------------------------------------- */

/**
 * 標籤規則欄位 key
 */
export const QUERY_FIELD = {
  // ===== SQL =====
  QUERY_TYPE: 'queryType',
  QUERY_SQL: 'querySQL', // 傳時
  QUERY: 'query', // 取得時

  // ===== 匯入名單 =====
  IMPORT_FILE: 'importFile', // 虛擬
  FILE_ID: 'fileId',
  FILE: 'file'
};

/**
 * 標籤規則型別
 */
export const QUERY_TYPE = {
  QUERY_SQL: '0',
  IMPORT_FILE: '1',
  CONDITION: '2'
};

/**
 * 標籤規則型別對應的顯示文字
 */
export const QUERY_TYPE_LABELS = {
  [QUERY_TYPE.QUERY_SQL]: 'SQL',
  [QUERY_TYPE.IMPORT_FILE]: '匯入名單',
  [QUERY_TYPE.CONDITION]: '篩選器'
};

/**
 * 標籤規則選單資料
 */
export const QUERY_TYPE_OPTIONS = Object.entries(QUERY_TYPE_LABELS).map(([value, label]) => ({
  label,
  value
}));
