import { message } from 'ant-design-vue';

// Utils
import api from '@/utils/http/request';
import downloadFileFromString from '@/utils/form/downloadFileFromString';

/**
 * 下載自訂名單檔案
 * GET /api/tag-service/tags/{tag}/file
 */
export const downloadFile = async (tag, params) => {
  try {
    const response = await api.get(`/tag-service/tags/${tag}/file`, {
      params,
      responseType: 'blob'
    });

    const contentType = response.headers?.['content-type'] || '';
    const extension =
      contentType.includes('spreadsheetml') || contentType.includes('excel') ? '.xlsx' : '.csv';
    downloadFileFromString(response, `tag_config_${tag}${extension}`);
  } catch (_error) {
    message.error('下載失敗');
  }
};
