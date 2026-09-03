import dayjs from 'dayjs';

/**
 * 將後端傳回的 date（可能是數字、字串或 dayjs）統一轉成 dayjs 物件
 * @param {string|number|Date|dayjs.Dayjs|null|undefined} value - 來源日期
 * @returns {dayjs.Dayjs|null} 正規化後的 dayjs 物件
 */
const normalizeDayjs = value => {
  if (!value) return null;

  if (typeof value === 'number') {
    return dayjs(String(value), 'YYYYMMDD');
  }

  if (typeof value === 'string' && /^\d{8}$/.test(value)) {
    return dayjs(value, 'YYYYMMDD');
  }

  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return dayjs(value, 'YYYY-MM-DD');
  }

  if (dayjs.isDayjs(value)) {
    return value;
  }

  if (value instanceof Date) {
    return dayjs(value);
  }

  return null;
};

export default normalizeDayjs;
