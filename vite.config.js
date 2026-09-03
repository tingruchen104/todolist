import path from 'path';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import { ViteEjsPlugin } from 'vite-plugin-ejs';
import eslint from 'vite-plugin-eslint';
import tailwindcss from '@tailwindcss/vite';

import Config from './config/config.js';
import getWorkspace from './config/workspace.js';
import proxy from './config/proxy.cjs';

export default defineConfig(async ({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VUE_APP_');

  // workspace 決定頁面入口、輸出路徑、vendor chunks 與 public path。
  const workspace = await getWorkspace({ ...env, workspace: process.env.workspace });

  const pages = Array.isArray(workspace.pages) ? workspace.pages : [];

  const config = {
    appType: 'spa',
    plugins: [
      vue(),
      tailwindcss(),
      ViteEjsPlugin({
        ...env,
        title: pages.reduce((acc, cur) => {
          acc[cur.chunkName] = cur.title;
          return acc;
        }, {}),
        appName: pages.reduce((acc, cur) => {
          acc[cur.chunkName] = cur.appName || cur.name;
          return acc;
        }, {}),
        ejs: {
          views: [path.resolve(__dirname, './templates')]
        }
      })
    ],
    resolve: {
      alias: {
        '~': path.resolve(__dirname, './'),
        '@': path.resolve(__dirname, './src')
      },
      // Mock 模式讓無副檔名 import 優先解析同名 .mock.js，再回退正式實作。
      extensions:
        process.env.mock === '1'
          ? ['.ts', '.tsx', '.mjs', '.mock.js', '.js', '.jsx', '.json', '.vue']
          : ['.ts', '.tsx', '.mjs', '.js', '.jsx', '.json', '.vue']
    },
    envPrefix: 'VUE_APP_',
    server: {
      port: env.VUE_APP_PORT || 8787,
      proxy: proxy(env),
      hmr: { overlay: false }
    }
  };

  // 開發時即時顯示 ESLint；build 產物移除 console 與 debugger。
  if (command === 'serve') {
    config.plugins.push(eslint());
  } else {
    config.esbuild = { drop: ['console', 'debugger'] };
  }
  // 合併共用 Vite 設定與 workspace 的 serve／build 差異。
  const fullConfig = new Config({
    config,
    env,
    command,
    mode,
    workspace
  });

  // CI preview 不輸出本機導覽資訊，其他模式顯示 workspace 設定與頁面路徑。
  if (process.env.preview !== '1') {
    import('./config/visual/settings.js').then(({ printSettings }) => {
      printSettings({ workspace, config: fullConfig.config });
    });
    import('./config/visual/path.js').then(({ printPath }) => {
      printPath({ workspace, config: fullConfig.config });
    });
  }

  return fullConfig.viteConfig;
});
