/* --------------------------------------------
   條件組合運算子
--------------------------------------------- */
/** API payload 使用的運算子值。 */
export const OPERATOR = {
  AND: 'and', // 同層條件全部成立
  OR: 'or' // 同層條件任一成立
};

/** 運算子選單的顯示文案。 */
export const OPERATOR_LABELS = {
  [OPERATOR.AND]: '全部',
  [OPERATOR.OR]: '任一'
};

/** 條件之間的連接文字。 */
export const OPERATOR_CONJUNCTIONS = {
  [OPERATOR.AND]: '且',
  [OPERATOR.OR]: '或'
};

/** 運算子選單資料。 */
export const OPERATOR_OPTIONS = Object.entries(OPERATOR_LABELS).map(([value, label]) => ({
  label,
  value
}));
