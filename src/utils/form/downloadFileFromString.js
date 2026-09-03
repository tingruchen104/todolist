import { message } from 'ant-design-vue';

/**
 * 通用下載工具
 * - 支援 axios response / Blob / 字串 / ArrayBuffer
 * - 自動解析 Content-Disposition 檔名與 MIME type
 * - 顯示成功 / 失敗提示
 *
 * @param {AxiosResponse|Blob|string|ArrayBuffer} content - 檔案內容或 axios response
 * @param {string} [fileName] - 檔名（可選），未指定時自動從 header 取出
 */
export default function downloadFileFromString(content, fileName) {
  try {
    if (!content) {
      message.error('下載失敗：內容為空');
      console.warn('下載內容為空');
      return;
    }

    let blob;
    let finalFileName = fileName || 'download';
    let mimeType = 'application/octet-stream';

    // Axios response
    if (content?.data && content?.headers) {
      const headers = content.headers;

      const disposition =
        headers['content-disposition'] ||
        headers['Content-Disposition'] ||
        headers.get?.('Content-Disposition');

      if (!fileName && disposition?.includes('attachment')) {
        const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (match?.[1]) {
          finalFileName = decodeURIComponent(match[1].replace(/['"]/g, ''));
        }
      }

      mimeType = headers['content-type'] || headers['Content-Type'] || 'application/octet-stream';

      blob = new Blob([content.data], { type: mimeType });
    } else if (content instanceof Blob) {
      blob = content;
      mimeType = content.type || mimeType;
    } else if (typeof content === 'string') {
      blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    } else if (content instanceof ArrayBuffer) {
      blob = new Blob([content], { type: mimeType });
    } else {
      throw new Error('不支援的下載資料格式');
    }

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = finalFileName;
    link.style.display = 'none';
    document.body.appendChild(link);

    setTimeout(() => {
      link.click();
      window.URL.revokeObjectURL(url);
      link.remove();
      message.success('下載成功');
    }, 0);
  } catch (error) {
    console.error('下載檔案失敗：', error);
    message.error('下載失敗');
  }
}
