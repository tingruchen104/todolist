/* --------------------------------------------
  篩選器 - 事件條件欄位 key
    - 用於組裝/讀取 事件篩選條件 payload 的固定欄位名稱
--------------------------------------------- */

/**
 * 事件條件欄位 key
 */
export const EVENT_FILTER_FIELD = {
  TIME_RANGE: 'timeRange',
  OCCURRED: 'occurred',
  TYPE: 'type',
  CATEGORY: 'category',
  PARAMETER: 'parameter',
  COUNT: 'count'
};

export const EVENT_FILTER_COUNT_FIELD = {
  METRIC: 'metric',
  OPERATOR: 'operator',
  VALUE: 'value'
};

export const EVENT_FILTER_OPTIONS_FIELD = {
  EVENTS: 'events',
  TIME_RANGES: 'timeRanges',
  OCCURRED: 'occurred',
  COUNT_METRICS: 'countMetrics',
  COUNT_OPERATORS: 'countOperators'
};
