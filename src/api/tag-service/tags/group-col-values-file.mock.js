import { message } from 'ant-design-vue';

// Utils
import { api } from '@/utils/http/request';
import downloadFileFromString from '@/utils/form/downloadFileFromString';

/**
 * Mock - 模擬單一標籤名單下載失敗
 * GET /api/tag-service/tags/{tag}/group-col-values-file
 */
export const downloadGroupColValuesFile = async (tag, params) => {
  try {
    const response = await api.get(`/tag-service/tags/${tag}/group-col-values-file`, {
      params,
      response: {
        status: 500,
        data: {
          error: {
            code: 500,
            message: `GroupColValue 名單下載失敗: Tag API 404 unexpected response - [GET] /products/c/tags/${tag}/group-col-values-file : {"error":{"code":10108,"message":"標籤名單檔案不存在 (chunk) - Tag: ${tag}"}}`,
            details: []
          }
        }
      }
    });

    downloadFileFromString(response);
  } catch (_error) {
    message.error('下載失敗');
  }
};
