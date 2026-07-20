# /prototype — 產畫面指令

依 `docs/design-system.md` 產出可本機預覽的 prototype 畫面。使用者不熟程式與版本控管，Claude 負責環境、產出與預覽。

> **執行位置**：工作目錄（本指令隨 `prototype/base` 分支交付，由 `/prototype-init` 初始化）。改既有頁或需引用產品檔時，另掛**來源** 104-f2e-tag-service（唯讀）。
>
> **前置需求**：第 4 步參考外部頁、第 5 步預覽需 Chrome 擴充（`claude-in-chrome`），每人各自安裝登入。

## 使用方式

```text
/prototype <需求描述>
```

文字與附圖都是需求；一次可多頁；可能是新畫面或改本專案既有頁（第 4 步分流）。

## 全程規則

- `bash`／`js` 區塊為 Claude 自行執行，不對使用者顯示；只有標示「回報使用者」「詢問使用者」的區塊才輸出。
- 對使用者平實用語，不出現 git、branch、commit、push、PR、lab、terminal、pnpm 等字眼；失敗時說明問題與建議，不貼原始錯誤。
- 只在需要使用者判斷時停下：名稱無法推導、有內容遺失風險、系統要求權限。
- 來源只讀不寫（fetch／checkout／pull 不算寫入）；所有寫入都在工作目錄。規範文件讀工作目錄那份。

## 流程

`1 命名 → 2 整理狀態 → 3 讀規範 → 4 製作（4.5 搬依賴）→ 5 預覽驗證 → 5.5 保存交付 → 6 記錄`

### 第 1 步 — 確認畫面名稱

- `<page-name>`：小寫英文、數字、連字號（「標籤列表頁」→ `tag-list`）。
- `<work-name>`：工作分支 `prototype/<work-name>`；單頁可＝`<page-name>`，多頁代表整組需求。
- 每頁中文名稱。

推導得出，回報使用者：

```text
我會製作以下畫面：

| page-name | 路由 | 畫面名稱 |
| --- | --- | --- |
| <page-name> | #/<page-name> | <中文畫面名稱> |

接著我會先整理本機狀態，確保這次畫面從最新專案內容開始。
```

推導不出，詢問使用者（一次問齊）：

```text
請提供每個畫面的英文短名稱，例如 tag-list、tag-detail。名稱只使用小寫英文、數字與連字號。
```

### 第 2 步 — 整理工作目錄狀態

```bash
git rev-parse --is-inside-work-tree 2>/dev/null   # true = repo，否則純資料夾
```

**純資料夾**：跳過本步。

**repo** 一次取得所有狀態：

```bash
git fetch && {
  echo "== base ==";     git ls-remote --heads origin prototype/base   # 無輸出 = 尚未初始化
  echo "== changes ==";  git status --short
  echo "== branch ==";   git status -sb
  echo "== unpushed =="; git log --oneline @{u}..HEAD 2>/dev/null
}
```

- 遠端無 `prototype/base` → **停止**，回報：這個資料夾還沒準備好工作環境，請先執行 `/prototype-init`。
- 有未 commit 變更、或未 push 的 commit → 詢問使用者；否則直接「建立工作分支」。

```text
偵測到目前的畫面還沒整理完，或還沒建立可交付的連結。這次要如何處理？

1. 接續上次內容：保留目前狀態，直接繼續做。
2. 先保存再開始：把目前內容保存起來，讓之後仍找得到，再開始這次的新畫面。
3. 不保留、重新開始：放棄目前內容，從最新專案內容重新開始。
```

- 選 1：留原分支，跳過「建立工作分支」，先做「同步 `prototype/base`」。
- 選 2：比照第 5.5 步保存並回報連結，再建立工作分支。
- 選 3：先確認下句，再 `git checkout -- . && git clean -fd`，再建立工作分支。

  ```text
  這會放棄目前尚未整理完的內容，而且無法復原。請確認是否要重新開始。
  ```

**建立工作分支**：

```bash
git checkout -b prototype/<work-name> origin/prototype/base
```

同名已存在 → `git checkout prototype/<work-name>` ＋「同步 `prototype/base`」；既有內容與需求明顯不同時先詢問沿用或改名。

**同步 `prototype/base`**（選 1 或沿用既有分支時做；新分支免）。用 merge 不用 rebase（分支已是交付連結）：

```bash
git fetch
git merge --no-edit origin/prototype/base
```

衝突 → `git merge --abort`，平實告知與其他已交付畫面改到同處，詢問先保存再處理、或暫不同步。

**`prototype/base` 過期提示**（有掛來源才做）：

