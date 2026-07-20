/* --------------------------------------------
  業務錯誤碼
    - 供表單驗證與錯誤提示共用
--------------------------------------------- */

/**
 * 錯誤碼 key
 */
export const ERROR_CODE = {
  TAG_NAME_DUPLICATE: 10105,
  TAG_DUPLICATE: 10101
};

/**
 * 錯誤碼對應訊息
 */
export const ERROR_MESSAGE = {
  [ERROR_CODE.TAG_NAME_DUPLICATE]: '命名重複，請重新命名',
  [ERROR_CODE.TAG_DUPLICATE]: '命名重複，請重新命名'
};
