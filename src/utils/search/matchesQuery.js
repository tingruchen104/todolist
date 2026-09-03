import splitByQuery from '@/utils/search/splitByQuery';

/**
 * 文字是否命中關鍵字
 * - 比對規則與 splitByQuery 相同，忽略空白與大小寫
 * - 沒有關鍵字時回 false，要不要因此略過過濾由呼叫端決定
 *
 * @param {String} text - 要比對的文字
 * @param {String} query - 搜尋關鍵字
 * @returns {Boolean}
 */
const matchesQuery = (text, query) => splitByQuery(text, query).some(part => part.matched);

export default matchesQuery;
