# CLAUDE.md

本文件為專案開發規範及 AI 開發工具的主要指令來源。新增、重構與 review 程式碼時，應以本文件為準，並依需求與鄰近程式補充判斷。

文件、程式碼、註解、UI 文案與錯誤訊息均應使用中性、專業且直接的語氣，僅保留理解與使用功能所需的內容。產出內容應呈現完整的最終狀態，不得包含對話語句、需求討論、修改歷程、暫時方案、註解掉的程式或未使用程式碼。

## 開發前定位

- 套件管理與 script 執行統一使用 pnpm；pnpm 版本與 Node.js 範圍以 `package.json` 的 `packageManager`、`engines` 為準。
- 執行開發指令前應讀取 `package.json` 的 scripts，並依實際 workspace 選擇 serve、mock、build、lint 與 format 指令。
- Workspace 應由需求及相對於目標 base branch 的 diff 確認，再定位 `templates/<workspace>/`、頁面 entry、route 與實際 URL。
- 開發前應依頁面結構、資料流程與互動行為搜尋相近的既有頁面或功能，並以責任最接近的實作作為程式分層、元件使用、程式順序與樣式寫法的參考。
- 新增 workspace 入口或完整頁面骨架時，應先讀取 `_templates/page/new/`，並透過 `pnpm hygen:new-page` 產生既有的 API、View、Router、config、entry 與 HTML 結構。
- 應從變更檔的 imports、exports、route、API 呼叫與 component 使用處追蹤責任邊界，並閱讀同目錄鄰近檔案及所有受影響的呼叫端。
- 修改共用元件、directive、request、token 或全域樣式前，應搜尋全 repository 的使用處與既有慣例。
- ESLint 僅檢查變更的 JS／Vue 檔；Prettier 僅檢查變更檔，並遵守 `.prettierignore`。
- 不得執行會修改整個 repository 的 lint 或 format 指令。
- `dist/`、`.vite/`、`coverage/` 等產物不得進入格式檢查或 Git 變更。

## 修改範圍

- 開發前應使用 `git status` 與相對於目標 base branch 的 diff 確認任務範圍。
- 需求外的檔案不得整理、還原、刪除或格式化；工作樹中的既有變更視為其他開發內容。
- 需求外的 API、payload、route、form validation、預設值、互動時序與使用者可見行為不得變更。
- 僅加入目前使用的 props、slots、emits、variants、設定與相容層。
- 除開發者明確要求外，不得執行 commit、push、rebase 或改寫歷史。

## 程式職責與放置位置

`<workspace>` 指實際 workspace 目錄名稱。

| 責任       | 放置位置                               | 職責                                                  |
| ---------- | -------------------------------------- | ----------------------------------------------------- |
| API        | `src/api/<workspace>/`                 | Endpoint、method、params、body 與 response options    |
| Route      | `src/pages/<workspace>/router/`        | Router instance、history mode、route records 與 guard |
| Route View | `src/pages/<workspace>/views/`         | 頁面初始化、跨區塊流程、導頁與 lifecycle              |
| Component  | `src/components/<workspace>/`          | 畫面與局部互動，透過 props、models、emits、slots 對外 |
| Store      | `src/pages/<workspace>/stores/`        | Shared state、cache、request、loading、error 與 reset |
| Composable | `src/pages/<workspace>/composables/`   | 可重用且含 Vue state、watch、lifecycle 的流程         |
| Constants  | `src/pages/<workspace>/constants/`     | Enum、field keys、labels、options、限制與 factory     |
| 業務 Utils | `src/pages/<workspace>/utils/`         | 不依賴 Vue、store、router、DOM 的業務純函式           |
| 全域共用   | `src/components/shared/`、`src/utils/` | 不含特定 workspace 語意的元件與純函式                 |
| 全域樣式   | `src/assets/styles/`                   | Token、Tailwind 與第三方元件覆寫                      |

