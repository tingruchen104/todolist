# UI 設計準則

本文件是本 repo 的 UI 切版準則，適用於新增或調整 UI 畫面，目的是讓產出的畫面與既有畫面一致。色彩、尺寸、樣式與用語的實際值皆定義於程式碼，本文只說明原則與查找方式；文件與程式碼不一致時，以程式碼、相同情境的既有頁面與既有元件為準。

本專案 UI 由 Ant Design Vue、Ant Design Vue 的 theme token、CSS Variables 與 Tailwind CSS 構成。各節在有需要時先列來源（值定義於何處）與查找指令，再列規則。

## 基本原則

1. 元件依序選用：repo 既有元件 > Ant Design Vue 原生元件 > 自行新增元件。動手前須逐一對照既有元件，見「元件使用／動手前先對照（必做）」。
2. 色彩、字型、陰影、圓角、間距一律取自既有 CSS Variables、theme token 與 Tailwind，不自行建立新視覺規格。
3. Ant Design Vue 元件的樣式由 theme token、`src/plugins/`、`ConfigProvider.vue`、`antdv.css` 與 Tailwind utility 共同決定。
4. 畫面 layout 與局部排版使用 Tailwind utility。
5. 元件變體優先使用既有 `v-variant`，不敷使用時才新增。
6. 圖示沿用既有的 `104-f2e-designer-icons`（`jb_icon_`）、`is-104icon` 與 Ant Design Vue icon。
7. 共用視覺規格集中定義於來源檔，不分散寫在個別畫面。

## 設計基調

來源：[`base.css`](../src/assets/styles/base.css)、[`theme.js`](../src/assets/theme/theme.js)。

本產品為以表單與資料操作為主的後台。新增或調整畫面時，依下列視覺基準對齊：

- 主要強調色只有品牌橘 `--color-primary`，用於主要按鈕、選取與作用中狀態、區塊標題等；其餘一律以中性色處理。success、error、warning、info 與連結色僅用於對應語意情境，不作裝飾。
- 善用 primary 色階做出層次與群組，避免整面白底加灰框的單調版面。
- 中性色為冷調藍灰，文字與背景、邊框的層次以色階區分，不臨時調色。
- 造型扁平，僅用單層淺陰影（`--shadow`）與小圓角，不使用圖片、漸層、材質或插畫。
- 版面密度偏高，同列控件取相同高度，區塊間距規律。

## 色彩、狀態與動效

來源：

- [`theme.js`](../src/assets/theme/theme.js)：色階與狀態用色 token、`motionDuration*`。
- [`antdv.css`](../src/assets/styles/antdv.css)：狀態樣式與 variant。
- [`tailwind.css`](../src/assets/styles/tailwind.css)：`--ease-ant` 等 transition 設定。

查找：

```bash
rg -n "colorPrimary|colorError|controlOutline" src/assets/theme/theme.js
rg -n "hover:|active:|disabled|outline|variant=" src/assets/styles/antdv.css
rg -n "motionDuration|--ease" src/assets/theme/theme.js src/assets/styles
```

### 色彩與色階

每個色系（primary 與 success、error、warning、info）皆為 `-10`（最淺）至 `-100`（最深）的連續色階。各狀態用哪一階由 `theme.js` 的語意 token 決定，不由畫面自選：hover、active、focus、tint 底分別對應 `colorPrimaryHover`、`colorPrimaryActive`、`controlOutline` 等，語意色另有 text、border、bg 系列 token。取色一律依語意選用對應 token，不寫色碼，也不自行指定色階號。

### 文字色階

文字色取自語意化 utility，依主次分層，不把大面積內文預設為最深的黑：

- 主要內容、需要強調處用 `text-heading`（--color-black-80）。
- 一般內文與輔助資訊用 `text-label`（--color-black-60）；更弱的說明用 `text-secondary`（--color-black-50）、`text-tertiary` 以下。
- 最深的 `text-foreground`（--color-black-100）只保留給少數必須最突出的重點，不當作預設內文色。
- 同一區塊內以色階拉出主次（如清單、表格：主要識別欄較深、其餘欄位較淺），不臨時改字色。

### 互動狀態

hover、active、focus、disabled、error 的樣式由既有 token 與 `antdv.css` 統一定義，新畫面直接套用：

- hover 較常態淺一階，active 深一階，元件不縮放。
- focus 沿用既有樣式；需要橘色 tint 外框時，使用既有 `outline` variant。
- disabled 套用 disabled 的底色與字色；error 為紅色外框，並在欄位下方顯示紅色訊息。
- 新增狀態時，以既有語意 token（`colorXxxHover`、`colorXxxActive`、`colorXxxBorder`、`colorXxxBg`）表達。

