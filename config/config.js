import path from 'node:path';
import deepMerge from 'deepmerge';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';
import rewriteManifestPlugin from '../plugins/rewriteManifest.js';
import moveOutputHtml from '../plugins/moveOutputHtml.js';
import removeCrossorigin from '../plugins/removeCrossorigin.js';

// local=1 時產出可直接以檔案協定開啟的路徑。
const local = process.env.local === '1';

// Rollup 依副檔名將非 JS 產物分派至固定子目錄。
const assetsSubdirectories = [
  { dir: 'css', ext: [/\.css$/] },
  { dir: 'img', ext: [/\.png$/, /\.jpeg$/, /\.gif$/, /\.svg$/, /\.webp$/] },
  { dir: 'fonts', ext: [/\.woff$/, /\.woff2$/, /\.eot$/, /\.ttf$/, /\.otf$/] },
  { dir: 'media', ext: [/\.mp4$/, /\.webm$/, /\.ogv$/, /\.mp3$/, /\.wav$/, /\.flac$/, /\.aac$/] }
];

/**
 * 依 workspace 與 command 組出 Vite 設定。
 * serve／build 套用各自設定後，再與呼叫端傳入的 config 深層合併。
 */
export default class Config {
  constructor({ env = process.env, config = {}, command = '', workspace = {}, mode = '' } = {}) {
    this.env = env;
    this.rawViteConfig = config;
    this.command = command;
    this.workspace = workspace;
    this.mode = mode;
    this.publicPath = this.workspace.publicPath?.(this.config) || '/';
    workspace.singleFile && (this.pageIndex = process.env.pageIndex || 0);
  }

  /* --------------------------------------------
     Vite serve 與 build
  --------------------------------------------- */
  /** 將呼叫端 Vite config 與目前 command 的設定合併，陣列內容保留兩側項目。 */
  get viteConfig() {
    const base = this.rawViteConfig;
    const envConfig = this.command === 'serve' ? this.serve : this.build;
    return deepMerge(base, envConfig, {
      arrayMerge: (target, source) =>
        Array.isArray(target) && Array.isArray(source) ? [...target, ...source] : source
    });
  }

  /** 開發伺服器沿用 workspace 輸出路徑，lab 模式保留 sourcemap。 */
  get serve() {
    return {
      build: {
        outDir: this.workspace.outputPath,
        sourcemap: this.mode === this.config.env.lab,
        rollupOptions: {
          output: this.rollupOutput
        }
      }
    };
  }

  /** 依 workspace.singleFile 選擇單頁 UMD 或多頁 build 設定。 */
  get build() {
    return deepMerge(
      this.sharedConfig,
      this.workspace.singleFile ? this.buildSingle : this.buildMulti
    );
  }

  /** 單頁與多頁 build 共用的輸入、輸出與 sourcemap 設定。 */
  get sharedConfig() {
    return {
      build: {
        sourcemap: this.mode === this.config.env.lab,
        outDir: this.workspace.outputPath,
        copyPublicDir: false,
        modulePreload: this.workspace.modulePreload || false,
        rollupOptions: {
          input: this.rollupOptionsInput,
          output: this.rollupOutput
        }
      }
    };
  }

  /** 單頁模式只輸出目前 pageIndex 的 UMD JS，CSS 由 JS 注入。 */
  get buildSingle() {
    const page = this.workspace.pages?.[this.pageIndex];
    return {
      base: this.publicPath,
      build: {
        minify: this.config.env.current === this.config.env.prod,
        emptyOutDir: this.pageIndex == 0,
        cssCodeSplit: false,
        rollupOptions: {
          input: page?.entry,
          output: {
            format: 'umd',
            entryFileNames: path.join(this.workspace.jsPath, `${page?.chunkName}.js`)
          }
        }
      },
      plugins: [cssInjectedByJsPlugin()]
    };
  }

  /** 多頁模式處理 manifest、HTML 移動與 crossorigin 清理。 */
  get buildMulti() {
    const { workspace } = this;
    return {
      base: this.publicPath,
      build: {
        minify: this.config.env.current === this.config.env.prod,
        manifest: workspace.manifest || false,
        rollupOptions: {
          output: {
            ...this.rollupOutput,
            manualChunks: this.manualChunks
          }
        }
      },
      plugins: [
        ...(workspace.manifest ? [rewriteManifestPlugin({ ...workspace, env: this.env })] : []),
        moveOutputHtml(workspace),
        removeCrossorigin()
      ]
    };
  }

  /* --------------------------------------------
     Rollup 輸入與輸出
  --------------------------------------------- */
  /** 依產物副檔名決定 hashed JS、CSS、圖片、字型與 media 路徑。 */
  get rollupOutput() {
    return {
      entryFileNames: path.join(this.workspace.jsPath, '[name].[hash].js'),
      chunkFileNames: 'assets/js/[name].[hash].js',
      assetFileNames: asset => {
        let subDir = '';
        for (const dir of assetsSubdirectories) {
          if (dir.ext.some(ext => asset.name.match(ext))) {
            subDir = dir.dir;
            break;
          }
        }
        return path.join(
          this.workspace.assetsPath,
          `${subDir ? `${subDir}/` : ''}[name].[hash][extname]`
        );
      }
    };
  }

  /** SPA 使用單一 index template，多頁模式以 page name 建立輸入 mapping。 */
  get rollupOptionsInput() {
    if (this.workspace.spa) {
      return this.workspace.pages.reduce((acc, cur) => {
        acc['index'] = cur.template;
        return acc;
      }, {});
    } else {
      return this.workspace.pages.reduce(
        (acc, cur) => {
          acc[cur.name] = cur.template;
          return acc;
        },
        {
          main: path.resolve(__dirname, '../index.html')
        }
      );
    }
  }

  /** 將 workspace 指定套件拆成獨立 chunk，其餘依賴集中至 chunk-vendors。 */
  get manualChunks() {
    const base = 'node_modules/';
    const vendors =
      this.workspace.chunkVendors?.map(pkg => ({
        package: pkg,
        path: `${base}${pkg}/`
      })) || [];

    return id => {
      if (!id.includes(base)) return;
      const match = vendors.find(v => id.includes(v.path));
      return match ? match.package : 'chunk-vendors';
    };
  }

  /* --------------------------------------------
     執行環境
  --------------------------------------------- */
  /** 正規化 CDN path、環境名稱、workspace 與 preview 設定。 */
  get config() {
    return {
      path: {
        publicPath: local ? '/' : this.env.VUE_APP_CDN_URL
      },
      env: {
        current: this.env.VUE_APP_ENV,
        dev: 'development',
        lab: 'lab',
        staging: 'staging',
        prod: 'production'
      },
      workspace: {
        current: process.env.workspace || 'dev'
      },
      preview: {
        status: this.command === 'build' && process.env.PREVIEW === '1',
        project: process.env.PROJECT_DIR || ''
      }
    };
  }
}
