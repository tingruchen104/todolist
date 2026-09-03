import { Input, InputNumber, DatePicker, message } from 'ant-design-vue';

// Components
import Select from '@/components/shared/select/Select.vue';
import InputRangeNumber from '@/components/shared/input/InputRangeNumber.vue';

// Utils
import RULES from '@/utils/form/validationRules';

// 複選欄位的選取上限
const MAX_SELECTED_OPTIONS = 10;

/**
 * 複選欄位的 change handler，超過上限時截掉並提示。
 * 直接改動傳入陣列，antdv 的 v-model 才會同步顯示結果。
 */
const limitSelectedOptions = value => {
  if (value.length <= MAX_SELECTED_OPTIONS) return;

  value.splice(MAX_SELECTED_OPTIONS);
  message.warning(`至多可複選 ${MAX_SELECTED_OPTIONS} 組，已達上限`);
};

/* --------------------------------------------
   動態欄位契約
   - 後端以 component 指定欄位要渲染的元件，以 source 指定選項來源
   - 值為 wire format，不得因程式命名調整而變更
--------------------------------------------- */
/** 選項來源：enum 直接給值、api 需另外請求、category 讀取分類 JSON。 */
export const FIELD_COMPONENT_SOURCE = {
  ENUM: 'enum',
  API: 'api',
  CATEGORY: 'category'
};

/** 會改變欄位輸入形式的運算子：區間需兩個值，空值判斷不需輸入值。 */
export const QUERY_OPERATORS = {
  BETWEEN: 'between',
  DATE_BETWEEN: 'date_between',
  IS_NULL: 'is_null',
  IS_NOT_NULL: 'is_not_null'
};

/** 後端 component 欄位使用的元件類型。 */
export const FIELD_COMPONENT = {
  CASCADER: 'cascading_dropdown',
  SELECT: 'dropdown',
  MULTI_SELECT: 'multi_select_dropdown',
  TEXT_INPUT: 'text_input',
  NUMBER_INPUT: 'number_input',
  NUMBER_RANGE_INPUT: 'number_range_input',
  DATE_PICKER: 'date_picker',
  DATE_RANGE_PICKER: 'date_range_picker',
  MONTH_PICKER: 'yyyymm_input',
  MONTH_RANGE_PICKER: 'yyyymm_range_picker'
};

/** 元件類型對應的實際 Vue component。 */
export const FIELD_COMPONENT_MAP = {
  [FIELD_COMPONENT.CASCADER]: Select,
  [FIELD_COMPONENT.SELECT]: Select,
  [FIELD_COMPONENT.MULTI_SELECT]: Select,
  [FIELD_COMPONENT.TEXT_INPUT]: Input,
  [FIELD_COMPONENT.NUMBER_INPUT]: InputNumber,
  [FIELD_COMPONENT.NUMBER_RANGE_INPUT]: InputRangeNumber,
  [FIELD_COMPONENT.DATE_PICKER]: DatePicker,
  [FIELD_COMPONENT.DATE_RANGE_PICKER]: DatePicker.RangePicker,
  [FIELD_COMPONENT.MONTH_PICKER]: DatePicker,
  [FIELD_COMPONENT.MONTH_RANGE_PICKER]: DatePicker.RangePicker
};

/** 日期型元件，值需經 dayjs 正規化後才能綁定。 */
export const FIELD_COMPONENT_DATE_TYPES = [
  FIELD_COMPONENT.DATE_PICKER,
  FIELD_COMPONENT.DATE_RANGE_PICKER,
  FIELD_COMPONENT.MONTH_PICKER,
  FIELD_COMPONENT.MONTH_RANGE_PICKER
];

