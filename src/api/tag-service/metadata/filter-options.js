import api from '@/utils/http/request';

/**
 * 取得篩選器後續選項
 * GET /api/tag-service/metadata/filter-options
 */
export const getFilterOptions = params => {
  return api.get('/tag-service/metadata/filter-options', { params });
};
