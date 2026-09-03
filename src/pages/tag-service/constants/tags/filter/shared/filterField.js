/* --------------------------------------------
   篩選器 payload 欄位
   - 組裝與讀取篩選器 payload 的固定欄位名稱
   - 值為 wire format，不得因程式命名調整而變更
--------------------------------------------- */
export const FILTER_FIELD = {
  FILTER: 'filter', // metadata options 的篩選器節點
  CONDITION: 'condition', // 標籤 payload 中的篩選器內容
  CONDITIONS: 'conditions', // 同層條件陣列
  OPERATOR: 'operator', // 同層條件的組合方式
  MODULES: 'modules', // 模組陣列
  MODULE: 'module', // 單一模組代碼
  CATEGORY: 'category', // 欄位所屬分類
  FIELD: 'field', // 欄位代碼
  VALUE: 'value', // 單值欄位的值
  VALUES: 'values', // 多值欄位的值
  REFERENCED_TAGS: 'referencedTags' // 條件中引用到的標籤，送出前依條件重建
};

/* --------------------------------------------
   欄位設定 API 欄位
   - metadata/filter-options 回傳的欄位設定結構
--------------------------------------------- */
export const FILTER_OPTIONS_FIELD = {
  CATEGORY: 'category', // metadata 中的欄位分類
  FIELD: 'field', // metadata 中的欄位代碼
  OPERATORS: 'operators', // 該欄位可用的比較運算子
  COMPONENT: 'component', // 決定渲染哪個輸入元件
  SOURCE: 'source' // 選項來源（enum、api、category）
};

/** 單一層級的條件數量上限。 */
export const MAX_CONDITIONS = 10;
