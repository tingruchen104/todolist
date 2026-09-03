/* --------------------------------------------
   標籤規則欄位
   - 標籤規則區塊的欄位名稱，取得與送出使用不同 key
--------------------------------------------- */
export const QUERY_FIELD = {
  QUERY_TYPE: 'queryType', // 規則類型，決定 SQL、匯入或篩選器區塊
  QUERY_SQL: 'querySQL', // 送出 SQL 使用的欄位
  QUERY: 'query', // 讀取既有標籤時回傳 SQL 的欄位

  IMPORT_FILE: 'importFile', // 僅存在於表單，不進 payload
  FILE_ID: 'fileId', // 已上傳檔案的識別碼
  FILE: 'file' // 送出時附帶的檔案內容
};

/* --------------------------------------------
   規則類型
   - 值為 wire format，程式命名調整不得變更
--------------------------------------------- */
export const QUERY_TYPE = {
  QUERY_SQL: '0', // SQL 規則
  IMPORT_FILE: '1', // csv／xlsx 匯入名單
  FILTER: '2' // 三層條件篩選器
};

/** 規則類型的顯示文案。 */
export const QUERY_TYPE_LABELS = {
  [QUERY_TYPE.QUERY_SQL]: 'SQL',
  [QUERY_TYPE.IMPORT_FILE]: '匯入名單',
  [QUERY_TYPE.FILTER]: '篩選器'
};

/** 規則類型選單資料，由 labels 衍生以避免兩處維護。 */
export const QUERY_TYPE_OPTIONS = Object.entries(QUERY_TYPE_LABELS).map(([value, label]) => ({
  label,
  value
}));
