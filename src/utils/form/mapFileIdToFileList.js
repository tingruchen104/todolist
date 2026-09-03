/**
 * 將既有檔案的 fileId 轉為 a-upload 的 fileList 格式。
 * 讀取既有標籤時只會拿到 fileId，需組成已上傳狀態的項目才能顯示在上傳元件中。
 *
 * @param {String} fileId - 已上傳檔案的識別碼
 * @param {String} [fileName] - 顯示名稱，API 未提供原始檔名時使用預設值
 * @returns {Array} a-upload 的 fileList，沒有 fileId 時為空陣列
 */
export default function mapFileIdToFileList(fileId, fileName = '已上傳檔案') {
  if (!fileId) return [];

  return [
    {
      uid: fileId,
      name: fileName,
      status: 'done',
      url: fileId
    }
  ];
}
