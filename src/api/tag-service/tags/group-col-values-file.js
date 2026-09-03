import { message } from 'ant-design-vue';

// Utils
import api from '@/utils/http/request';
import downloadFileFromString from '@/utils/form/downloadFileFromString';

/**
 * 下載單一標籤名單檔案
 * GET /api/tag-service/tags/{tag}/group-col-values-file
 * - 僅在標籤狀態為可下載時由表單提供操作入口
 */
export const downloadGroupColValuesFile = async (tag, params) => {
  try {
    const response = await api.get(`/tag-service/tags/${tag}/group-col-values-file`, {
      params,
      responseType: 'blob'
    });

    downloadFileFromString(response);
  } catch (_error) {
    message.error('下載失敗');
  }
};