### 動效

動效一律沿用既有 transition：`theme.js` 的 `motionDuration*`、Tailwind 的 `--ease-ant`，或 repo 已使用的時長，不自訂新的時長或曲線：

- 僅用於必要回饋，例如 hover 變色、展開收合、淡入淡出、下拉箭頭轉向。
- 不使用裝飾性、循環或彈跳動效。
- 需自訂時使用 Vue transition，時長比照既有。

## 間距與版面

來源：

- 間距：Tailwind 預設 spacing 級距（本專案未自訂）。
- 控件尺寸、圓角、字級：[`theme.js`](../src/assets/theme/theme.js) token。
- 文字層級：[`tailwind.css`](../src/assets/styles/tailwind.css) 語意化 utility。

查找：

```bash
rg -n "controlHeight|borderRadius|fontSize|lineHeight" src/assets/theme/theme.js
rg -n "@theme|--shadow" src/assets/styles
```

間距、控件高度、圓角與字級皆有既定刻度，版面一律對齊，不臨時湊數字。內容區為單欄、固定寬度，兩側保留頁面 gutter。

### 間距刻度

- 相鄰的區塊、控件、元素之間一律留出間距，不可貼齊。
- 沿用 Tailwind 預設 4px 級距（`1`=4px、`2`=8px、`3`=12px、`4`=16px……）。
- margin、padding、gap 一律使用 Tailwind 間距 utility（`gap-2`、`p-4`、`mt-3`），不以 arbitrary value 產生刻度外數值。
- 同一畫面維持一致節奏：相鄰區塊用同一階間距，容器內距統一（如卡片內 `p-4`、區塊間 `gap-4`）。
- 區塊間距交給容器，不要把 margin utility 直接掛在 Ant Design Vue 元件根節點（如 `a-alert`、`a-input`）。Ant Design Vue 樣式於 runtime 注入、載入順序在 Tailwind 之後，特異度相同時 `.ant-*` 會覆蓋 `mb-4`、`mt-3` 等 margin；改由父層 flex `gap-*`，或在外層純 HTML 元素上設 margin。

### 控件尺寸與圓角

- 控件高度、圓角與字級以 `theme.js` token 為準，不在單一畫面硬寫尺寸：
  - 高度：`controlHeight` / `controlHeightLG` / `controlHeightSM` / `controlHeightXS`。
  - 圓角：`borderRadius` / `borderRadiusLG` / `borderRadiusSM`。
  - 字級：`fontSize`、`fontSizeSM`、`fontSizeLG`；標題另見 `fontSizeHeading*`。
- 同一列並排的控件（搜尋框、下拉、按鈕）取相同高度階並對齊基線。

### 版面密度

- 表格、卡片、清單等容器的內距與列高沿用元件預設與 `theme.js`，需調整時使用 token 與間距 utility。
- 文字主次以語意 utility（`text-heading`、`text-label`、`text-secondary`……）區分，不臨時改字級或顏色。

## 樣式取用

來源（依優先順序）：

1. [`base.css`](../src/assets/styles/base.css)：root CSS Variables。
2. [`tailwind.css`](../src/assets/styles/tailwind.css)：Tailwind theme 與語意化 utility。
3. [`theme.js`](../src/assets/theme/theme.js)：Ant Design Vue theme token。
4. [`ConfigProvider.vue`](../src/components/shared/ConfigProvider.vue)：Ant Design Vue theme provider。
5. [`antdv.css`](../src/assets/styles/antdv.css)：Ant Design Vue 元件覆寫與 variant。
6. [`src/plugins/`](../src/plugins/)：Ant Design Vue 預設 props、feedback icon、CSS Variables 對應 theme token 等專案層設定。

查找：

```bash
rg -n "@theme|@utility|--color|--font|--shadow|--blur" src/assets/styles
```

套用樣式時依此順序：Ant Design Vue 官方 props、既有 `v-variant`、`tailwind.css` 語意化 utility、Tailwind 原生 utility、`var(--...)` CSS Variables、集中樣式檔中的 `@apply`。

`@apply` 只用於集中樣式檔（如 `antdv.css`）。SFC 的 `<style>` 不可用 `@apply`：Tailwind v4 在 SFC 脈絡不認得語意／自訂 utility（如 `text-label`、`bg-page`），會噴 `missing @reference` 並使該頁編譯失敗、畫面全白。SFC 內改用 template 的 utility class，或 `<style>` 裡的 `var(--...)` CSS Variables。

