/* --------------------------------------------
   事件條件 payload 欄位
   - FilterEventItem 組裝事件條件，TagForm 送出前會移除僅供畫面串接使用的 TYPE
--------------------------------------------- */
/** 事件條件第一層欄位，值直接對應 API payload wire format。 */
export const EVENT_FILTER_FIELD = {
  TIME_RANGE: 'timeRange', // 事件條件的回溯時間範圍
  OCCURRED: 'occurred', // 是否曾發生該事件
  TYPE: 'type', // 僅供前端串接選單定位，送出前移除
  CATEGORY: 'category', // 事件分類代碼
  PARAMETER: 'parameter', // 事件參數條件群組
  COUNT: 'count' // 發生次數或彙總值的門檻條件
};

/** COUNT 節點內的計數門檻欄位，僅「發生」事件會送出。 */
export const EVENT_FILTER_COUNT_FIELD = {
  METRIC: 'metric', // 計數或彙總方式
  OPERATOR: 'operator', // 門檻比較運算子
  VALUE: 'value' // 門檻數值
};

/* --------------------------------------------
   事件 metadata 欄位與狀態
   - 對應 metadata/filter-options response，供事件類型、分類及計數選項使用
--------------------------------------------- */
/** metadata 事件節點的選項欄位。 */
export const EVENT_FILTER_OPTIONS_FIELD = {
  EVENTS: 'events', // type、category 與 parameter field 的階層選項
  TIME_RANGES: 'timeRanges', // timeRange 選項
  OCCURRED: 'occurred', // occurred 選項
  COUNT_METRICS: 'countMetrics', // count.metric 選項
  COUNT_OPERATORS: 'countOperators' // count.operator 選項
};

/** 發生狀態的 API wire value，決定是否顯示事件參數及 COUNT 條件。 */
export const EVENT_OCCURRED = {
  YES: 'true', // 顯示 parameter 與 count 條件
  NO: 'false' // 清除 parameter，count 送出 null
};
