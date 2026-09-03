import { FILTER_FIELD } from '@/pages/tag-service/constants/tags/filter/shared/filterField';
import { MODULE } from '@/pages/tag-service/constants/tags/filter/module';
import { OPERATOR } from '@/pages/tag-service/constants/shared/operator';

/* --------------------------------------------
   篩選器各層級結構工廠
   - 篩選器由外到內為 filter → modules → conditions → condition item
   - 各層預設結構集中於此，避免由多個功能各自維護
--------------------------------------------- */
/** 建立最底層的單一條件項目。 */
export const createConditionItem = (fields = {}) => ({ ...fields });

/** 建立條件群組，operator 決定群組內各條件的組合方式。 */
export const createConditions = (conditions = [], operator = OPERATOR.AND) => ({
  [FILTER_FIELD.OPERATOR]: operator,
  [FILTER_FIELD.CONDITIONS]: conditions
});

/** 建立事件或會員資料篩選模組。 */
export const createModule = (module, conditions = [], operator = OPERATOR.AND) => ({
  [FILTER_FIELD.MODULE]: module,
  [FILTER_FIELD.OPERATOR]: operator,
  [FILTER_FIELD.CONDITIONS]: conditions
});

/**
 * 建立完整篩選器。
 * modules 以模組代碼為 key 傳入既有內容，未指定的模組補上空模組，
 * 讓畫面上每個模組都有對應的資料節點。
 */
export const createFilter = ({ modules = {}, operator = OPERATOR.AND } = {}) => ({
  [FILTER_FIELD.OPERATOR]: operator,
  [FILTER_FIELD.MODULES]: Object.values(MODULE).map(
    module => modules[module] ?? createModule(module)
  )
});