```bash
git show origin/prototype/base:.prototype-base-source
git -C <來源> fetch && git -C <來源> rev-parse origin/lab
```

兩者不同 → 提示使用者（不強制）：

```text
專案內容已有更新。要以最新內容為基礎製作畫面，可先執行 /prototype-init 更新工作環境；也可以直接沿用目前版本繼續。
```

### 第 3 步 — 設計規範

完整讀取 `docs/design-system.md` 並絕對遵守，不得憑記憶、摘要或片段判斷。

### 第 4 步 — 製作畫面

**分流**

- 需求對應**產品既有頁**（`<來源>/src/pages/tag-service/router/` 或 `views/` 找得到）→ **A**。
- 從零、或參考外部畫面 → **B**。判斷不出先問。
- 走 A（或需引用產品檔）而來源未掛 → 停下：

  ```text
  這個畫面需要參考正式專案的內容，請把 104-f2e-tag-service 專案也連結進來後再繼續。
  ```

**共通**

- 產出只寫 `prototypes/views/<page-name>/`：`index.vue`（必須）、拆出的 `.vue` 子元件、`spec.md`（必須，見「頁面規格」）；引用的產品檔由 4.5 解析器搬，不手動。
- 拆小元件放本頁資料夾、相對路徑引用，不進 `src/`。

**A 改既有頁**

- 複製正式頁 `.vue` → `prototypes/views/<page-name>/index.vue`。
- 沿用原頁（mock、store、router、`@/` import 不改），只改要求處＋prototype 環境必要的最小調整。
- 狀態沿用原頁資料流；要讓 PM 切換預覽時比照「狀態呈現」。

**B 從零**

- 需求、附圖、網址只當設計依據，不抄碼。
- 參考外部網址：claude-in-chrome 開啟（沿用登入狀態），逐一確認功能與互動（含點選、hover）後重新切版。
- 假資料與邏輯寫本頁資料夾；不串 API、不引用 store、不用正式 router。

**狀態呈現**（多狀態才做）：頁面讀注入值渲染，並具名匯出供 PrototypeIndex 列連結：

```vue
<script>
export const states = [
  { value: 'normal', label: '正常' },
  { value: 'empty', label: '無資料' }
];
</script>

<script setup>
import { inject, ref } from 'vue';

const viewState = ref(inject('prototypeInitialState', 'normal'));
</script>
```

未宣告 `states` 用 PrototypeIndex 預設；空陣列不列連結。

**頁面規格 `spec.md`**（每頁必產；初次產出即寫，後續調整同步更新）：供 `/prototype-figma` 精準轉出，不必回頭從 `.vue` 推導。格式：

```markdown
# <page-name> — <中文畫面名稱>

- 需求：<一句摘要>
- 分流：A（改自 <來源檔路徑>）｜B 從零
- 狀態：normal（預設）、<state>（#/<page-name>?state=<state>）…

## 版面結構

<由外而內的區塊樹，每個區塊標容器 class 與內含元件>

## 元件清單

| 元件 | 來源 | 用途與 variant |
| --- | --- | --- |
| <名稱> | 共用（src/…）｜antd 原生｜本頁自訂 | <用途、variant、size 等> |

## 互動流程

| 操作 | 結果畫面 | 建議 frame |
| --- | --- | --- |
| <觸發> | <畫面變化，含 modal、notification 等瞬時 UI> | <page-name> — <名稱>｜— |

## 顯示文字

<畫面實際顯示的關鍵字面與假資料>
```

### 第 4.5 步 — 搬入頁面依賴（需掛來源）

```bash
node .claude/commands/scripts/prototype-resolve-deps.mjs \
  --src <來源路徑> --dest . \
  prototypes/views/<page-name>/index.vue   # 多頁時每張都列上
```

- 解析器：`.mock.js` 優先、bare 套件交 pnpm、已存在不覆蓋、只寫 `src/`；只跟靜態 import。
- 有未解析項或預覽「找不到模組」→ 查 import 路徑、必要時回報工程，不臆造檔案；B 未引用產品檔可跳過本步。

### 第 5 步 — 預覽與驗證

```bash
bash .claude/commands/scripts/start-prototype-server.sh
```

失敗 → `corepack enable pnpm && pnpm install` 重試一次；仍失敗平實回報、暫停。

逐頁開 `http://localhost:<port>/templates/prototypes/index.html#/<page-name>`，驗證（有問題先修再繼續）：

