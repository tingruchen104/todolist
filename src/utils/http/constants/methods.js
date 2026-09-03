/* --------------------------------------------
   HTTP 方法常數
--------------------------------------------- */
export const HTTP_METHOD_ENUM = {
  Get: 'get', // query params，不帶 request body
  Post: 'post', // 建立或執行動作的 request body
  Put: 'put', // 完整更新 request body
  Patch: 'patch', // 局部更新 request body
  Delete: 'delete' // 刪除條件以 query params 傳入
};
