/* --------------------------------------------
   Variant attribute
   - 在實際 DOM 設定 variant，供 antdv 元件樣式選取
   - 有效值以對應的 antdv/<component>.css 為準，各元件不互通
   - 無值時移除屬性，由 :not([variant]) 的預設規則接手
--------------------------------------------- */
/** 依 binding value 或 arg 設定／移除 variant attribute。 */
const setVariant = (el, binding) => {
  const value = binding.value ?? binding.arg;

  if (value) {
    el.setAttribute('variant', value);
  } else {
    el.removeAttribute('variant');
  }
};

export const vVariant = {
  mounted: setVariant,
  updated: setVariant
};
