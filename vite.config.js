import path from 'path';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import { ViteEjsPlugin } from 'vite-plugin-ejs';
import eslint from 'vite-plugin-eslint';
import tailwindcss from '@tailwindcss/vite';

// prototype 專用：
// 不支援 vite build／多頁面 workspace，只支援 serve:prototypes，只使用 .mock.js 檔案。
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VUE_APP_');

  return {
    appType: 'spa',
    plugins: [
      vue(),
      tailwindcss(),
      eslint(),
      ViteEjsPlugin({
        ...env,
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
      extensions: ['.ts', '.tsx', '.mjs', '.mock.js', '.js', '.jsx', '.json', '.vue']
    },
    envPrefix: 'VUE_APP_',
    server: {
      port: env.VUE_APP_PORT || 8787,
      hmr: { overlay: false }
    }
  };
});
