// src/utils/form/normalizeDayjs.js
import dayjs from 'dayjs';

/**
 * 將後端傳回的 date（可能是數字、字串或 dayjs）統一轉成 dayjs 物件
 * @param {string|number|Date|dayjs.Dayjs|null|undefined} raw - 來源日期，例如 20250407、'2025-04-07'、dayjs()...
 * @returns {dayjs.Dayjs|null} - 正常化後的 dayjs 物件或 null
 */
const normalizeDayjs = raw => {
  if (!raw) return null;

  // number，例如 20250407
  if (typeof raw === 'number') {
    return dayjs(String(raw), 'YYYYMMDD');
  }

  // 字串 '20250407'
  if (typeof raw === 'string' && /^\d{8}$/.test(raw)) {
    return dayjs(raw, 'YYYYMMDD');
  }

  // 字串 '2025-04-07'
  if (typeof raw === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return dayjs(raw, 'YYYY-MM-DD');
  }

  // 若已經是 dayjs 物件
  if (dayjs.isDayjs(raw)) {
    return raw;
  }

  // Date 物件
  if (raw instanceof Date) {
    return dayjs(raw);
  }

  // 無法識別
  return null;
};

export default normalizeDayjs;
