export default function mapFileIdToFileList(fileId, fileNames = '已上傳檔案') {
  if (!fileId) return [];
  return [
    {
      uid: fileId,
      name: fileNames,
      status: 'done',
      url: fileId // 我們先放 fileId，下載時會用到
    }
  ];
}
