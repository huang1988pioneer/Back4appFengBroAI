# Back4appFengBroAI

鋒兄 AI 的 SvelteKit + Back4app 工作台。介面參考 `goldshoot0720/fengbroaiappwrite`，資料模組提供 CRUD、CSV 匯入與 CSV 匯出；鋒兄工具改為使用即時 API，不再使用寫死的靜態資料。

## 功能

- 鋒兄訂閱、食品、筆記、常用、銀行、例行、設定與關於。
- CRUD：新增、編輯、複製、刪除、庫存增減。
- CSV：匯入 Appwrite CSV 格式並可匯出目前資料。
- Back4app：設定完整時寫入 Parse Class；未設定時使用 `localStorage` 備援。
- 鋒兄工具：
  - 鋒兄比價：即時解析 PChome/momo 商品頁，並嘗試串 BigGo 歷史價格。
  - 手機比價：即時抓地標網通與傑昇通信資料。
  - 鋒兄Tube：即時讀取 YouTube 頻道 RSS feed。
  - 鋒兄金融：即時讀取 Yahoo Finance 與 Multpl Shiller PE。

## 開發

```bash
npm install
npm run dev
```

常用檢查：

```bash
npm run check
npm run build
```

## Back4app 設定

可建立 `.env`：

```env
VITE_BACK4APP_ENDPOINT=https://parseapi.back4app.com
VITE_BACK4APP_APP_ID=你的_Application_ID
VITE_BACK4APP_MASTER_KEY=你的_Master_Key
```

也可以在畫面中的「設定 Back4app」面板填入：

- Parse Endpoint
- Application ID
- Master Key

設定完整後，CRUD 與 CSV 匯入會寫入 Back4app。未設定時，資料會保存在瀏覽器 `localStorage`。

## 即時工具 API

工具頁使用 SvelteKit server routes：

- `GET /api/tools/price?url=...`
- `GET /api/tools/phone?query=Samsung`
- `GET /api/tools/tube`
- `POST /api/tools/tube`
- `GET /api/tools/finance`

外部來源可能被限流或暫時無法連線。API 已加上 15 秒逾時，前端會顯示錯誤或 warning，而不是卡住整個工具頁。

## 部署

此專案使用 `@sveltejs/adapter-auto`，並且 `src/routes/+layout.ts` 關閉 prerender，讓 `/api/tools/*` 可以在支援 server routes 的平台執行。

建議部署到：

- Vercel
- Netlify
- 其他支援 SvelteKit server endpoints 的平台

若部署到純靜態 Pages，CRUD 前端仍可載入，但鋒兄工具的即時 API 不會運作。
