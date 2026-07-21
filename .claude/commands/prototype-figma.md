# /prototype-figma — 轉出 Figma

**`.vue` 已足以交付就不轉**；只在換版面、探索設計方向、或需非工程的人在 Figma 討論時轉出。

**接力棒規則**：轉出並開始在 Figma 手改後，真相來源交棒給 Figma、`.vue` 凍結；未轉出時 `.vue` 是真相。任何時候只編輯持棒那份。

> **執行位置**：同 `/prototype`，工作目錄就地執行，不需掛來源。
>
> **前置需求**：量測與截圖比對需 Chrome 擴充（`claude-in-chrome`），每人各自安裝登入。

## 使用方式

```text
/prototype-figma                                轉出當前對話正在製作的頁面（新建 Figma 檔）
/prototype-figma <page-name>                    轉出指定頁面（新建 Figma 檔）
/prototype-figma <page-name> --url <figma-url>  把畫面寫入已存在的 Figma 檔
```

使用者訊息沿用 `/prototype` 用語原則：平實、不貼原始錯誤。

## 執行流程

### 1. 確定頁面

未給 `<page-name>` → 當前對話正在做的頁；無法判斷 → 問「要轉出哪一個畫面？」。確認 `prototypes/views/<page-name>/index.vue` 存在。

### 2. 轉出

用準確率最高的方式（`figma-generate-design` skill 或 `use_figma`）；`--url` 寫入既有檔，未給則新建。frame 固定 1920×1080、各畫面獨立、串成可點擊 prototype。精修由工程協作，本指令只負責轉換與保留連結。

轉出範圍＝瀏覽器實際渲染的完整畫面，不限 `index.vue` 內容；`App.vue` 等全域疊加元素（Header、FallowTooltip、LoadingOverlay）看得到就一併轉入 frame。

1. `bash .claude/commands/scripts/start-prototype-server.sh`，開 `#/<page-name>` 預覽。
2. 讀 `spec.md`（版面結構、元件、互動流程、建議 frame 即產出依據），對照 `index.vue`；不符以 `.vue` 為準並回填 spec；無 spec 的舊頁讀 `.vue` 盤點並補寫 spec。
3. **量測 computed style（必做，不得省略）**：對每個關鍵元件用 `javascript_tool` 讀 `getComputedStyle`，至少取 `background-color`、`color`、`font-family/weight/size`、`line-height`、`border`、`padding`，含外層容器背景與對齊（`display`、`justify-content`）。antd v4 樣式為 runtime 注入，不得憑預設值或原始碼推測。
4. **token 對應**：量測值對應回 `theme.js` token／CSS Variables，可對應者建 Figma Variable 綁定；對不上用量測值；衝突以量測值為準。
5. 產 frame：先「`<page-name>` — 預設」，再依 spec 互動流程逐一操作、各產一個 frame（依操作命名）。
6. **視覺回歸（每個 frame 必做）**：Figma `get_screenshot` ＋瀏覽器同畫面截圖 diff，超門檻回步驟 3 補值重畫。重點：容器白底、文字深淺、對齊、框線。
7. 依 spec 的 frame 串接關係，用 `use_figma` 接上 prototype 互動連結（觸發元素 → 目標 frame）。

完成後回報 Figma 連結。

### 3. 回填 prototype 清單

目的：蒐集「`.vue` 就夠」vs「需轉 Figma」比例與原因，評估是否建 Figma 元件庫。回報連結後問：

```text
順便記一筆給後續評估用：這頁需要轉出 Figma 調整，缺的是什麼？（顏色間距 / 版面結構 / 互動 / 給其他人自己看）
```

更新 `prototypes/prototype-log.md` 的 `<page-name>` 列：「是否轉 Figma」改「是」、填原因；無該列補一列；一頁一列不重複。欄位判準見 [`prototype-flow-log.md`](../reference/prototype-flow-log.md)。

- **純資料夾**：直接寫檔。
- **repo**：清單只在主線，用臨時 worktree 寫入（作法同 `prototype.md` 第 6 步，commit 訊息改 `prototype-figma: 回填 <page-name>`）。
- 重試 5 次仍失敗 → 平實告知「這次沒能存到紀錄，可以稍後再試一次」，不中斷主流程。
