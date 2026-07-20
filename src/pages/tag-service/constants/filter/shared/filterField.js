/* --------------------------------------------
  篩選器 - 結構欄位 key
    - 用於組裝/讀取 篩選器 payload 的固定欄位名稱
--------------------------------------------- */

/**
 * 篩選器結構欄位 key
 */
export const FILTER_FIELD = {
  FILTER: 'filter', // option 用
  CONDITION: 'condition',
  CONDITIONS: 'conditions',
  OPERATOR: 'operator',
  MODULES: 'modules',
  MODULE: 'module',
  CATEGORY: 'category',
  FIELD: 'field',
  VALUE: 'value',
  VALUES: 'values',
  REFERENCED_TAGS: 'referencedTags'
};

export const FILTER_OPTIONS_FIELD = {
  CATEGORY: 'category',
  FIELD: 'field',
  OPERATORS: 'operators',
  COMPONENT: 'component',
  SOURCE: 'source'
};
