/* --------------------------------------------
  會員資料與標籤篩選器 referenced tags store
    - 維護 referencedTags label map
    - 維護 usageMap 參照計數，避免過早清除
--------------------------------------------- */
import { defineStore } from 'pinia';

export const useReferencedTagsStore = defineStore('referencedTags', {
  state: () => ({
    referencedTags: {}, // { value: label }
    usageMap: {} // { value: count }
  }),
  actions: {
    /* 直接覆蓋 referenced tags（初始化/重建） */
    setReferencedTags(tags) {
      this.referencedTags = tags;
    },

    /* 新增參照：同步更新 label 與引用次數 */
    addReference(value, label) {
      if (label) this.referencedTags[value] = label;
      if (!this.usageMap[value]) {
        this.usageMap[value] = 0;
      }
      this.usageMap[value]++;
    },

    /* 移除參照：引用次數歸零時才清除資料 */
    removeReference(value) {
      if (this.usageMap[value]) {
        this.usageMap[value]--;
        if (this.usageMap[value] <= 0) {
          delete this.usageMap[value];
          delete this.referencedTags[value];
        }
      } else {
        delete this.referencedTags[value];
      }
    },

    /* 查詢當前引用次數 */
    getUsage(value) {
      return this.usageMap[value] || 0;
    },

    /**
     * 清空所有快取（切頁或重新整理時呼叫）
     */
    reset() {
      this.referencedTags = {};
      this.usageMap = {};
    }
  }
});
