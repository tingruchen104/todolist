import { defineStore } from 'pinia';

// Utils
import normalizeOptions from '@/utils/form/normalizeOptions';

// API
import { getMetadataOptions } from '@/api/tag-service/metadata/options';

// Constants
import {
  FORM_FIELD,
  FORM_FIELD_LABELS
} from '@/pages/tag-service/constants/tags/form/tagForm/formField';
import { FILTER_FIELD } from '@/pages/tag-service/constants/tags/filter/shared/filterField';
import { MODULE } from '@/pages/tag-service/constants/tags/filter/module';

/* --------------------------------------------
   表單 metadata
   - 標籤表單的所有選項來源，整頁只取一次
   - 會員資料選項需補上標籤節點，其 children 由 products 衍生
   - loaded 與 _fetchPromise 負責快取及 request 去重
   - reset 會遞增 requestId，使尚未完成的舊結果不得寫回
--------------------------------------------- */
export const useMetadataOptionsStore = defineStore('metadataOptions', {
  state: () => ({
    metadataOptions: {},
    loaded: false,
    _fetchPromise: null,
    _requestId: 0
  }),
  actions: {
    /** 取得並正規化 metadata；同一時間共用進行中的 request。 */
    async fetchMetadataOptions(force = false) {
      if (this.loaded && !force) return this.metadataOptions;
      if (this._fetchPromise && !force) return this._fetchPromise;

      const requestId = ++this._requestId;
      const fetchPromise = (async () => {
        const { data } = await getMetadataOptions();
        const products = normalizeOptions(data[FORM_FIELD.PRODUCTS]) || [];
        const filter = { ...(data[FILTER_FIELD.FILTER] || {}) };

        // 篩選器可用標籤作為條件，標籤節點的子項對應各個 product。
        const tagNode = {
          label: FORM_FIELD_LABELS[FORM_FIELD.TAGS],
          value: FORM_FIELD.TAGS,
          children: products.map(product => ({
            label: `${product.label} ${FORM_FIELD_LABELS[FORM_FIELD.TAGS]}`,
            value: product.value
          }))
        };

        filter[MODULE.ENTITY] = [
          ...(Array.isArray(filter[MODULE.ENTITY]) ? filter[MODULE.ENTITY] : []),
          tagNode
        ];

        // reset 後 requestId 已改變，舊 request 的結果不可寫回。
        if (requestId !== this._requestId) return this.metadataOptions;

        this.metadataOptions = {
          ...data,
          [FORM_FIELD.PRODUCTS]: products,
          [FILTER_FIELD.FILTER]: filter
        };
        this.loaded = true;
        return this.metadataOptions;
      })();

      this._fetchPromise = fetchPromise;

      try {
        return await fetchPromise;
      } finally {
        if (this._fetchPromise === fetchPromise) {
          this._fetchPromise = null;
        }
      }
    },

    /** 清除 metadata 與進行中 request，並使舊 request 結果失效。 */
    reset() {
      this.metadataOptions = {};
      this.loaded = false;
      this._fetchPromise = null;
      this._requestId += 1;
    }
  }
});