- View 負責流程協調；大型欄位 template、欄位級驗證與大量資料轉換應由對應責任層處理。
- Component 不直接處理頁面 route；除 navigation 屬於元件契約外，導頁應由 emit 交由 View 處理。
- Store 不得操作 DOM、timer 或 browser event。
- Store 預設採用 Option Store：`defineStore(id, { state, getters, actions })`。Repository 中既有的 Setup Store 為個別實作；新增 Store 僅在具有明確技術需求時採用 Setup Store。
- Composable 應為可重用的 Vue 流程，不得僅為縮短單一檔案而建立。
- Constants 不得保存可變 state；固定資料結構可使用 `createXxx` factory 建立。
- App layout 僅提供全站 shell；頁面專用 padding、寬度、scroll 與高度由 View 負責。

### 共用範圍

1. 僅由單一檔案使用，且抽出後未提升可讀性：保留於原檔。
2. 同一功能內共用：放該功能的 `shared/`。
3. 同一 workspace 跨功能共用：放 workspace 的 `shared/` 或共同 constants。
4. 不含 workspace 語意且確實跨 workspace 使用：提升至全域共用。

`shared/` 僅容納責任、資料形狀、互動契約與變更原因一致的共用內容。跨功能使用不構成移動資料契約的充分條件，資料契約應保留於其責任目錄。

## Vue SFC

檔案順序固定為 `<template>`、`<script setup>`，必要時加入 `<style scoped>`；非 scoped style 僅適用於確實需要全域規則的情境。

### Template

- Attribute 順序為結構指令、`v-model`、資料 props、狀態 props、一般 attrs、events，實際換行交給 Prettier。
- 複合判斷、重複轉換與狀態更新放在 computed 或具名 handler。
- 同一 mode 控制多個 attrs／events 時，使用具名 computed object 與單一 `v-bind`；核心 value、disabled、error 與主要 events 仍顯式保留。
- Event 需要額外參數時使用 `$event`，不得建立僅負責轉呼叫的 inline arrow function。
- `v-for` 使用穩定且唯一的資料 key；可增刪或排序的清單不使用 index。
- 同一 element 不得同時使用 `v-if` 與 `v-for`；資料應先由 computed 整理。
- Template 應保留主要功能區塊註解，讓閱讀者不需逐層閱讀 element 或 component 即可掌握畫面結構；註解需說明區塊用途、包含的功能或出現條件，例如「標籤設定：名稱、敘述、更新頻率、分類與同步設定」。
- 複合輸入、重複結構、分段面板、多模式元件與操作區應標示其責任及互動，例如新增前驗證、複選呈現方式或按鈕會開啟的確認流程；不得只重述 element、component、class 或畫面上已完整呈現的單一文案。
- 同一區塊具有不同 render mode、model shape 或資料 key 時，應在各分支保留對應註解，例如 `category + field（cascader 模式）`、`field（select 模式）`、`operator`、`value / values`；此類註解用於建立 template 與資料結構的對照，不視為逐行翻譯。
- 重構 template 時，原有區塊註解除非內容失效或已有另一則完整說明取代，否則應予保留；文字過時或不夠準確時直接改寫，不因 template 結構看似可讀而刪除。
- Modal、drawer 等浮層置於主要內容後方；不得使用空白 element 撐版。

### Script

Imports 依序為 Vue／第三方套件、`// Components`、`// Utils`、`// Store`、`// Composables`、`// API`、`// Constants`；沒有內容的分組省略。

Import 後依序排列：檔案 constants、props／models／emits、store／composables、依功能排列的 state／computed／handlers、watch、lifecycle hooks。

較長 script 使用下列三行格式劃分主要功能，並將同一流程的 state、computed、handlers 與 watch 放在一起：

```js
/* --------------------------------------------
   功能名稱
--------------------------------------------- */
```

