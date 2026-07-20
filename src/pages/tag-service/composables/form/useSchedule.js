import { computed, watch } from 'vue';
import { FORM_FIELD } from '@/pages/tag-service/constants/form/tagForm/formField';
import { SCHEDULE_FIELD, getScheduleDayOptions } from '@/pages/tag-service/constants/form/tagForm/scheduleField';

export function useSchedule(formState) {
  // 天數選項（依 type 變化）
  const scheduleDayOptions = computed(() => {
    const schedule = formState.value?.[FORM_FIELD.SCHEDULE];
    if (!schedule) return [];
    return getScheduleDayOptions(schedule[SCHEDULE_FIELD.TYPE]);
  });

  // type 變 → 清空 days
  watch(
    () => formState.value?.[FORM_FIELD.SCHEDULE]?.[SCHEDULE_FIELD.TYPE],
    (newType, oldType) => {
      if (newType === oldType) return;
      if (!formState.value?.[FORM_FIELD.SCHEDULE]) return;
      // 父層初始化完成後才清空值
      if (!oldType) return;

      formState.value[FORM_FIELD.SCHEDULE][SCHEDULE_FIELD.DAYS] = [];
    }
  );

  return {
    scheduleDayOptions
  };
}
