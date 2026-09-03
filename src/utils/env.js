/* --------------------------------------------
   環境變數
   - 展開 Vite 的 import.meta.env，並補上各環境的 mode 名稱常數
   - mode 名稱用於與 import.meta.env.MODE 比對，判斷目前執行環境
--------------------------------------------- */
export default {
  ...import.meta.env,
  dev: 'development',
  lab: 'lab',
  staging: 'staging',
  prod: 'production'
};
