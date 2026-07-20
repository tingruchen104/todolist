/* --------------------------------------------
  用於設定元素的 variant 屬性
--------------------------------------------- */
export const vVariant = {
  mounted(el, binding) {
    const val = binding.value ?? binding.arg ?? 'default';
    el.setAttribute('variant', val);
  },
  updated(el, binding) {
    const val = binding.value ?? binding.arg ?? 'default';
    el.setAttribute('variant', val);
  }
};
