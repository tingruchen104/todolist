import matchesQuery from '@/utils/search/matchesQuery';

/**
 * a-select 的預設模糊搜尋
 * - 比對規則見 matchesQuery：忽略大小寫與空白，支援中間字元比對
 * - 關鍵字為空時不過濾
 *
 * @param {String} input - 搜尋關鍵字
 * @param {Object} option - 選項，取其 label 比對
 * @returns {Boolean}
 */
const filterSelectOption = (input, option) => {
  if (!String(input ?? '').trim()) return true;

  return matchesQuery(option?.label ?? '', input);
};

export default filterSelectOption;