/* --------------------------------------------
   元件 props
   - 各元件類型的預設 props，呼叫端可再覆寫
   - 尺寸與最小寬度由 antdv/ 的樣式規範承接，不在此設定 inline style
--------------------------------------------- */
export const FIELD_COMPONENT_PROPS = {
  [FIELD_COMPONENT.CASCADER]: {
    options: [],
    mode: 'multiple',
    placeholder: '請選擇',
    showArrow: true,
    showSearch: false,
    open: false,
    onChange: limitSelectedOptions
  },

  [FIELD_COMPONENT.SELECT]: {
    options: [],
    placeholder: '請選擇'
  },

  [FIELD_COMPONENT.MULTI_SELECT]: {
    options: [],
    mode: 'multiple',
    placeholder: '請選擇',
    showArrow: true,
    onChange: limitSelectedOptions
  },

  [FIELD_COMPONENT.TEXT_INPUT]: {
    placeholder: '請輸入文字'
  },

  [FIELD_COMPONENT.NUMBER_INPUT]: {
    step: 1,
    precision: 0,
    placeholder: '請輸入數字',
    stringMode: true
  },

  [FIELD_COMPONENT.NUMBER_RANGE_INPUT]: {
    step: 1,
    precision: 0,
    placeholder: ['請輸入起始數字', '請輸入結束數字'],
    stringMode: true
  },

  [FIELD_COMPONENT.DATE_PICKER]: {
    valueFormat: 'YYYY-MM-DD',
    placeholder: '請選擇日期'
  },

  [FIELD_COMPONENT.DATE_RANGE_PICKER]: {
    valueFormat: 'YYYY-MM-DD',
    placeholder: ['請選擇起始日期', '請選擇結束日期']
  },

  [FIELD_COMPONENT.MONTH_PICKER]: {
    picker: 'month',
    valueFormat: 'YYYY-MM',
    placeholder: '請選擇年月'
  },

  [FIELD_COMPONENT.MONTH_RANGE_PICKER]: {
    picker: 'month',
    valueFormat: 'YYYY-MM',
    placeholder: ['請選擇起始年月', '請選擇結束年月']
  }
};

/* --------------------------------------------
   預設值與驗證
   - 預設值需與元件的 value shape 一致，區間類型為兩個元素的陣列
   - 驗證規則取自共用 RULES，選項類欄位需擋掉已失效的選項
--------------------------------------------- */
export const FIELD_COMPONENT_DEFAULTS = {
  [FIELD_COMPONENT.CASCADER]: [],
  [FIELD_COMPONENT.MULTI_SELECT]: [],
  [FIELD_COMPONENT.SELECT]: null,
  [FIELD_COMPONENT.TEXT_INPUT]: '',
  [FIELD_COMPONENT.NUMBER_INPUT]: null,
  [FIELD_COMPONENT.NUMBER_RANGE_INPUT]: [null, null],
  [FIELD_COMPONENT.DATE_PICKER]: null,
  [FIELD_COMPONENT.DATE_RANGE_PICKER]: [null, null],
  [FIELD_COMPONENT.MONTH_PICKER]: null,
  [FIELD_COMPONENT.MONTH_RANGE_PICKER]: [null, null]
};

/** 各 component type 對應的 Ant Design Vue Form rules。 */
export const FIELD_COMPONENT_RULES = {
  [FIELD_COMPONENT.CASCADER]: [RULES.requiredSelect()],
  [FIELD_COMPONENT.SELECT]: [RULES.requiredSelect(), RULES.forbidRemovedOption()],
  [FIELD_COMPONENT.MULTI_SELECT]: [RULES.requiredSelect(), RULES.forbidRemovedOption()],
  [FIELD_COMPONENT.TEXT_INPUT]: [RULES.requiredText()],
  [FIELD_COMPONENT.NUMBER_INPUT]: [RULES.requiredText(), RULES.onlyDigits()],
  [FIELD_COMPONENT.NUMBER_RANGE_INPUT]: [
    RULES.requiredNumberRange('請輸入起始與結束數字'),
    RULES.numberRangeOnlyDigits(),
    RULES.numberRangeOrder()
  ],
  [FIELD_COMPONENT.DATE_PICKER]: [RULES.requiredDate()],
  [FIELD_COMPONENT.DATE_RANGE_PICKER]: [RULES.requiredDate('請選擇起始日期與結束日期')],
  [FIELD_COMPONENT.MONTH_PICKER]: [RULES.requiredDate('請選擇年月')],
  [FIELD_COMPONENT.MONTH_RANGE_PICKER]: [RULES.requiredDate('請選擇起始年月與結束年月')]
};
