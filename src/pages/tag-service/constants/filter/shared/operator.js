/* --------------------------------------------
  篩選器 - 運算子
    - 供篩選器運算子選項使用
--------------------------------------------- */

/**
 * 篩選器運算子欄位 key
 */
export const OPERATOR = {
  AND: 'and',
  OR: 'or'
};

/**
 * 篩選器運算子顯示文案
 */
export const OPERATOR_LABELS = {
  [OPERATOR.AND]: '全部',
  [OPERATOR.OR]: '任一'
};

/**
 * 篩選器運算子選單資料
 */
export const OPERATOR_OPTIONS = Object.entries(OPERATOR_LABELS).map(([value, label]) => ({
  label,
  value
}));
