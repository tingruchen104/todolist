import env from '@/utils/env';

/**
 * 判斷網址是否為 preview 環境
 * @param link {string}
 * @return {Boolean}
 */
export function isPreview(link = '') {
  if (!link) return false;
  try {
    const { host } = new URL(link);
    return host === 'preview.f2e.s3.104-dev.com.tw';
  } catch {
    return false;
  }
}

/**
 * 判斷網址是否為 cdn 環境
 * @param link {string}
 * @return {Boolean}
 */
export function isCDN(link = '') {
  if (!link) return false;
  try {
    const { host } = new URL(link);
    return host === env.VUE_APP_CDN_URL.replace(/\//g, '');
  } catch {
    return false;
  }
}

/**
 * 統一判斷是否使用 hash history
 * @param link {string}
 * @return {Boolean}
 */
export function shouldUseHashHistory(link = '') {
  return process.env.NODE_ENV === 'development' || isPreview(link) || isCDN(link);
}

export default {
  isPreview,
  isCDN,
  shouldUseHashHistory
};
