/**
 * 通用規則驗證器
 * -----------------------------------------------------
 * 可驗證 Rules 陣列中包含：
 * - validator (async/sync)
 * - pattern
 * - required
 * - min / max
 * - type (email / url)
 *
 * @param {Array} rules - 驗證規則陣列（同 antd form 格式）
 * @param {any} value - 欲驗證的值
 * @returns {Promise<string>} 第一個錯誤訊息，驗證通過時為空字串
 */
export default async function validateRules(rules, value) {
  if (!Array.isArray(rules) || rules.length === 0) return '';

  for (const rule of rules) {
    try {
      if (rule.validator) {
        await rule.validator({}, value);
        continue;
      }

      if (rule.pattern && !rule.pattern.test(value)) {
        throw new Error(rule.message || '格式不符');
      }

      if (rule.min && (value?.length ?? 0) < rule.min) {
        throw new Error(rule.message || `至少 ${rule.min} 字`);
      }
      if (rule.max && (value?.length ?? 0) > rule.max) {
        throw new Error(rule.message || `最多 ${rule.max} 字`);
      }

      if (rule.required && !value) {
        throw new Error(rule.message || '此欄位為必填');
      }

      if (rule.type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (value && !emailRegex.test(value)) {
          throw new Error(rule.message || '請輸入正確的 Email 格式');
        }
      } else if (rule.type === 'url') {
        try {
          if (value) new URL(value);
        } catch {
          throw new Error(rule.message || '請輸入正確的網址');
        }
      }
    } catch (error) {
      return error.message;
    }
  }

  return '';
}
