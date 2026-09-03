import { message } from 'ant-design-vue';

// Utils
import { api } from '@/utils/http/request';
import downloadFileFromString from '@/utils/form/downloadFileFromString';

/**
 * Mock - 下載自訂名單檔案
 * GET /api/tag-service/tags/{tag}/file
 */
export const downloadFile = async (tag, params) => {
  try {
    const mockContent = `1.67778E+12
1.6872E+12
1.68885E+12`;

    const response = await api.get(`/tag-service/tags/${tag}/file`, {
      params,
      response: {
        data: mockContent,
        headers: {
          'content-type': 'text/csv;charset=utf-8',
          'content-disposition': `attachment; filename="tag_config.csv"`
        },
        metadata: {}
      }
    });

    downloadFileFromString(response, `tag_config_${tag}.csv`);
  } catch (_error) {
    message.error('下載失敗');
  }
};
