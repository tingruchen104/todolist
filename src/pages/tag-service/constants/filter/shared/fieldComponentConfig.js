/* --------------------------------------------
  會員資料與標籤篩選器 - 動態元件設定
    - 定義各欄位元件的型別、預設值、Props 與驗證規則
--------------------------------------------- */
import { Input, InputNumber, DatePicker, message } from 'ant-design-vue';
import Select from '@/components/shared/select/Select.vue';
import RULES from '@/utils/form/validationRules';
import InputRangeNumber from '@/components/shared/input/InputRangeNumber.vue';
/**
 * 欄位資料來源 key
 */
export const FIELD_COMPONENT_SOURCE = {
  ENUM: 'enum',
  API: 'api',
  CATEGORY: 'category'
};

/**
 * Query 運算子（影響動態元件類型）
 */
export const QUERY_OPERATORS = {
  BETWEEN: 'between',
  DATE_BETWEEN: 'date_between',
  IS_NULL: 'is_null',
  IS_NOT_NULL: 'is_not_null'
};

/**
 * 欄位元件種類 key
 * - 後端會給出 "component": "<type>"，決定渲染哪個元件
 */
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

/**
 * 元件映射：欄位元件種類 → Vue Component
 */
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

/**
 * 所有日期型元件
 */
export const FIELD_COMPONENT_DATE_TYPES = [
  FIELD_COMPONENT.DATE_PICKER,
  FIELD_COMPONENT.DATE_RANGE_PICKER,
  FIELD_COMPONENT.MONTH_PICKER,
  FIELD_COMPONENT.MONTH_RANGE_PICKER
];

/**
 * 每種元件的預設 Props
 */
export const FIELD_COMPONENT_PROPS = {
  [FIELD_COMPONENT.CASCADER]: {
    options: [],
    mode: 'multiple',
    placeholder: '請選擇',
    showArrow: true,
    showSearch: false,
    open: false,
    style: { minWidth: '5.5rem' },
    onChange(value) {
      if (value.length > 10) {
        value.splice(10);
        message.warning('至多可複選 10 組，已達上限');
      }
    }
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
    style: { minWidth: '5.5rem' },
    onChange(value) {
      if (value.length > 10) {
        value.splice(10);
        message.warning('至多可複選 10 組，已達上限');
      }
    }
  },

  [FIELD_COMPONENT.TEXT_INPUT]: {
    placeholder: '請輸入文字',
    style: { minWidth: '11.25rem' }
  },

  [FIELD_COMPONENT.NUMBER_INPUT]: {
    step: 1,
    precision: 0,
    placeholder: '請輸入數字',
    stringMode: true,
    style: { minWidth: '11.25rem' }
  },

  [FIELD_COMPONENT.NUMBER_RANGE_INPUT]: {
    step: 1,
    precision: 0,
    placeholder: ['請輸入起始數字', '請輸入結束數字'],
    stringMode: true,
    style: { minWidth: '15.9rem' }
  },

  [FIELD_COMPONENT.DATE_PICKER]: {
    valueFormat: 'YYYY-MM-DD',
    placeholder: '請選擇日期',
    style: { minWidth: '11.25rem' }
  },

  [FIELD_COMPONENT.DATE_RANGE_PICKER]: {
    valueFormat: 'YYYY-MM-DD',
    placeholder: ['請選擇起始日期', '請選擇結束日期'],
    style: { minWidth: '17.6rem' }
  },

  [FIELD_COMPONENT.MONTH_PICKER]: {
    picker: 'month',
    valueFormat: 'YYYY-MM',
    placeholder: '請選擇年月',
    style: { minWidth: '11.25rem' }
  },

  [FIELD_COMPONENT.MONTH_RANGE_PICKER]: {
    picker: 'month',
    valueFormat: 'YYYY-MM',
    placeholder: ['請選擇起始年月', '請選擇結束年月'],
    style: { minWidth: '17.6rem' }
  }
};

/**
 * 每種元件的預設值（modelValue）
 */
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

/**
 * 每種元件的預設驗證規則
 */
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