- 功能分區用於快速定位責任，不為可直接理解的個別函式建立分區；分區名稱應列出實際涵蓋的行為，不使用「模組操作」、「資料處理」等無法看出內容的概括名稱，例如改為「新增、更新與清除模組」。
- 較長或包含多條流程的 script 應保留足以定位 state、handlers、watch 與 lifecycle 的功能分區；短檔案不為符合格式而增加分區。
- 函式名稱與參數名稱應先清楚表達主要行為；函式註解需補充輸入如何轉換、回傳結果、使用情境、限制或副作用，不得只把函式名稱改寫成一句話。
- `src/utils/` 的每個函式皆須有功能註解，讓呼叫端不需閱讀實作即可判斷是否適用；exported function 與具有參數、回傳值的 reusable helper 優先使用 JSDoc，並依需要說明參數、回傳值、單位、空值行為與資料格式。
- JSDoc 亦用於跨檔使用的 API、可重用函式、複雜資料形狀，或需要交代參數單位、回傳語意、限制與副作用的函式；內部 handler 可使用單行註解，但涉及多步驟、資料轉換或非直覺副作用時仍應補充其完整功能。
- 多步驟流程僅在步驟目的、先後順序或失敗處理不直覺時加行內註解，不替每個判斷、賦值或提前 return 加說明。
- Watcher、初始化與非同步流程若會依狀態決定是否 reset、fetch、保留既有值或觸發副作用，必須說明各狀態分支與時序，例如區分「初始 fetch 標記完成但不 reset」與「使用者互動後選項改變才 reset」。
- Watch 不得用於修補 handler 已能完成的同步流程，兩者亦不得重複 request。
- `nextTick`、timer 或 remount key 僅用於實際 render timing 或第三方元件限制。

## 元件與共用拆分

元件選擇順序固定為：專案既有 component、Ant Design Vue component、自製 component。

- 建立 component 前，應依責任與行為搜尋目前功能、workspace 與全域共用元件。
- 既有 component 已提供契約時直接使用；缺少普遍能力時擴充既有契約，單一情境差異由呼叫端組合。
- 自製 component 應組合既有 component 與 Ant Design Vue，僅實作缺少的業務行為與結構。
- 元件庫既有的 keyboard、focus、disabled、loading、validation、overlay 與 accessibility 行為應予保留。
- 不得建立僅提供樣式、轉傳 props 或包裝單一 template 的 component。
- 共用骨架承接一致的排列、迴圈、狀態與操作入口；業務內容透過 slot 或清楚契約提供。
- 複雜互動依 state 與行為內聚性決定邊界；不得僅為縮短檔案而拆分必須共享大量 state、refs、handlers 的流程。
- 不得為單一元件建立僅搬移局部程式的 JS helper、composable 或 utility。

Props、Models、Emits：

- Boolean prop 可用簡寫；Array／Object default 必須是 factory function。
- 一般 prop 不直接修改；v-model 使用 `defineModel` 或 computed getter／setter。
- Model 變數以 `Model` 結尾；emit 名稱描述已發生的互動。
- Prop、emit 與 slot 必須具有實際使用者。
- 修改 shared component 時保留 defaults、attrs passthrough、slots、emits 與 value shape，並搜尋所有使用者。
- Wrapper 使用 `useAttrs()` 與顯式 `v-bind` 時設定 `inheritAttrs: false`，避免 fallthrough attrs 或 listeners 重複套用；元件接管的 listener 應在契約允許時轉呼叫外部 listener。

## Ant Design Vue 與樣式