避免：

- 在 `.vue` 硬寫 hex、rgb、hsl 色碼。
- 在 `.vue` 自訂陰影、圓角、字體。
- 為單一畫面大範圍覆寫 `.ant-*`。
- 以 Tailwind arbitrary value 建立新視覺規格。
- 將可共用樣式寫死在單一畫面。

arbitrary value 僅在對齊 Ant Design Vue 內部 DOM、計算型 layout，或 Tailwind 無對應 utility 時局部使用，並比照 repo 既有寫法。

### 確認樣式生效

新增或調整畫面後，確認設定的 Tailwind utility 是否如期生效，不假設寫了 class 就會套用。Ant Design Vue 樣式於 runtime 晚於 Tailwind 載入，同特異度時 `.ant-*` 會覆蓋 Tailwind——不只 margin，width、尺寸、邊框等皆可能被蓋而失效。以實際畫面或元素 computed style 確認；未生效時改由容器或外層元素承載樣式，必要時以 `!`（important）提升。成因與處理同「間距與版面」對 margin 的說明。

## 元件使用

來源：

- [`components-purpose.json`](./components-purpose.json)：repo 既有 shared／domain 元件的用途索引，以及 Ant Design Vue 原生元件的查找指引。
- [`src/components/`](../src/components/)：通用元件與功能域元件。
- [`src/pages/`](../src/pages/)：實際頁面用法、領域流程與局部 layout pattern。

查找：

```bash
cat docs/components-purpose.json
rg --files src/components
rg -n "<a-[a-zA-Z-]+" src/components src/pages/
rg -n "from ['\"]@/components|components:" src/components src/pages/
```

### 動手前先對照（必做）

切版或調整任何 UI 前，先逐一列出畫面的每個元素，逐項對照 `components-purpose.json` 找出對應的既有元件（`sharedComponents` 優先，同領域再查 `domainComponents`）。有既有元件就用；沒有才降級到 Ant Design Vue 原生元件，最後才自訂。這份對照要在寫 template 前完成，不可先用原生元件寫好再回頭替換。

`components-purpose.json` 是既有元件的唯一索引，每筆的欄位：

- `useWhen`：什麼情境優先用這個既有元件。
- `insteadOf`：此元件取代、不該再直接用的 Ant Design Vue 原生元件（如 `a-select`、h2）；沒有對應原生元件就沒有這個欄位。
- `avoidWhen`：什麼情境不要用，或該改用哪個其他既有元件。

有 `insteadOf` 的元素一律用該既有元件，不直接用被取代的原生元件；索引未涵蓋才視為沒有既有元件。這份索引由 `/components-purpose` 維護（該指令的欄位格式需與此一致）。

### 既有元件

需求符合既有元件時，直接沿用。先從 `components-purpose.json` 的 `sharedComponents` 查起，相同領域流程再查 `domainComponents`；打開元件檔確認 props、slot、event、狀態與 variant，並對照相同情境頁面的用法。不因畫面些微差異就新增功能重疊的平行元件。

### Ant Design Vue 原生元件

repo 沒有合適元件、原生元件足以表達需求時，才用 Ant Design Vue 原生元件，優先使用官方 props（如 `type`、`size`、`disabled`、`status`、`mode`）。有哪些元件可用，依 `components-purpose.json` 的 `antDesignVueReference` 查 `node_modules/ant-design-vue/es/components.js`。

要用某個元件時，先確認它的用法：

- 專案已用過：`rg -n "<a-[a-zA-Z-]+" src/pages src/components`，比照相同情境的頁面。
- 專案沒用過：讀 `node_modules/ant-design-vue/es/<元件>` 的型別（精確對應 pinned 版本），或查官方文件（`antdv.com`，或 context7 `/websites/antdv`，皆為現行 4.x）。

原生元件會自動套用 `theme.js`、`src/plugins/`、`ConfigProvider.vue` 與 `antdv.css` 的專案樣式；`antdv.css` 另以 `[variant='...']` 定義各元件的變體。需要既有樣式未涵蓋的視覺層級或狀態時，先確認有無可套的 variant，再決定是否新增。

### 新增元件

既有元件與原生元件無法合理組合，或需求含可重用的互動邏輯、資料處理、slot 組合時，才新增元件。樣式同樣取自既有 token、Tailwind utility 與 CSS Variables。新增的元件落在 `src/components` 下時，執行 `/components-purpose` 補上 `components-purpose.json` 索引。

## v-variant

來源：

- [`src/directives/variant.js`](../src/directives/variant.js)
- [`src/assets/styles/antdv.css`](../src/assets/styles/antdv.css)

