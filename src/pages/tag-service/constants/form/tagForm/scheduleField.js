/* --------------------------------------------
  標籤設定 - 更新設定母子選單欄位相關選項常數
    - 根據更新設定主選單類型回傳對應的子選單選項
--------------------------------------------- */

/**
 * 更新設定母子選單欄位 key
 */
export const SCHEDULE_FIELD = {
  TYPE: 'type',
  DAYS: 'days'
};

/**
 * 更新設定主選單選項
 */
export const SCHEDULE_TYPE_OPTIONS = [
  { label: '每日更新', value: 'daily' },
  { label: '每週更新', value: 'weekly' },
  { label: '每月更新', value: 'monthly' }
];

/**
 * 每週子選單（週一～週日）
 */
export const getWeekDayOptions = () => [
  { label: '週一', value: 1 },
  { label: '週二', value: 2 },
  { label: '週三', value: 3 },
  { label: '週四', value: 4 },
  { label: '週五', value: 5 },
  { label: '週六', value: 6 },
  { label: '週日', value: 7 }
];

/**
 * 每月子選單（1 日～31 日）
 */
export const getMonthDayOptions = () =>
  Array.from({ length: 31 }, (_, index) => ({
    label: `${index + 1} 日`,
    value: index + 1
  }));

/**
 * 根據主選單回傳對應的子選單選項
 */
export const getScheduleDayOptions = type => {
  switch (type) {
    case 'weekly':
      return getWeekDayOptions();
    case 'monthly':
      return getMonthDayOptions();
    default:
      return [];
  }
};