- 使用 Ant Design Vue component 時，優先採用目前安裝版本公開的 props、slots、events、tokens 與設定方式；不得以自訂 DOM、事件或 CSS 重作元件已提供的能力。
- 公開 API 無法滿足既定行為時，才補最小範圍的自訂邏輯或局部樣式，並保留原生 keyboard、focus、validation 與 accessibility 契約。
- 一般排版、間距、尺寸、文字與狀態以 Tailwind 為主，僅使用專案確實會生成的 utilities。
- Tailwind 無法合理表達且責任僅屬於該 component／page 時，方可在對應 `.vue` 使用少量 `<style scoped>`。
- `.vue` 的 `<style>` 使用純 CSS，顏色與 design token 取自 CSS variables，不使用 `@apply` 或 `@reference`；`@apply` 僅用於 `src/assets/styles/` 下的樣式檔。
- Scoped style 已能由 SFC 範圍與既有結構限制時，不得新增僅作為單次 CSS hook 的 class。
- 跨 component 共用的 Ant Design Vue 基礎樣式、variant、狀態、icon mapping 與元件庫修正統一放置於 `src/assets/styles/antdv/`。
- 僅屬於特定 component／page 的版面、狀態與 Ant Design Vue 內部調整保留於對應 `.vue`，並以 scoped style、局部根 selector 或必要的 `:deep()` 限制範圍；帶有功能語意的 selector 不得放入 `antdv/`。
- `antdv/` 維持單層；同一 component 的 selectors、variants、states 集中在同一檔案。
- `antdv.css` 僅依 cascade 順序逐檔 `@import`，不得包含 selector、glob、JS loader 或另一層 index。
- `antdv.css`、`antdv/` 與 EJS HTML templates 已由 `.prettierignore` 排除；cascade 順序與 EJS include 排版人工維護。
- 使用 Ant Design Vue component 前，應讀取對應 CSS、相關共用狀態規則與既有使用方式。

### Variant 與 marker attributes

- `v-variant` 由 `src/directives/variant.js` 提供，會在實際 DOM 設定 `variant` attribute，值為空時移除。
- 有效 variant 值以對應 `antdv/<component>.css` 為準，不得僅依官方 props 或名稱推測。
- `variant` 為 component-specific attribute，不同元件可分別用於語意色、尺寸或外觀；同名值與行為不得跨元件類推。
- 自製 wrapper 可以接收 `variant` prop，但套用至 Ant Design Vue component 時須沿用 `v-variant`。
- Button 的 `is-icon` 表示 icon-only button；`is-inline` 表示行內文字操作，兩者由 `antdv/button.css` 直接讀取。
- Text／link button 未設定 `v-variant` 時使用中性色；主色操作須明確設定 `v-variant="'primary'"`。
- 新 variant 必須具有可重用語意，並處理 hover、focus、disabled、readonly、error 等相關狀態。
- `antdv/` 中預先定義的 variant、token、icon mapping 與設計系統 selector，即使目前沒有使用者，亦不視為 dead code；刪除前須確認設計系統契約。

### Token 與 CSS

- 顏色來源為 `src/assets/styles/base.css`，Tailwind mapping 位於 `src/assets/styles/tailwind.css`，Ant Design Vue theme mapping 位於 `src/assets/theme/theme.js`。
- Semantic palettes 的 `10` 是最淺、`60` 是基準、`100` 是最深；neutral colors 使用前須直接讀取 `base.css`，不得依數字推測。
- 應使用既有 CSS variables 與 Tailwind colors，不得新增相近但不同的 hex／rgb。
- CSS 長度與 Tailwind arbitrary values 優先使用 `rem`；1px 邊線／分隔線，以及 DOM、Canvas 等以 CSS pixel 回傳或接收座標的 browser API 可保留 `px`。Tailwind 的 `px-*` 表示水平 padding，不屬於 pixel 單位。
- 未生成、拼寫錯誤或確定不生效的 Tailwind class／CSS 不得保留。
- 固定 class 應留於 template；不得建立僅用於共用樣式的 JS class string 或 computed class。
- Cascade 尚未釐清時不得使用 `!important`；Ant Design Vue 覆寫應限制 selector 範圍。

## Icon

