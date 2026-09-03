import { computed, watch } from 'vue';
import { FORM_FIELD } from '@/pages/tag-service/constants/tags/form/tagForm/formField';
import {
  SCHEDULE_FIELD,
  getScheduleDayOptions
} from '@/pages/tag-service/constants/tags/form/tagForm/scheduleField';

/**
 * 依 schedule.type 提供第二層星期／日期選項。
 * 初次載入保留 API 既有 days，只有使用者切換排程類型才清空。
 *
 * @param {Object} formState - 標籤表單的 formState ref
 * @returns {Object} { scheduleDayOptions }
 */
export function useSchedule(formState) {
  /** 每日更新沒有第二層；每週／每月回傳對應的可選日期。 */
  const scheduleDayOptions = computed(() => {
    const schedule = formState.value?.[FORM_FIELD.SCHEDULE];
    if (!schedule) return [];
    return getScheduleDayOptions(schedule[SCHEDULE_FIELD.TYPE]);
  });

  watch(
    () => formState.value?.[FORM_FIELD.SCHEDULE]?.[SCHEDULE_FIELD.TYPE],
    (type, previousType) => {
      if (type === previousType) return;
      if (!formState.value?.[FORM_FIELD.SCHEDULE]) return;

      // 初次載入保留既有天數，後續切換排程類型才清空。
      if (!previousType) return;

      formState.value[FORM_FIELD.SCHEDULE][SCHEDULE_FIELD.DAYS] = [];
    }
  );

  return {
    scheduleDayOptions
  };
}
