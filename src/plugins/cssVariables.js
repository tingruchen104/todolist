import { reactive } from 'vue';

/* --------------------------------------------
   CSS variables
   - 將 base.css 的 design tokens 讀入 app，供 Ant Design Vue theme mapping 使用
   - token 只在首次讀取時取值，不隨後續 DOM 變動更新
--------------------------------------------- */
/** 組出語意色階、基準色與字型所需的 CSS variable 名稱。 */
const generateCssVariableKeys = () => {
  const prefixes = [
    'color-primary',
    'color-success',
    'color-info',
    'color-warning',
    'color-error',
    'color-black',
    'color-white',
    'color-opacity'
  ];

  const fontKeys = ['font-sans'];

  const variableKeys = [];

  prefixes.forEach(prefix => {
    variableKeys.push(`--${prefix}`);
    for (let level = 10; level <= 100; level += 10) {
      variableKeys.push(`--${prefix}-${level}`);
    }
  });

  fontKeys.forEach(key => variableKeys.push(`--${key}`));

  return variableKeys;
};

export default {
  install(app) {
    const cssVariableKeys = generateCssVariableKeys();

    const cssVariables = reactive({});
    let hasInitialized = false;

    /** 從 :root 讀取 design token 的 computed value。 */
    const getCSSVariables = () => {
      const rootStyles = getComputedStyle(document.documentElement);
      const variables = {};

      cssVariableKeys.forEach(key => {
        variables[key] = rootStyles.getPropertyValue(key).trim();
      });

      return variables;
    };

    /** 首次呼叫時載入 token；重複呼叫不重新讀取 DOM。 */
    const initialCSSVariables = () => {
      if (!hasInitialized) {
        Object.assign(cssVariables, getCSSVariables());
        hasInitialized = true;
      }
    };

    app.provide('cssVariables', cssVariables);
    app.provide('initialCSSVariables', initialCSSVariables);
  }
};