- 一般 icon 優先使用既有 `jb_icon_*`，字型由 `templates/include/head/designer-icons.html` 載入。
- Repository 未提供完整 icon manifest；新增 class 必須在啟動後的實際畫面確認字形存在且正確，不得僅依名稱推測。
- Ant Design Vue 內建 icon 的 104 icon mapping 集中於 `antdv/icon.css`，各 `.vue` 不得複製其內部 DOM。
- Alert、message、notification、Modal 的 feedback icon 由 `src/plugins/antdvFeedbackIcons.js` 統一處理。
- 無可用 `jb_icon_*` 時應先搜尋既有 shared icon；兩者均無法滿足時方可新增 SVG。
- Icon-only 操作應使用 button 與 `is-icon`，並提供可辨識的 title／accessible name；`<i>` 或 `<svg>` 不得直接綁定 click。
- Icon 尺寸、對齊、顏色使用 Tailwind、`currentColor` 或既有 CSS variables。

## API 與 Mock

- `src/api/` 下的目錄與檔名依 endpoint 的靜態 path segments 建立，不得另設前端分類。
- 動態參數由 function 參數處理，不建立對應資料夾；endpoint 停在資源根或動態資源時使用 `index.js`。
- API path 的單複數與 kebab-case 原樣保留；相同 endpoint 的不同 HTTP methods 放在同一檔案。
- 正式 API 與 mock 位於相同目錄，分別使用 `.js`、`.mock.js`，並 export 同名函式、接受相同參數。
- 正式程式使用無副檔名 import。`mock=1` 時，`vite.config.js` 的 resolve extensions 會將 `.mock.js` 排在 `.js` 前面。

Mock request 必須明確提供 response envelope：

```js
api.get(url, { params, response: { data, metadata: {} } });
api.post(url, { data, response: { data: result, metadata: {} } });
```

- GET 的 filter、sort、pagination 由 mock function 收到的 params 計算；mock transport 不會產生結果。
- 錯誤 response 使用 `{ status, data: { error: { code, message, details } } }`。
- `response` 為必要設定，且 envelope 必須與正式 API 一致。
- Mock 行為必須 deterministic，不得修改輸入資料或跨案例洩漏可變 state。

## 表單與 Feedback

- 表單規則優先使用 `src/utils/form/validationRules.js` 的 default export：`import RULES from '@/utils/form/validationRules'`。
- 可跨功能重用且缺少的規則補進 `RULES`；只屬於單一欄位組合的規則留在業務檔案。
- Form name、payload field、table `dataIndex` 與跨檔案 key 使用 constants，不重複字面字串。
- `message` 用於短暫、局部、單一步驟的操作或驗證回饋。
- `notification` 用於需要 title／description、影響範圍較大或需要較長閱讀時間的結果。
- `Modal.confirm` 用於需要使用者決策的操作；刪除、清除、捨棄等破壞性操作使用明確文案與 `okType: 'danger'`。
- API interceptor 已處理的全域錯誤不得重複顯示相同 feedback；局部 feedback 僅補充使用者下一步所需資訊。

## 命名、字典與註解

