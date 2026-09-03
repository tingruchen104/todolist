/* --------------------------------------------
   標籤表單錯誤
   - 後端回傳的業務錯誤碼與對應的欄位提示文案
--------------------------------------------- */
/** 後端業務錯誤碼，值由 API 決定。 */
export const ERROR_CODE = {
  TAG_NAME_DUPLICATE: 10105, // 中文名稱 tagName 重複
  TAG_DUPLICATE: 10101 // 英文名稱 tag 重複
};

/** 錯誤碼對應的欄位提示文案。 */
export const ERROR_MESSAGE = {
  [ERROR_CODE.TAG_NAME_DUPLICATE]: '命名重複，請重新命名',
  [ERROR_CODE.TAG_DUPLICATE]: '命名重複，請重新命名'
};
