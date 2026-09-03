/* --------------------------------------------
   篩選器模組
   - 篩選器的第一層，條件依模組分組後各自送出
--------------------------------------------- */
/** API payload 的 module 欄位值。 */
export const MODULE = {
  EVENT: 'event', // 事件資料條件
  ENTITY: 'entity' // 會員資料與標籤條件
};

/** 模組在畫面上的顯示名稱。 */
export const MODULE_LABELS = {
  [MODULE.EVENT]: '事件資料',
  [MODULE.ENTITY]: '會員資料與標籤'
};

/** 模組選單資料，由 labels 衍生以避免兩處維護。 */
export const MODULE_OPTIONS = Object.entries(MODULE_LABELS).map(([value, label]) => ({
  label,
  value
}));
