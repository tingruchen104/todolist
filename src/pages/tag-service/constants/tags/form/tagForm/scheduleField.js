/* --------------------------------------------
   更新頻率欄位與選項
--------------------------------------------- */
export const SCHEDULE_FIELD = {
  TYPE: 'type', // daily／weekly／monthly 更新類型
  DAYS: 'days' // weekly 使用星期，monthly 使用日期；daily 不送出
};

/** 更新類型的第一層選項，第二層由 getScheduleDayOptions 依類型產生。 */
export const SCHEDULE_TYPE_OPTIONS = [
  { label: '每日更新', value: 'daily' },
  { label: '每週更新', value: 'weekly' },
  { label: '每月更新', value: 'monthly' }
];

/** 建立週一至週日的選項。 */
export const getWeekDayOptions = () => [
  { label: '週一', value: 1 },
  { label: '週二', value: 2 },
  { label: '週三', value: 3 },
  { label: '週四', value: 4 },
  { label: '週五', value: 5 },
  { label: '週六', value: 6 },
  { label: '週日', value: 7 }
];

/** 建立每月 1 日至 31 日的選項。 */
export const getMonthDayOptions = () =>
  Array.from({ length: 31 }, (_, index) => ({
    label: `${index + 1} 日`,
    value: index + 1
  }));

/** 依排程類型取得第二層日期選項。 */
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
