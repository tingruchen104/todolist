import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import js from '@eslint/js';
import pluginVue from 'eslint-plugin-vue';
import vueParser from 'vue-eslint-parser';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import pluginVitest from '@vitest/eslint-plugin';
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting';

export default defineConfig([
  // 要檢查的檔案範圍
  {
    name: 'app/files-to-lint',
    files: ['**/*.{js,mjs,jsx,ts,tsx,vue}']
  },

  // 全域忽略
  globalIgnores(['**/node_modules/**', '**/dist*/**', '**/coverage/**', '**/*.d.ts']),

  // Vue SFC：外層用 vue-eslint-parser，<script> 交給 TS parser
  {
    name: 'vue-sfc',
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        parser: tsParser,
        extraFileExtensions: ['.vue']
      },
      globals: { ...globals.browser, ...globals.node }
    },
    plugins: {
      vue: pluginVue
    },
    rules: {
      ...pluginVue.configs['flat/recommended'].rules
    }
  },

  // TypeScript 檔
  {
    name: 'ts',
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module'
      },
      globals: { ...globals.browser, ...globals.node }
    },
    plugins: {
      '@typescript-eslint': tseslint
    }
  },

  // JavaScript 檔
  {
    name: 'js',
    files: ['**/*.{js,mjs,jsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.node }
    }
  },

  // ESLint 官方 JS 推薦
  js.configs.recommended,

  // Vitest 測試
  {
    name: 'vitest',
    files: ['src/**/__tests__/*', 'src/**/__tests__/**/*'],
    ...pluginVitest.configs.recommended
  },

  // 跳過與 Prettier 衝突的規則
  skipFormatting,

  // 通用規則（語法/邏輯為主，不碰格式）
  {
    name: 'rules/common',
    plugins: {
      'vue': pluginVue,
      '@typescript-eslint': tseslint
    },
    rules: {
      'prefer-template': 'error',
      'camelcase': 'warn',
      'no-var': 'error',
      'no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_', // 忽略底線開頭的函式參數（_info, _file）
          varsIgnorePattern: '^_', // 忽略底線開頭的一般變數（_foo）
          caughtErrorsIgnorePattern: '^_' // 忽略 try...catch 裡的 _error
        }
      ],
      'no-console': ['warn', { allow: ['warn', 'error'] }],

      // Vue 規則（依需求調整）
      'vue/require-default-prop': 'off',
      'vue/multi-word-component-names': 'off',

      // TS 規則
      '@typescript-eslint/no-explicit-any': 'off'
    }
  }
]);
