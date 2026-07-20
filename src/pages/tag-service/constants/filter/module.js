/* --------------------------------------------
  篩選器 - 模組定義
    - 供篩選器模組分類使用
--------------------------------------------- */

/**
 * 篩選器模組欄位 key
 */
export const MODULE = {
  EVENT: 'event',
  ENTITY: 'entity'
};

/**
 * 篩選器模組顯示文案
 */
export const MODULE_LABELS = {
  [MODULE.EVENT]: '事件資料',
  [MODULE.ENTITY]: '會員資料與標籤'
};

/**
 * 篩選器模組選單資料
 */
export const MODULE_OPTIONS = Object.entries(MODULE_LABELS).map(([value, label]) => ({
  label,
  value
}));
