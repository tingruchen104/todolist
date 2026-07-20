/**
 * 在陣列中根據 key/value 找出符合的物件
 * @param {Array} list - 要搜尋的陣列
 * @param {string} key - 欲比對的欄位名稱
 * @param {*} value - 欲比對的值
 * @returns {Object|null} 找到的物件或 null
 */
const findObjectByKey = (list, key, value) => {
  if (!Array.isArray(list)) return null;
  return list.find(item => item?.[key] === value) ?? null;
};

export default findObjectByKey;
