import theme from '@/assets/theme/theme';

export default {
  install(app) {
    const currentTheme = JSON.parse(JSON.stringify(theme));

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

    app.provide('updateTokensFromCSS', updateTokensFromCSS);
    app.provide('currentTheme', currentTheme);

    app.config.globalProperties.$updateTokensFromCSS = updateTokensFromCSS;
  }
};
