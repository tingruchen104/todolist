/* --------------------------------------------
  使用者資料 store
    - 保存目前登入者基本資訊（id/name/mail）
--------------------------------------------- */
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useUserStore = defineStore('user', () => {
  const userId = ref('');
  const userName = ref('');
  const userMail = ref('');

  /* 設定登入者資料（mail 依員編組出） */
  const setUser = (id, name) => {
    userId.value = id;
    userName.value = name;
    userMail.value = `${id}@104.com.tw`;
  };

  return {
    userId,
    userName,
    userMail,
    setUser
  };
});
