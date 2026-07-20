# /prototype-figma — 轉出 Figma

**`.vue` 已足以交付時直接交 `.vue`，不轉 Figma**（`.vue` 用真元件產出、保真度最高）。只在需要於原型之外調整時才轉出：換版面、探索多種設計方向，或需其他人（主管、業務、客戶等非工程的人）在 Figma 上討論。

**接力棒規則（真相來源）**：一旦轉出並開始在 Figma 手改，該頁真相來源交棒給 Figma，對應 `.vue` 就地凍結、不再手改；未轉 Figma 時 `.vue` 就是真相。任何時候只編輯持棒的那一份。

> **執行位置**：同 `/prototype`，於工作目錄就地執行，文件內路徑皆相對於此；全程不需掛來源。
>
> **前置需求**：量測 computed style 與截圖比對需 Claude 的 Chrome 擴充（`claude-in-chrome`）；每位使用者各自安裝、無法由 `.mcp.json` 共享，請先在本機安裝並登入。

## 使用方式

```text
/prototype-figma                                轉出當前對話正在製作的頁面（新建 Figma 檔）
/prototype-figma <page-name>                    轉出指定頁面（新建 Figma 檔）
/prototype-figma <page-name> --url <figma-url>  把畫面寫入已存在的 Figma 檔
```

顯示給使用者的訊息沿用 `/prototype` 的用語原則：平實、不貼原始錯誤。

## 執行流程

### 1. 確定要轉出的頁面

- 有給 `<page-name>` → 用該名稱；未給 → 當前對話正在製作的頁面；都無法判斷 → 詢問使用者：「要轉出哪一個畫面？」
- 確認 `prototypes/views/<page-name>/index.vue` 存在。

### 2. 轉出 Figma

用準確率最高的方式產出設計（`figma-generate-design` skill 或 `use_figma`），記下 Figma 連結。轉換品質的精修由工程協作，本指令只負責轉換並保留連結。

- 有 `--url <figma-url>` → 把 frame 寫入該既有檔；未給 → 新建 Figma 檔。
- 每個 frame 固定 1920×1080。
- 各畫面獨立 frame，並串接成可點擊的 Figma prototype。

流程：

1. 啟動預覽服務：執行 `bash .claude/commands/scripts/start-prototype-server.sh`（已在跑會沿用既有網址），開啟 `http://localhost:<port>/templates/prototypes/index.html#/<page-name>`
2. 讀取 `prototypes/views/<page-name>/spec.md`（版面結構、元件清單、互動流程與建議 frame 即為產出依據），並對照 `index.vue` 確認；spec 缺漏或與 `.vue` 不符時，以 `.vue` 為準並回填 spec。無 spec 的舊頁面則讀 `.vue` 盤點所有可觸發不同畫面的 UI 操作（下拉展開、新增 modal、切換 tab 等），並補寫 spec。
3. **量測 computed styles（產 frame 前必做，不得省略）**：對每個關鍵元件（尤其 ant-design-vue 元件：table、button、input、tag、modal…），用 claude-in-chrome 的 `javascript_tool` 讀 `getComputedStyle` 的實際渲染值，至少取 `background-color`、`color`、`font-family`、`font-weight`、`font-size`、`line-height`、`border`、`padding`，以及外層容器背景（如 `.ant-table` 白底掛在容器）與排版對齊（`display`、`justify-content`）。這些值直接提供給 `use_figma`，不得憑元件預設值或原始碼推測——ant-design-vue v4 樣式為 runtime 注入，只有 computed style 拿得到。
4. **對應 token／建 Figma Variables**：把量到的值對應回 `docs/design-system.md` 指向的來源（`theme.js` token、CSS Variables），能對應具名 token 者在 Figma 建立 Variable 並綁定，無法對應者用量測值；兩者衝突時以量測值為準。
5. 先產預設畫面 frame（命名 `<page-name> — 預設`），再依序執行每個 UI 操作、各產一個 frame（依操作命名，如 `<page-name> — 新增 modal`），一律套用量測值與 token 綁定。
6. **視覺回歸比對（每個 frame 產完必做）**：`get_screenshot`（Figma）＋瀏覽器同畫面截圖逐像素 diff，超過門檻就回步驟 3 補值重畫，直到吻合。特別檢查：容器白底、文字深淺（字重/字體）、排版對齊、框線。
7. 全部完成後，用 `use_figma` 依操作邏輯串接 frame 間的 prototype 互動連結（觸發元素 → 目標 frame）。

完成後對使用者回報 Figma 連結。

### 3. 回填 prototype 清單

目的：蒐集「`.vue` 就夠」vs「需轉 Figma」的比例與原因，供評估是否建 Figma 元件庫。由 Claude 代記，使用者無須接觸檔案。

回報連結後先問使用者一題：

```text
順便記一筆給後續評估用：這頁需要轉出 Figma 調整，缺的是什麼？（顏色間距 / 版面結構 / 互動 / 給其他人自己看）
```

拿到回答後更新 `prototypes/prototype-log.md`：找到 `<page-name>` 那一列，「是否轉 Figma」改「是」、填入原因。

- 找不到該列時補一列（日期、page-name、畫面名稱、是否轉 Figma=是、原因）。
- 一頁一列，重跑只更新同一列、不重複新增。
- 欄位意義與回顧判準見 [`.claude/reference/prototype-flow-log.md`](../reference/prototype-flow-log.md)。

**純資料夾**：直接讀寫檔案，不牽涉 git。

**repo**：清單只放主線（寫入方式同 `prototype.md` 第 6 步）。執行前可能停在任何分支，寫完切回：

```bash
CUR_BRANCH=$(git branch --show-current)
MAIN=$(git remote show origin | sed -n 's/.*HEAD branch: //p')

for i in $(seq 1 5); do
  git fetch origin "$MAIN"
  git checkout "$MAIN"
  git reset --hard "origin/$MAIN"
  # 讀取此刻 prototypes/prototype-log.md 最新內容，依上方規則更新這次的列
  git add prototypes/prototype-log.md
  git commit -m "prototype-figma: 回填 <page-name>"
  git push origin "$MAIN" && break
done

git checkout "$CUR_BRANCH"
```

5 次重試仍失敗、或檔案讀寫失敗時，平實告知「這次沒能存到紀錄，可以稍後再試一次」，不中斷主流程、不貼原始錯誤。
