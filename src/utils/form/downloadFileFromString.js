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
      console.warn('downloadFileFromString: content 為空');
      return;
    }

    let blob;
    let finalFileName = fileName || 'download';
    let mimeType = 'application/octet-stream'; // 預設為二進位

    // axios response 格式（有 data + headers）
    if (content?.data && content?.headers) {
      const headers = content.headers;

      // 嘗試從 Content-Disposition 抓 filename
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

      // 取 MIME type（例如 application/zip 或 text/csv）
      mimeType = headers['content-type'] || headers['Content-Type'] || 'application/octet-stream';

      blob = new Blob([content.data], { type: mimeType });
    }
    // Blob 直接下載
    else if (content instanceof Blob) {
      blob = content;
      mimeType = content.type || mimeType;
    }
    // 字串
    else if (typeof content === 'string') {
      blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    }
    // ArrayBuffer
    else if (content instanceof ArrayBuffer) {
      blob = new Blob([content], { type: mimeType });
    } else {
      throw new Error('不支援的下載資料格式');
    }

    // 建立 Blob URL 並觸發下載
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = finalFileName;
    a.style.display = 'none';
    document.body.appendChild(a);

    setTimeout(() => {
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      message.success(`下載成功`);
    }, 0);
  } catch (err) {
    console.error('downloadFileFromString error:', err);
    message.error('下載失敗');
  }
}
