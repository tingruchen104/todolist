/**
 * 通用表單驗證規則。
 * 每個項目為 rule factory，回傳 antdv form 可直接使用的 rule 物件；
 * 參數多為錯誤訊息，需要外部狀態的規則則接受 ref 或 getter。
 * 可跨功能重用的規則補進此檔，只屬於單一欄位組合的規則留在業務檔案。
 */

// 未指定時一律在值變動時驗證，區間類欄位另外加上 blur
const DEFAULT_TRIGGER = ['change'];

const RULES = {
  /* --------------------------------------------
     基本必填與必選
  --------------------------------------------- */
  /** 文字欄位必須有值。 */
  requiredText: (message = '此欄位為必填') => ({
    required: true,
    message,
    trigger: DEFAULT_TRIGGER
  }),
  /** Select 欄位必須有選值。 */
  requiredSelect: (message = '請選擇項目') => ({
    required: true,
    message,
    trigger: DEFAULT_TRIGGER
  }),
  /** 串接式選單需每一層都有值；arrayRef 為各層選值的 ref。 */
  requiredCascader: (arrayRef, message = '請選擇項目') => ({
    validator(_, _value) {
      const allFilled = arrayRef.value?.every(value => value != null && value !== '');
      return allFilled ? Promise.resolve() : Promise.reject(message);
    },
    trigger: DEFAULT_TRIGGER
  }),
  /** Checkbox 必須為已勾選狀態。 */
  requiredCheckbox: (message = '請勾選此選項') => ({
    validator: (_, value) => (value ? Promise.resolve() : Promise.reject(message)),
    trigger: DEFAULT_TRIGGER
  }),

  /* --------------------------------------------
     字數限制
  --------------------------------------------- */
  /** 字串長度不可超過 n。 */
  maxLength: (n, message = `最多 ${n} 字`) => ({
    max: n,
    message,
    trigger: DEFAULT_TRIGGER
  }),
  /** 字串長度不可少於 n。 */
  minLength: (n, message = `至少 ${n} 字`) => ({
    min: n,
    message,
    trigger: DEFAULT_TRIGGER
  }),
  /** 字數需落在 min 與 max 之間（含）。 */
  lengthBetween: (min, max, message) => ({
    validator: (_, value) =>
      value && (value.length < min || value.length > max)
        ? Promise.reject(message || `長度需介於 ${min} ~ ${max} 個字`)
        : Promise.resolve(),
    trigger: DEFAULT_TRIGGER
  }),

  /* --------------------------------------------
     數字
  --------------------------------------------- */
  /** 僅接受不含 0 的正整數。 */
  positiveInteger: (message = '請輸入正整數') => ({
    pattern: /^[1-9][0-9]*$/,
    message,
    trigger: DEFAULT_TRIGGER
  }),
  /** 接受正整數、負整數與 0。 */
  integer: (message = '請輸入整數') => ({
    pattern: /^-?\d+$/,
    message,
    trigger: DEFAULT_TRIGGER
  }),
  /** 單一數值需落在 min 與 max 之間（含）。 */
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

  /* --------------------------------------------
     字元格式
  --------------------------------------------- */
  /** 僅接受半形英文、數字、底線與句點。 */
  alphaNumUnderscoreDot: (message = '僅能輸入半形英文、數字以及底線(_)、(.)') => ({
    pattern: /^[a-zA-Z0-9_.]+$/,
    message,
    trigger: DEFAULT_TRIGGER
  }),
  /** 僅接受英文字母。 */
  onlyEnglish: (message = '僅能輸入英文') => ({
    pattern: /^[A-Za-z]+$/,
    message,
    trigger: DEFAULT_TRIGGER
  }),
  /** 僅接受 0 至 9 的數字字元。 */
  onlyDigits: (message = '僅能輸入數字') => ({
    pattern: /^[0-9]+$/,
    message,
    trigger: DEFAULT_TRIGGER
  }),
  /** 僅接受中文漢字。 */
  onlyChinese: (message = '僅能輸入中文') => ({
    pattern: /^[\u4e00-\u9fa5]+$/,
    message,
    trigger: DEFAULT_TRIGGER
  }),
  /** 僅接受半形英文字母與數字。 */
  alphaNum: (message = '僅能輸入半形英文與數字') => ({
    pattern: /^[A-Za-z0-9]+$/,
    message,
    trigger: DEFAULT_TRIGGER
  }),
  /** 禁止字串以句點開頭。 */
  noLeadingDot: (message = '開頭不得為 "."') => ({
    pattern: /^(?!\.)[\s\S]*$/,
    message,
    trigger: DEFAULT_TRIGGER
  }),

  /* --------------------------------------------
     Email、URL 與特殊格式
  --------------------------------------------- */
  /** 使用 Ant Design Vue 內建 email type 驗證。 */
  email: (message = '請輸入正確的 Email 格式') => ({
    type: 'email',
    message,
    trigger: DEFAULT_TRIGGER
  }),
  /** 使用 Ant Design Vue 內建 url type 驗證。 */
  url: (message = '請輸入正確的網址') => ({
    type: 'url',
    message,
    trigger: DEFAULT_TRIGGER
  }),
  /** 驗證台灣 09 開頭的十碼手機號碼。 */
  taiwanPhone: (message = '請輸入正確的手機號碼') => ({
    pattern: /^09\d{8}$/,
    message,
    trigger: DEFAULT_TRIGGER
  }),
  /** 驗證一碼大寫英文、性別碼與八碼數字的身分證格式。 */
  taiwanId: (message = '請輸入正確的身分證字號') => ({
    pattern: /^[A-Z][12]\d{8}$/,
    message,
    trigger: DEFAULT_TRIGGER
  }),
  /** 數值區間必須同時提供起始與結束值。 */
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
  /** 數值區間的兩端皆須為數字，空值不檢查。 */
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
  /** 數值區間的起始不可大於結束；僅在兩端皆為有效數字時檢查。 */
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

  /* --------------------------------------------
     日期與時間
  --------------------------------------------- */
  /** 單一日期必須有值，日期區間則起訖皆須有值。 */
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

  /** 日期不可早於今天，支援單一日期與日期區間。 */
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

  /* --------------------------------------------
     檔案上傳
  --------------------------------------------- */
  /** 檔案欄位必須有值。 */
  fileRequired: (message = '請上傳檔案') => ({
    validator: (_, value) => (value ? Promise.resolve() : Promise.reject(message)),
    trigger: DEFAULT_TRIGGER
  }),
  /** 檔案大小上限，單位為 MB。 */
  fileSizeLimit: (maxMB, message) => ({
    validator: (_, file) =>
      file && file.size / 1024 / 1024 > maxMB
        ? Promise.reject(message || `檔案大小不可超過 ${maxMB}MB`)
        : Promise.resolve(),
    trigger: DEFAULT_TRIGGER
  }),
  /** 限制副檔名；acceptList 為副檔名陣列。 */
  fileType: (acceptList, message) => ({
    validator: (_, file) =>
      file && !acceptList.includes(file.type)
        ? Promise.reject(message || `僅接受 ${acceptList.join(', ')}`)
        : Promise.resolve(),
    trigger: DEFAULT_TRIGGER
  }),

  /* --------------------------------------------
     條件驗證
  --------------------------------------------- */
  /** 兩欄位至少填一項；otherFieldName 為另一欄位在 formState 中的 key。 */
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

  /** conditionFn 成立時才要求目前欄位有值。 */
  requiredIf: (conditionFn, message = '此欄位為必填') => ({
    validator: (_, value) => {
      if (conditionFn() && !value) {
        return Promise.reject(message);
      }
      return Promise.resolve();
    },
    trigger: DEFAULT_TRIGGER
  }),

  /** conditionFn 成立時，既有 fileId 或新 fileList 至少需存在一項。 */
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

  /** 擋掉已從選項中移除的選值，避免送出已失效的資料。 */
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

  /* --------------------------------------------
     後端錯誤與跨欄位條件
  --------------------------------------------- */
  /** getter 結果符合 predicate 時，將後端狀態呈現為欄位錯誤。 */
  serverErrorIf: (getter, predicate, message = '伺服器驗證失敗') => ({
    validator: async () => {
      const value = typeof getter === 'function' ? getter() : getter;
      if (predicate(value)) {
        return Promise.reject(message);
      }
      return Promise.resolve();
    },
    trigger: DEFAULT_TRIGGER
  }),

  /**
   * 將後端錯誤碼呈現為欄位錯誤。
   * getter 取得目前錯誤碼，等於 expectedCode 時顯示訊息，與欄位值無關。
   */
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
