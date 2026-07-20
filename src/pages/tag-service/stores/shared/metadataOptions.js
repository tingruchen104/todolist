/* --------------------------------------------
  整頁表單初始化 metadata store
    - 取得整頁表單初始化 metadata
    - 正規化 options 並補齊 filter[MODULE.ENTITY] 的 tags 節點
    - 以 loaded/_fetchPromise 避免重覆請求
--------------------------------------------- */
import { defineStore } from 'pinia';
import { getMetadataOptions } from '@/api/tag-service/metadata/options';
import normalizeOptions from '@/utils/form/normalizeOptions';
import {
  FORM_FIELD,
  FORM_FIELD_LABELS
} from '@/pages/tag-service/constants/form/tagForm/formField';
import { FILTER_FIELD } from '@/pages/tag-service/constants/filter/shared/filterField';
import { MODULE } from '@/pages/tag-service/constants/filter/module';

export const useMetadataOptionsStore = defineStore('metadataOptions', {
  state: () => ({
    metadataOptions: {}, // 儲存整理後的 metadata 選項
    loaded: false, // 是否已載入
    _fetchPromise: null // 暫存正在執行的 Promise，避免重複呼叫
  }),
  actions: {
    /* 取得 metadata options（含快取與請求去重） */
    async fetchMetadataOptions(force = false) {
      // 已載入且未強制更新 → 直接回傳快取
      if (this.loaded && !force) return this.metadataOptions;

      // 若已有請求進行中 → 共用同一 Promise
      if (this._fetchPromise && !force) return this._fetchPromise;

      // 建立新請求
      this._fetchPromise = (async () => {
        const { data } = await getMetadataOptions();
        const products = normalizeOptions(data[FORM_FIELD.PRODUCTS]) || [];
        const filter = { ...(data[FILTER_FIELD.FILTER] || {}) };

        // 插入標籤節點，children 對應各個 product
        const tagNode = {
          label: FORM_FIELD_LABELS[FORM_FIELD.TAGS],
          value: FORM_FIELD.TAGS,
          children: products.map(p => ({
            label: `${p.label} ${FORM_FIELD_LABELS[FORM_FIELD.TAGS]}`,
            value: p.value
          }))
        };

        // 若有 entity 陣列則 append，否則新建
        if (Array.isArray(filter[MODULE.ENTITY])) filter[MODULE.ENTITY].push(tagNode);
        else filter[MODULE.ENTITY] = [tagNode];

        // 整理最終資料並更新狀態
        this.metadataOptions = {
          ...data,
          [FORM_FIELD.PRODUCTS]: products,
          [FILTER_FIELD.FILTER]: filter
        };
        this.loaded = true;
        this._fetchPromise = null; // 清除暫存
        return this.metadataOptions;
      })();

      return this._fetchPromise;
    },

    /**
     * 清空所有快取（切頁或重新整理時呼叫）
     */
    reset() {
      this.metadataOptions = {};
      this.loaded = false;
      this._fetchPromise = null;
    }
  }
});
