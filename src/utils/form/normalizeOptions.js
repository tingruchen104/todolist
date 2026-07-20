/**
 * 將陣列轉換為 { label, value } 格式
 */
const normalizeOptions = array => {
  return array.map(item => ({
    label: item,
    value: item
  }));
};

export default normalizeOptions;