查找：

```bash
rg -n "v-variant|variant=|\\[variant" src/pages src/components src/assets/styles
```

`v-variant` 將專案自訂的樣式變體寫到元件最外層 DOM，由 CSS 透過 `[variant='...']` 套用。取用順序：Ant Design Vue 官方 props、既有 `v-variant`、新增 variant。

```vue
<a-button v-variant="'primary'">主要操作</a-button>
```

按鈕依功能、重要性與狀態選樣式：主要操作用 `primary`，且一個畫面或區塊只突出一個；破壞性操作（刪除等）用 danger／error，其餘語意狀態用對應狀態色（success／warning／info）；次要與一般操作用預設或較低調的樣式，避免多顆按鈕同時搶眼。

新增 variant 時，使用既有 token、Tailwind utility 與 CSS Variables，並以語意或狀態命名。

## 圖示

來源：圖示使用 [104corp/104-f2e-designer-icons](https://github.com/104corp/104-f2e-designer-icons)，以 `jb_icon_` class 套用，可用 class 以 [designer-icons demo](https://f2e.s3.104-dev.com.tw/designer-icons/demo.html) 為準。Ant Design Vue 內建 icon 與 message、notification、modal 的 feedback icon 由專案樣式與 plugin 統一處理。

查找：

```bash
rg -n "jb_icon_" src
rg -n "anticon|is-104icon|antdvFeedbackIcons" src
```

- 未指定圖示時，沿用相同情境的既有圖示。
- 圖示顏色比照所屬情境：按鈕、選項選單等的 icon 取該處的文字或外框色，語意情境取對應狀態色（success／error 等）；其餘用中性灰 `text-quaternary`。
- 需跟隨文字色的圖示用 `jb_icon_` designer 字型；Ant Design Vue icon 經 `antdv.css` 正規化為中性色（部分改以 designer 字符呈現）、不繼承文字色，僅用於中性裝飾情境。
- 不引入其他 icon library。
- 不新增 inline SVG，除非既有圖示無法表達且有明確理由。

## 互動與回饋

來源：

- 回饋與確認：既有頁面的 `message`、`notification`、`Modal.confirm`。
- 載入：`@/components/shared/loading/LoadingOverlay.vue` 與 loading store（`@/stores/loading`）。
- 空狀態：`a-empty`，全域預設文案定義於 [`ConfigProvider.vue`](../src/components/shared/ConfigProvider.vue)。
- 表單驗證：`@/utils/form/validateRules` 與既有 `RULES`。
- 提示（tooltip）：全域 [`FallowTooltip.vue`](../src/components/shared/tooltip/FallowTooltip.vue)，掛載於 `App.vue`。

查找：

```bash
rg -n "message\.|notification\.|Modal\.confirm" src/pages src/components
rg -n "a-empty|LoadingOverlay|useLoadingStore" src
rg -n "validateRules|RULES\." src
```

新畫面的互動與回饋沿用既有頁面做法，不自創流程：

- 回饋通道分工固定：操作成功用 `notification`，即時提示、輸入限制與欄位錯誤用 `message`，刪除等破壞性操作用 `Modal.confirm` 二次確認。
- 載入統一走全域 `LoadingOverlay` 與 loading store，不在單一畫面自製 spinner。
- 無資料時使用 `a-empty`，沿用既有「暫無資料」文案。
- 表單驗證使用既有 `RULES` 與 `validateRules`，錯誤訊息顯示於欄位下方（外觀見「色彩、狀態與動效」的 error 規則）。
- hover 文字提示（如截斷內容顯示全文）在元素掛 `title`，由全域 `FallowTooltip` 統一處理，不使用 `a-tooltip`。

## 文案與用語

文案為後台操作情境：

- 語氣以說明為主、精簡，不帶行銷感。

- 繁體中文（台灣用語）與全形標點，不使用 emoji 與驚嘆號。
- 提示與占位字說明操作方式（如 `請選擇`、`請輸入…`）。
- 回饋訊息平述：成功為確認語句，錯誤直接說明原因。
- 欄位標籤沿用既有「中文 + 英文 key」格式（見 [`formField.js`](../src/pages/tag-service/constants/form/tagForm/formField.js)），英文 key 為小寫 snake_case。
- 領域名詞與按鈕用語與既有頁面一致。

## 版本與外部資源

- [`package.json`](../package.json)：Vue、Ant Design Vue、Tailwind 版本。
- [Ant Design Vue Components](https://antdv.com/components/overview)：Ant Design Vue 元件文件。
