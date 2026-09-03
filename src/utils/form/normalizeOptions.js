/**
 * 將 primitive 陣列轉換成選單使用的 `{ label, value }` 結構，兩者保留原始值與型別。
 *
 * @param {Array<string|number>} array - 選項原始值
 * @returns {Array<{label: string|number, value: string|number}>} Select options
 */
const normalizeOptions = array => {
  return array.map(item => ({
    label: item,
    value: item
  }));
};

export default normalizeOptions;
