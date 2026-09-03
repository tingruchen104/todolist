import { defineStore } from 'pinia';

// Utils
import env from '@/utils/env';
import api from '@/utils/http/request';

// API
import { getFilterOptions } from '@/api/tag-service/metadata/filter-options';

// Constants
import { FIELD_COMPONENT_SOURCE } from '@/pages/tag-service/constants/tags/filter/shared/fieldComponentConfig';
import {
  FILTER_FIELD,
  FILTER_OPTIONS_FIELD
} from '@/pages/tag-service/constants/tags/filter/shared/filterField';

/** 同一欄位在不同 module 或 site 下須使用獨立快取。 */
const buildKey = ({
  module,
  [FILTER_FIELD.CATEGORY]: category,
  [FILTER_FIELD.FIELD]: field,
  site
}) =>
  site
    ? `${module}|${FILTER_FIELD.CATEGORY}:${category}|${FILTER_FIELD.FIELD}:${field}|site:${site}`
    : `${module}|${FILTER_FIELD.CATEGORY}:${category}|${FILTER_FIELD.FIELD}:${field}`;

/* --------------------------------------------
   篩選欄位選項
   - config 與動態 enum 分開快取並共用進行中的 request
   - reset 會遞增 requestId，使尚未完成的舊結果不得寫回
--------------------------------------------- */
export const useFilterOptionsStore = defineStore('filterOptions', {
  state: () => ({
    cache: {
      config: {},
      enum: {}
    },
    inflight: {
      config: {},
      enum: {}
    },
    _requestId: 0
  }),
  actions: {
    /** 取得欄位設定，並依 source 類型補上動態選項。 */
    async fetchFilterOptions(params, force = false) {
      const key = buildKey(params);

      if (this.cache.config[key] && !force) return this.cache.config[key];
      if (this.inflight.config[key]) return this.inflight.config[key];

      const requestId = this._requestId;
      const configPromise = getFilterOptions(params).then(async ({ data }) => {
        const normalizedData = { ...data };
        const sourceData = data?.[FILTER_OPTIONS_FIELD.SOURCE];

        if (sourceData) {
          const source = { ...sourceData };
          normalizedData[FILTER_OPTIONS_FIELD.SOURCE] = source;

          const options = await this.fetchSourceOptions(key, source, requestId);
          if (options !== null) source.enum = options;
        }

        if (requestId === this._requestId) {
          this.cache.config[key] = normalizedData;
        }

        return normalizedData;
      });

      this.inflight.config[key] = configPromise;

      try {
        return await configPromise;
      } finally {
        if (this.inflight.config[key] === configPromise) {
          delete this.inflight.config[key];
        }
      }
    },

    /** 共用相同欄位進行中的動態選項 request。 */
    async fetchSourceOptions(key, source, requestId) {
      if (this.cache.enum[key]) return this.cache.enum[key];
      if (this.inflight.enum[key]) return this.inflight.enum[key];

      let optionsPromise = null;

      if (
        source.type === FIELD_COMPONENT_SOURCE.CATEGORY &&
        source[FILTER_OPTIONS_FIELD.CATEGORY]
      ) {
        optionsPromise = this.fetchCategoryEnum(source[FILTER_OPTIONS_FIELD.CATEGORY]);
      } else if (source.type === FIELD_COMPONENT_SOURCE.API && source.api) {
        optionsPromise = this.fetchApiEnum(source.api);
      }

      if (!optionsPromise) return null;

      this.inflight.enum[key] = optionsPromise;

      try {
        const options = await optionsPromise;
        if (requestId === this._requestId) this.cache.enum[key] = options;
        return options;
      } finally {
        if (this.inflight.enum[key] === optionsPromise) {
          delete this.inflight.enum[key];
        }
      }
    },

    /** 將 category JSON 的巢狀節點攤平成 Select options。 */
    async fetchCategoryEnum(categoryName) {
      const url = `${env.VUE_APP_STATIC_URL}/category-tool/json/${categoryName}.json`;

      try {
        const response = await fetch(url);
        const rawList = await response.json();

        /** 將 category-tool 的 n 巢狀節點遞迴攤平成 Select options。 */
        const flatten = (nodes, options = []) => {
          nodes?.forEach(node => {
            if (node.no && node.des) options.push({ label: node.des, value: node.no });
            if (Array.isArray(node.n)) flatten(node.n, options);
          });
          return options;
        };

        return flatten(rawList);
      } catch {
        return [];
      }
    },

    /** 將 API 常見的 label／value 欄位正規化為 Select options。 */
    async fetchApiEnum(apiUrl) {
      try {
        const url = apiUrl.replace(/^\/api/, '');
        const response = await api.get(url);
        const list = response.data;

        return Array.isArray(list)
          ? list.map(item => ({
              label: item.label ?? item.des ?? item.text ?? item.name ?? item.value,
              value: item.value ?? item.no ?? item.id
            }))
          : [];
      } catch {
        return [];
      }
    },

    /** 清除設定、動態 enum 與進行中 request，並使舊 request 結果失效。 */
    reset() {
      this._requestId += 1;
      this.cache = { config: {}, enum: {} };
      this.inflight = { config: {}, enum: {} };
    }
  }
});
