import env from '@/utils/env';
import api from '@/utils/http/request';
import { defineStore } from 'pinia';
import { getFilterOptions } from '@/api/tag-service/metadata/filter-options';
import { FIELD_COMPONENT_SOURCE } from '@/pages/tag-service/constants/filter/shared/fieldComponentConfig';
import {
  FILTER_FIELD,
  FILTER_OPTIONS_FIELD
} from '@/pages/tag-service/constants/filter/shared/filterField';

const buildKey = ({
  module,
  [FILTER_FIELD.CATEGORY]: category,
  [FILTER_FIELD.FIELD]: field,
  site
}) => {
  return site
    ? `${module}|${FILTER_FIELD.CATEGORY}:${category}|${FILTER_FIELD.FIELD}:${field}|site:${site}`
    : `${module}|${FILTER_FIELD.CATEGORY}:${category}|${FILTER_FIELD.FIELD}:${field}`;
};

export const useFilterOptionsStore = defineStore('filterOptions', {
  state: () => ({
    cache: {
      config: {},
      enum: {}
    },
    inflight: {
      config: {},
      enum: {}
    }
  }),
  actions: {
    async fetchFilterOptions(params, force = false) {
      const key = buildKey(params);

      if (this.cache.config[key] && !force) {
        return this.cache.config[key];
      }

      if (this.inflight.config[key]) {
        return this.inflight.config[key];
      }

      const configPromise = getFilterOptions(params)
        .then(async ({ data }) => {
          const source = data?.[FILTER_OPTIONS_FIELD.SOURCE];

          if (
            source?.type === FIELD_COMPONENT_SOURCE.CATEGORY &&
            source[FILTER_OPTIONS_FIELD.CATEGORY]
          ) {
            if (this.cache.enum[key]) {
              source.enum = this.cache.enum[key];
            } else if (this.inflight.enum[key]) {
              source.enum = await this.inflight.enum[key];
            } else {
              this.inflight.enum[key] = this.fetchCategoryEnum(
                source[FILTER_OPTIONS_FIELD.CATEGORY]
              );
              source.enum = await this.inflight.enum[key];
              this.cache.enum[key] = source.enum;
              delete this.inflight.enum[key];
            }
          } else if (source?.type === FIELD_COMPONENT_SOURCE.API && source.api) {
            if (this.cache.enum[key]) {
              source.enum = this.cache.enum[key];
            } else if (this.inflight.enum[key]) {
              source.enum = await this.inflight.enum[key];
            } else {
              this.inflight.enum[key] = this.fetchApiEnum(source.api).then(res => {
                this.cache.enum[key] = res;
                delete this.inflight.enum[key];
                return res;
              });
              source.enum = await this.inflight.enum[key];
            }
          }

          this.cache.config[key] = data;
          delete this.inflight.config[key];
          return data;
        })
        .catch(err => {
          delete this.inflight.config[key];
          throw err;
        });

      this.inflight.config[key] = configPromise;
      return configPromise;
    },

    async fetchCategoryEnum(categoryName) {
      const url = `${env.VUE_APP_STATIC_URL}/category-tool/json/${categoryName}.json`;
      try {
        const resp = await fetch(url);
        const rawList = await resp.json();

        const flatten = (nodes, arr = []) => {
          nodes?.forEach(node => {
            if (node.no && node.des) arr.push({ label: node.des, value: node.no });
            if (Array.isArray(node.n)) flatten(node.n, arr);
          });
          return arr;
        };

        return flatten(rawList);
      } catch {
        return [];
      }
    },

    async fetchApiEnum(apiUrl) {
      try {
        const cleanUrl = apiUrl.replace(/^\/api/, '');
        const resp = await api.get(cleanUrl);
        const list = await resp.data;
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

    reset() {
      this.cache = { config: {}, enum: {} };
      this.inflight = { config: {}, enum: {} };
    }
  }
});
