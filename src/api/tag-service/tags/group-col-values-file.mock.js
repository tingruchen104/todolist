import { api } from '@/utils/http/request';
import downloadFileFromString from '@/utils/form/downloadFileFromString';
import { message } from 'ant-design-vue';

/**
 * Mock - 下載單一標籤名單 Zip 檔案（可正常解壓縮）
 * GET /api/tag-service/tags/{tag}/group-col-values-file
 */
/**
 * Mock - 下載單一標籤名單 Zip 檔案
 * - 若 tag 名稱含有 'fail'，模擬 500 錯誤
 * - 否則回傳可正常解壓縮的 zip
 */
export const downloadGroupColValuesFile = async (tag, params) => {
  try {
    // 模擬「錯誤情境」
    const res = await api.get(`/tag-service/tags/${tag}/group-col-values-file`, {
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

    downloadFileFromString(res);
  } catch (_error) {
    message.error('下載失敗');
  }
};
