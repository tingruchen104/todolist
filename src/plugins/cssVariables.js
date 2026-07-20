import { reactive } from 'vue';

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
    if (prefix === 'color-background') variableKeys.push('--color-background');
    else if (prefix === 'color-foreground') variableKeys.push('--color-foreground');
    else {
      variableKeys.push(`--${prefix}`);
      for (let i = 10; i <= 100; i += 10) {
        variableKeys.push(`--${prefix}-${i}`);
      }
    }
  });

  fontKeys.forEach(key => variableKeys.push(`--${key}`));

  return variableKeys;
};

export default {
  install(app) {
    const cssVariableKeys = generateCssVariableKeys();

    const cssVariables = reactive({});
    let hasInitialized = false; // 用於追蹤是否已執行過

    const getCSSVariables = () => {
      const rootStyles = getComputedStyle(document.documentElement);
      const variables = {};

      cssVariableKeys.forEach(key => {
        variables[key] = rootStyles.getPropertyValue(key).trim();
      });

      return variables;
    };

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
