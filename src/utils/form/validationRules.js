/**
 * 通用表單驗證規則（全域 trigger: ['blur', 'change']）
 * -----------------------------------------------------
 * - 固定規則：直接是物件
 * - 動態規則：函式回傳物件
 */

const DEFAULT_TRIGGER = ['change'];

const RULES = {
  /* ========== 基本必填 / 必選 ========== */
  requiredText: (message = '此欄位為必填') => ({
    required: true,
    message,
    trigger: DEFAULT_TRIGGER
  }),
  requiredSelect: (message = '請選擇項目') => ({
    required: true,
    message,
    trigger: DEFAULT_TRIGGER
  }),
  requiredCascader: (arrayRef, message = '請選擇項目') => ({
    validator(_, _value) {
      const allFilled = arrayRef.value?.every(v => v != null && v !== '');
      return allFilled ? Promise.resolve() : Promise.reject(message);
    },
    trigger: DEFAULT_TRIGGER
  }),
  requiredCheckbox: (message = '請勾選此選項') => ({
    validator: (_, value) => (value ? Promise.resolve() : Promise.reject(message)),
    trigger: DEFAULT_TRIGGER
  }),

  /* ========== 字數限制 ========== */
  maxLength: (n, message = `最多 ${n} 字`) => ({
    max: n,
    message,
    trigger: DEFAULT_TRIGGER
  }),
  minLength: (n, message = `至少 ${n} 字`) => ({
    min: n,
    message,
    trigger: DEFAULT_TRIGGER
  }),
  lengthBetween: (min, max, message) => ({
    validator: (_, value) =>
      value && (value.length < min || value.length > max)
        ? Promise.reject(message || `長度需介於 ${min} ~ ${max} 個字`)
        : Promise.resolve(),
    trigger: DEFAULT_TRIGGER
  }),

  /* ========== 數字相關 ========== */
  positiveInteger: (message = '請輸入正整數') => ({
    pattern: /^[1-9][0-9]*$/,
    message,
    trigger: DEFAULT_TRIGGER
  }),
  integer: (message = '請輸入整數') => ({
    pattern: /^-?\d+$/,
    message,
    trigger: DEFAULT_TRIGGER
  }),
  numberRange: (min, max, message) => ({
    validator: (_, value) => {
      if (value == null) return Promise.resolve();
      if (value < min || value > max) {
        return Promise.reject(message || `數值需介於 ${min} ~ ${max}`);
      }
      return Promise.resolve();
    },
    trigger: DEFAULT_TRIGGER
  }),

  /* ========== 字元格式 ========== */
  alphaNumUnderscoreDot: (message = '僅能輸入半形英文、數字以及底線(_)、(.)') => ({
    pattern: /^[a-zA-Z0-9_.]+$/,
    message,
    trigger: DEFAULT_TRIGGER
  }),
  onlyEnglish: (message = '僅能輸入英文') => ({
    pattern: /^[A-Za-z]+$/,
    message,
    trigger: DEFAULT_TRIGGER
  }),
  onlyDigits: (message = '僅能輸入數字') => ({
    pattern: /^[0-9]+$/,
    message,
    trigger: DEFAULT_TRIGGER
  }),
  onlyChinese: (message = '僅能輸入中文') => ({
    pattern: /^[\u4e00-\u9fa5]+$/,
    message,
    trigger: DEFAULT_TRIGGER
  }),
  alphaNum: (message = '僅能輸入半形英文與數字') => ({
    pattern: /^[A-Za-z0-9]+$/,
    message,
    trigger: DEFAULT_TRIGGER
  }),
  noLeadingDot: (message = '開頭不得為 "."') => ({
    pattern: /^(?!\.)[\s\S]*$/,
    message,
    trigger: DEFAULT_TRIGGER
  }),

  /* ========== Email / URL / 特殊格式 ========== */
  email: (message = '請輸入正確的 Email 格式') => ({
    type: 'email',
    message,
    trigger: DEFAULT_TRIGGER
  }),
  url: (message = '請輸入正確的網址') => ({
    type: 'url',
    message,
    trigger: DEFAULT_TRIGGER
  }),
  taiwanPhone: (message = '請輸入正確的手機號碼') => ({
    pattern: /^09\d{8}$/,
    message,
    trigger: DEFAULT_TRIGGER
  }),
  taiwanId: (message = '請輸入正確的身分證字號') => ({
    pattern: /^[A-Z][12]\d{8}$/,
    message,
    trigger: DEFAULT_TRIGGER
  }),
  requiredNumberRange: (message = '請輸入起始與結束數字') => ({
    validator: (_, value) => {
      if (!Array.isArray(value)) {
        return Promise.reject(message);
      }

      const [start, end] = value;

      if (start == null || end == null) {
        return Promise.reject(message);
      }

      return Promise.resolve();
    },
    trigger: ['change', 'blur']
  }),
  numberRangeOnlyDigits: (message = '僅能輸入數字') => ({
    validator: (_, value) => {
      if (!Array.isArray(value)) return Promise.resolve();

      const [start, end] = value;

      if (
        (start != null && !/^\d+$/.test(String(start))) ||
        (end != null && !/^\d+$/.test(String(end)))
      ) {
        return Promise.reject(message);
      }

      return Promise.resolve();
    },
    trigger: ['change', 'blur']
  }),
  numberRangeOrder: (message = '起始數字不可大於結束數字') => ({
    validator: (_, value) => {
      if (!Array.isArray(value)) return Promise.resolve();

      const [start, end] = value;

      // 只在兩個都有值時檢查
      if (start == null || end == null) {
        return Promise.resolve();
      }

      const startNum = Number(start);
      const endNum = Number(end);

      // 非數字時交給 onlyDigits 處理
      if (Number.isNaN(startNum) || Number.isNaN(endNum)) {
        return Promise.resolve();
      }

      if (startNum > endNum) {
        return Promise.reject(message);
      }

      return Promise.resolve();
    },
    trigger: ['change', 'blur']
  }),

  /* ========== 日期 / 時間 ========== */
  requiredDate: (message = '請選擇日期') => ({
    validator: (_, value) => {
      // 若為空值、null、undefined
      if (!value) return Promise.reject(message);
      // 若為陣列（日期區間）
      if (Array.isArray(value)) {
        const [start, end] = value;
        if (!start || !end) return Promise.reject(message);
      }
      return Promise.resolve();
    },
    trigger: ['change', 'blur']
  }),

  notPastDate: (message = '日期不可小於今天') => ({
    validator: (_, value) => {
      if (!value) return Promise.resolve();

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // 若為陣列（日期區間）
      if (Array.isArray(value)) {
        const [start, end] = value;
        if (start && new Date(start) < today) return Promise.reject(message);
        if (end && new Date(end) < today) return Promise.reject(message);
        return Promise.resolve();
      }

      // 單一日期
      return new Date(value) < today ? Promise.reject(message) : Promise.resolve();
    },
    trigger: ['change', 'blur']
  }),

  /* ========== 檔案上傳相關 ========== */
  fileRequired: (message = '請上傳檔案') => ({
    validator: (_, value) => (value ? Promise.resolve() : Promise.reject(message)),
    trigger: DEFAULT_TRIGGER
  }),
  fileSizeLimit: (maxMB, message) => ({
    validator: (_, file) =>
      file && file.size / 1024 / 1024 > maxMB
        ? Promise.reject(message || `檔案大小不可超過 ${maxMB}MB`)
        : Promise.resolve(),
    trigger: DEFAULT_TRIGGER
  }),
  fileType: (acceptList, message) => ({
    validator: (_, file) =>
      file && !acceptList.includes(file.type)
        ? Promise.reject(message || `僅接受 ${acceptList.join(', ')}`)
        : Promise.resolve(),
    trigger: DEFAULT_TRIGGER
  }),

  /* ========== 條件驗證 ========== */
  oneOfTwoRequired: (formState, otherFieldName, message = '至少需填寫一項') => ({
    validator(_, value) {
      const state = formState.value || formState;
      if (!value && !state[otherFieldName]) {
        return Promise.reject(new Error(message));
      }
      return Promise.resolve();
    },
    trigger: DEFAULT_TRIGGER
  }),

  requiredIf: (conditionFn, message = '此欄位為必填') => ({
    validator: (_, value) => {
      if (conditionFn() && !value) {
        return Promise.reject(message);
      }
      return Promise.resolve();
    },
    trigger: DEFAULT_TRIGGER
  }),

  requiredUploadIf: (conditionFn, formState, fileIdKey, fileListKey, message = '請上傳檔案') => ({
    async validator(_, value) {
      if (!conditionFn()) return Promise.resolve();
      const fileId = formState.value?.[fileIdKey];
      const fileList = formState.value?.[fileListKey];
      const hasFileId = Boolean(fileId);
      const hasFileList =
        (Array.isArray(fileList) && fileList.length > 0) ||
        (Array.isArray(value) && value.length > 0);
      if (!hasFileId && !hasFileList) {
        return Promise.reject(new Error(message));
      }
      return Promise.resolve();
    },
    trigger: DEFAULT_TRIGGER
  }),

  forbidRemovedOption: (message = '請重新選擇') => ({
    validator: (_, value) => {
      // 單選情況
      if (
        typeof value === 'string' &&
        (value.startsWith('(失效) ') || value.startsWith('(標籤失效) '))
      ) {
        return Promise.reject(message);
      }
      // 多選情況
      if (
        Array.isArray(value) &&
        value.some(
          v => typeof v === 'string' && (v.startsWith('(失效) ') || v.startsWith('(標籤失效) '))
        )
      ) {
        return Promise.reject(message);
      }
      return Promise.resolve();
    },
    trigger: DEFAULT_TRIGGER
  }),

  /* ========== 後端錯誤 / 跨欄位條件 ========== */
  serverErrorIf: (getter, predicate, message = '伺服器驗證失敗') => ({
    validator: async () => {
      const val = typeof getter === 'function' ? getter() : getter;
      if (predicate(val)) {
        return Promise.reject(message);
      }
      return Promise.resolve();
    },
    trigger: DEFAULT_TRIGGER
  }),

  serverErrorCode: (getter, expectedCode, message = '伺服器錯誤') => ({
    validator: async () => {
      const code = typeof getter === 'function' ? getter() : getter;
      if (code === expectedCode) {
        return Promise.reject(message);
      }
      return Promise.resolve();
    },
    trigger: DEFAULT_TRIGGER
  })
};

export default RULES;