| 檢查 | 方式 |
| --- | --- |
| 符合需求 | 每項需求與互動無遺漏、無多做 |
| 設計規範 | `prototype-design-reviewer` subagent（見下） |
| 樣式生效 | 元素 computed style 確認 utility 未被 `.ant-*` 蓋掉 |
| 視覺品質 | 截圖目視間距、對齊、層級；避免整面白底灰框 |
| lint | 無錯誤與警告 |

- **subagent 審查**：頁面可載入後啟動 `prototype-design-reviewer`，傳入頁面資料夾路徑、需求摘要、各頁分流 A／B；與瀏覽器檢查**並行**。回報的違規逐項確認後修正；規範明列例外可略過，「待確認」查規範原文再定。
- **驗證分級**：完整驗證只做本次新寫或有改動的頁；與已驗證交付版完全相同的頁只做輕量檢查（載入＋console 無錯誤＋截圖目視）。
- **瀏覽器紀律**：連續操作、只在需斷言的節點取 snapshot；截圖與暫存檔放系統暫存目錄（scratchpad）。

完成後開列表頁 `#/`（PrototypeIndex）給使用者，回報：

```text
畫面已開啟，可以檢視並提出需要調整的地方。
```

### 第 5.5 步 — 保存並提供交付連結（純資料夾跳過）

```bash
git add -A
if [ -n "$(git status --porcelain)" ]; then
  git commit -m "prototype: <work-name>"
fi
git push -u origin prototype/<work-name>
```

**合回 `prototype/base`**（讓之後的新分支帶著已交付頁面；`prototype/base` 重建時不保留，舊內容在封存分支）：

```text
base ──A──B                base ──A──B──E
        \                          \
work     C──D              work     C──D
（base 無新交付：fast-forward）   （分岔：退回合併流程）
```

先試一行 fast-forward 推送：

```bash
git push origin prototype/<work-name>:prototype/base
```

被拒（分岔）→ 退回合併流程：

```bash
git checkout prototype/base
git pull --ff-only origin prototype/base
git merge --no-edit prototype/<work-name>
git push origin prototype/base
git checkout prototype/<work-name>
```

合併衝突 → `git merge --abort`，照常交付工作分支連結，平實回報這次畫面暫未併入共同的畫面環境、之後的新畫面不會自動帶到它。

交付連結（GitHub 慣例）：

```bash
REMOTE_URL=$(git remote get-url origin)
BRANCH_URL=$(echo "$REMOTE_URL" | sed -E 's#^git@([^:]+):#https://\1/#; s#\.git$##')/tree/prototype/<work-name>
```

回報使用者（不開 PR，此連結即交付對象）：

```text
這次的畫面已經保存好，可以此交付工程：
<BRANCH_URL>
```

### 第 6 步 — 記錄本次 prototype（每頁一列）

更新 `prototypes/prototype-log.md`：日期用今天、名稱同第 1 步；同名 `page-name` 更新該列不重複新增；「是否轉 Figma」記「否」，之後由 `/prototype-figma` 回填。

```markdown
| 日期 | page-name | 畫面名稱 | 是否轉 Figma | 需調整 Figma 原因 |
| --- | --- | --- | --- | --- |
| <今天日期> | tag-list | 標籤列表 | 否 | — |
```

**純資料夾**：直接寫檔。**repo**：清單只在主線，用臨時 worktree（不動目前分支與工作樹）：

```bash
MAIN=$(git remote show origin | sed -n 's/.*HEAD branch: //p')
WT=$(mktemp -d)
git worktree add --detach "$WT" "origin/$MAIN"

for i in $(seq 1 5); do
  git -C "$WT" fetch origin "$MAIN"
  git -C "$WT" reset --hard "origin/$MAIN"
  # 依上方規則寫入 $WT/prototypes/prototype-log.md
  git -C "$WT" add prototypes/prototype-log.md
  git -C "$WT" commit -m "prototype: 記錄 <page-name>"
  git -C "$WT" push origin HEAD:"$MAIN" && break   # 失敗 = 他人先寫入，重來
done

git worktree remove --force "$WT"
```

5 次仍失敗或讀寫失敗 → 平實告知「這次沒能存到紀錄，可以稍後再試一次」，不中斷主流程。

### 後續調整

同一段對話的後續描述＝調整已確認頁面；指定某頁只改該頁。仍遵守規範與第 4 步；改動頁面同步更新該頁 `spec.md`；新增 import 重跑 4.5，再重新整理預覽。使用者確認完成 → 重做 5.5 並回報最新連結。

`.vue` 已足以交付即完成；要探索版面、或讓非工程的人在 Figma 上討論，才用 `/prototype-figma` 轉出。
