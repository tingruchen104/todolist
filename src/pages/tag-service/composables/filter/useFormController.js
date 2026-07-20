import { inject, nextTick } from 'vue';

export function useFormController(formItemName) {
  const formContext = inject('formContext', null);

  /** 單欄位驗證 */
  const validateSelf = async () => {
    if (!formContext) return;
    await nextTick();
    return formContext.validate([formItemName.value]);
  };

  /** 多欄位驗證 */
  const validateFields = async names => {
    if (!formContext) return;
    await nextTick();
    return formContext.validate(names);
  };

  /** 全表驗證 */
  const validateAll = async () => {
    if (!formContext) return;
    await nextTick();
    return formContext.validateAll();
  };

  /** 清除單一欄位驗證狀態 */
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
