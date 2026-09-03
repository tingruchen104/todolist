import { inject, nextTick } from 'vue';

/**
 * 取得 TagForm 提供的驗證介面，讓巢狀篩選欄位依動態 name path 驗證。
 * 所有操作延後到 nextTick，確保 model 與 name path 已同步至 Ant Design Vue Form。
 */
export function useFormController(formItemName) {
  const formContext = inject('formContext', null);

  // 等待巢狀 model 與 name path 更新後，再交給 Ant Design Vue 驗證。
  const validateSelf = async () => {
    if (!formContext) return;
    await nextTick();
    return formContext.validate([formItemName.value]);
  };

  /** 驗證呼叫端指定的多個 name path。 */
  const validateFields = async names => {
    if (!formContext) return;
    await nextTick();
    return formContext.validate(names);
  };

  /** 驗證外層整份表單。 */
  const validateAll = async () => {
    if (!formContext) return;
    await nextTick();
    return formContext.validateAll();
  };

  /** 清除目前動態欄位的驗證狀態。 */
  const clearValidate = async () => {
    if (!formContext) return;
    await nextTick();
    formContext.clearValidate([formItemName.value]);
  };

  return {
    validateSelf,
    validateFields,
    validateAll,
    clearValidate
  };
}
