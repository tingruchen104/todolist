/**
 * 預設的模糊搜尋邏輯
 * --------------------------------------------------
 * - 忽略大小寫
 * - 忽略首尾與中間空白（含全形空白）
 * - 支援中間字元比對
 * - 中文 / 英文皆可用
 */
const filterSelectOption = (input, option) => {
  // 🔹 處理輸入字串
  const keyword = normalize(input);
  if (!keyword) return true; // 空字串時不做過濾

  // 🔹 處理選項文字
  const label = normalize(option?.label ?? '');
  return label.includes(keyword);
};

/**
 * 移除所有空白（含全形空白）、轉小寫
 */
function normalize(str) {
  return str
    .toString()
    .replace(/[\s\u3000]+/g, '') // 移除半形與全形空白
    .toLowerCase()
    .trim();
}

export default filterSelectOption;
