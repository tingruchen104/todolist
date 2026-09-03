import api from '@/utils/http/request';

/**
 * 取得單一標籤設定（編輯/複製使用），初始表單資料
 * GET /api/tag-service/tags/{tag}
 */
export const getTagConfig = tagId => {
  return api.get(`/tag-service/tags/${tagId}`);
};

/**
 * 新增單一標籤設定（新增/複製使用）
 * POST /api/tag-service/tags
 */
export const createTag = data => {
  return api.post('/tag-service/tags', data);
};

/**
 * 更新單一標籤設定
 * POST /api/tag-service/tags/{tag}
 */
export const updateTag = (tagId, data) => {
  return api.post(`/tag-service/tags/${tagId}`, data);
};