- Vue component／檔名使用 PascalCase；一般 JS 檔名使用 camelCase；Route View 沿用 `Index.vue`。
- Composable 使用 `useXxx`；handler 使用 `handleXxx`；遠端讀取使用 `fetchXxx`，取得現有資料使用 `getXxx`。
- 轉換使用 `toXxx`，收集使用 `collectXxx`，建立結構使用 `createXxx`。
- Boolean 使用 `is`／`has`／`can`／`should`；template ref 以 `Ref` 結尾。
- Constants 使用 `UPPER_SNAKE_CASE`；fields、labels、options、上限分別使用一致的 `FIELD`、`LABELS`、`OPTIONS`、`MAX` 命名。
- API key 與 enum value 不得因程式命名調整而變更；wire format 必須維持相容。
- 固定 options 應由 labels dictionary 衍生；巢狀 payload 使用單一 factory，避免由多個功能各自維護預設結構。
- 註解使用繁體中文，並補充名稱、型別與程式結構無法快速表達的資訊；優先說明功能用途、設計原因、業務規則、資料來源、單位、wire format、相容限制、副作用與時序。
- 檔案或功能分區註解用於導覽多條責任或長流程，不要求每個檔案都有檔頭說明；分區名稱須具體描述涵蓋的功能，不得只寫「操作」、「處理」或「設定」。
- `src/pages/<workspace>/constants/` 應透過檔案、分區或個別 export 註解，說明常數對應的畫面、payload、API response、route 或其他使用情境；物件中的 key 若分別對應不同節點、資料方向或元件行為，應保留逐 key 的行內註解，即使值與名稱可讀也不得只剩檔案總說明。
- 不得加入只重述 function／prop／computed 名稱、型別、預設值，或逐行翻譯 template 的註解；但 template 區塊導覽、`src/utils/` 函式用途與 constants 使用情境不視為重複資訊。若用途仍難理解，先改善命名與結構，再補上無法由程式快速表達的脈絡。
- 複雜資料轉換、狀態轉換、競態、清理時機、第三方限制、browser 差異與 wire format 限制必須說明；註解應放在限制實際發生的位置，避免集中成與實作脫節的長篇摘要。
- 能說明 watcher 前後狀態、初始化旗標、reset 條件或資料 key 對應關係的既有註解屬於行為契約；重構時應保留或依新實作改寫，不得只因程式可執行而刪除。
- 重構既有註解時，依序採用保留、縮短、改寫；只有在資訊已由更清楚的命名或鄰近註解完整承接、內容只是逐行翻譯或已失效時才刪除。
- 重構不以增加或減少註解行數為目標；修改前須閱讀既有註解，確認其中的功能邊界、原因、契約與限制在修改後仍可找到。
- 文字與註解不得使用口語、情緒、說服、辯解或對讀者喊話的表述。
- 文字與註解不得包含修改歷程，亦不得解釋 class 或程式本身可直接辨識的效果。
- TODO 必須包含 issue 編號或可執行條件。

## 行為相容與非同步

重構前後必須保持：

- Props、models、emits、slots、attrs passthrough、defaults 與 value shape。
- API endpoint、method、params、body、response envelope、payload fields 與 enum values。
- Route name、params、query、redirect、title 與 storage keys。
- Form name path、rules、初始化、清理與 submit payload。
- Loading、disabled、empty、error、expired、上限與權限狀態。
- 搜尋、排序、分頁、展開、選取、清除、複製、刪除、取消與送出行為。
- Layout、scroll、overlay、z-index 與 responsive 行為，除非需求明確改版。
- 修改 shared component 時應檢查所有使用者，多模式元件須逐模式驗證。

### 非同步與清理

- 後發 request 不得被先發但較晚完成的 response 覆寫。
- Reset 必須清除 state、cache marker，並使未完成的舊結果失效。
- Watch 的 `immediate`、`deep`、`flush` 不得任意修改。
- Timer、`requestAnimationFrame`、DOM／window listener 在 unmount 清理。

## 交付檢查

Repository 已安裝 Vitest 並提供 scripts／tsconfig，但未包含 test cases；不得宣稱已通過 unit tests，亦不得將不存在的測試列為交付條件。

1. `git diff --check` 無 whitespace error，diff 只含任務範圍。
2. 對變更檔執行 Prettier check 並遵守 `.prettierignore`；AntDV cascade 的格式人工維護。
3. 對變更的 JS／Vue 檔執行 ESLint；不得對整個 repository 使用 `--fix`。
4. 執行 `package.json` 中與目標 workspace、environment 對應的 build script。
5. UI 行為有變更時，以目標 workspace 的 mock serve script 啟動，並使用既有 Edge 工作階段驗證。
6. 檢查 console、失敗 requests 與受影響的 computed styles。
7. 交付報告應區分已驗證與未驗證項目；build 成功不代表互動行為完全相同。

除需求明確要求外，不得新增 Playwright scripts、snapshots 或其他測試產物。
