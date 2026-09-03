import theme from '@/assets/theme/theme';

/* --------------------------------------------
   Ant Design Vue theme token
   - theme.js 以 CSS variable 表示 token，ConfigProvider mounted 後才取得實際值
   - 每個 app instance 使用深拷貝，避免跨 workspace 共用物件被改寫
--------------------------------------------- */
export default {
  install(app) {
    const currentTheme = JSON.parse(JSON.stringify(theme));

    /** 將 token 中的 var(--*) 參照替換成 cssVariables plugin 讀到的 computed value。 */
    const updateTokensFromCSS = cssVariables => {
      const updatedTokens = { ...currentTheme.token };

      Object.keys(updatedTokens).forEach(key => {
        const tokenValue = updatedTokens[key];
        if (typeof tokenValue === 'string') {
          const varName = tokenValue.match(/--[\w-]+/);
          if (varName && cssVariables[varName[0]]) {
            updatedTokens[key] = cssVariables[varName[0]];
          }
        }
      });

      currentTheme.token = updatedTokens;

      return { ...currentTheme };
    };

    // provide 供 Composition API 使用，globalProperties 保留既有 Options API 呼叫方式。
    app.provide('updateTokensFromCSS', updateTokensFromCSS);
    app.provide('currentTheme', currentTheme);

    app.config.globalProperties.$updateTokensFromCSS = updateTokensFromCSS;
  }
};
