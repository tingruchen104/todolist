/** 將本機 `/api` 與 `/jb` request 代理至環境檔指定的後端及主站。 */
module.exports = function (env) {
  return {
    '^/api': {
      target: env.VUE_APP_PROXY_API,
      changeOrigin: true
    },
    '/jb': {
      target: env.VUE_APP_PROXY_JB,
      changeOrigin: true
    }
  };
};
