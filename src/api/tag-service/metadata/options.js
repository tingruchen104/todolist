import api from '@/utils/http/request';

/**
 * 取得標籤編輯頁基礎選項
 * GET /api/tag-service/metadata/options
 */
export const getMetadataOptions = () => {
  return api.get('/tag-service/metadata/options');
};
