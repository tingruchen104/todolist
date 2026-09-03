/* --------------------------------------------
   Site 與 Index
   - site 決定標籤的對象，index 決定可搜尋的索引
   - 兩者並非自由組合，需依 SITE_INDEX_MAP 限制可選範圍
   - 值為 wire format，括號內為後端資料的實際欄位
--------------------------------------------- */
/** 標籤對象代碼。 */
export const SITE = {
  JOBNO: 'job', // 職缺（jobno）
  IDNO: 'resume', // 人（idno）
  PID: 'resume_p', // 人（pid）
  CUSTNO: 'custprofile', // 公司（custno）
  INVOICE: 'custprofile_inv' // 公司（invoice）
};

/** 搜尋索引代碼。 */
export const INDEX = {
  NONE: 'null', // 無（null）
  JOB_ON: 'jobOn', // 找工作頁（JobOn index）
  CUST_PROFILE: 'custProfile', // 找公司頁（CustProfile index）
  TALENT_RESUME: 'talent.resume', // 查詢人才（talent.resume index）
  VIP_RESUME_ON: 'vip.ResumeOn' // VIP 查詢人才（resumeOn index）
};

/** 各 site 允許的 index，未列出的 site 視為不可選任何 index。 */
const SITE_INDEX_MAP = {
  [SITE.JOBNO]: [INDEX.NONE, INDEX.JOB_ON],
  [SITE.IDNO]: [INDEX.NONE, INDEX.VIP_RESUME_ON],
  [SITE.PID]: [INDEX.NONE, INDEX.TALENT_RESUME, INDEX.VIP_RESUME_ON],
  [SITE.CUSTNO]: [INDEX.NONE, INDEX.CUST_PROFILE],
  [SITE.INVOICE]: [INDEX.NONE]
};

/**
 * 依 site 過濾 index 選項。
 *
 * @param {String} site - 目前選擇的標籤對象
 * @param {Array} allIndexOptions - metadata 回傳的完整 index 選項
 * @returns {Array} 該 site 允許的選項；site 未定義對應關係時為空陣列
 */
export const filterIndexOptionsBySite = (site, allIndexOptions = []) => {
  const allowList = SITE_INDEX_MAP[site];
  if (!allowList) return [];

  return allIndexOptions.filter(option => allowList.includes(option.value));
};
