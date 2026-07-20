/* --------------------------------------------
  標籤設定 - Site 與 Index 欄位對應規則
    - 根據 site 限制可選 index 範圍
--------------------------------------------- */

/**
 * site 代碼
 */
export const SITE = {
  JOBNO: 'job', // 職缺（jobno）
  IDNO: 'resume', // 人（idno）
  PID: 'resume_p', // 人（pid）
  CUSTNO: 'custprofile', // 公司（custno）
  INVOICE: 'custprofile_inv' // 公司（invoice）
};

/**
 * index 代碼
 */
export const INDEX = {
  NONE: 'null', // 無（null）
  JOB_ON: 'jobOn', // 找工作頁（JobOn index）
  CUST_PROFILE: 'custProfile', // 找公司頁（CustProfile index）
  TALENT_RESUME: 'talent.resume', // 查詢人才（talent.resume index）
  VIP_RESUME_ON: 'vip.ResumeOn' // VIP 查詢人才（resumeOn index）
};
/**
 * site 與 index 的對應關係
 */
const SITE_INDEX_MAP = {
  [SITE.JOBNO]: [INDEX.NONE, INDEX.JOB_ON],
  [SITE.IDNO]: [INDEX.NONE, INDEX.VIP_RESUME_ON],
  [SITE.PID]: [INDEX.NONE, INDEX.TALENT_RESUME, INDEX.VIP_RESUME_ON],
  [SITE.CUSTNO]: [INDEX.NONE, INDEX.CUST_PROFILE],
  [SITE.INVOICE]: [INDEX.NONE]
};

/**
 * 根據 sites 回傳對應的 index 選項
 */
export const filterIndexOptionsBySite = (site, allIndexOptions = []) => {
  const allowList = SITE_INDEX_MAP[site];
  if (!allowList) return [];

  return allIndexOptions.filter(option => allowList.includes(option.value));
};
