# Back4appFengBroAI

SvelteKit 版鋒兄工作台，參考 `goldshoot0720/fengbroaiappwrite` 的模組結構，提供 Back4app 資料庫 CRUD、CSV 匯入與 CSV 匯出。

## 功能

- 鋒兄訂閱
- 鋒兄食品（含商品庫存加減）
- 鋒兄筆記
- 鋒兄常用
- 鋒兄銀行（含電子票證）
- 鋒兄例行
- 鋒兄工具：鋒兄比價、手機比價、鋒兄Tube、鋒兄金融
- 鋒兄設定、鋒兄關於

## 架構說明

- **後端資料庫**：Back4app (Parse Server)
- **前端部署**：支援 Vercel、Cloudflare Pages、或 Back4app Workers & Pages
- **備援機制**：未設定 Back4app 時自動使用瀏覽器 localStorage

## Back4app

頁面右上角點選「設定 Back4app」，填入：

- Parse Endpoint，預設 `https://parseapi.back4app.com`
- Application ID
- Master Key

設定完整後，CRUD 與 CSV 匯入會寫入 Back4app Parse Class。若未設定，會自動使用瀏覽器 `localStorage` 備援。

## 開發

```bash
npm install
npm run dev
```

CSV 匯入會依照標題列對應欄位；匯出會輸出 UTF-8 BOM CSV，方便 Excel 開啟。

## 部署到 Vercel

### 方式一：通過 Vercel Dashboard（推薦）

1. 前往 [Vercel](https://vercel.com)
2. 點擊 "Import Project"
3. 連接你的 GitHub 倉庫
4. Vercel 會自動檢測為 SvelteKit 專案並使用正確的設定

### 方式二：使用 Vercel CLI

```bash
npm install -g vercel
npm run build
vercel --prod
```

**注意**：Vercel 會自動讀取 `vercel.json` 和 `.node-version` 配置。

## 部署到 Cloudflare Pages

### 方式一：通過 Cloudflare Dashboard

1. 前往 [Cloudflare Pages](https://pages.cloudflare.com)
2. 連接你的 GitHub 倉庫
3. 設定構建配置：
   - **Build command**: `npm run build`
   - **Build output directory**: `build`
   - **Root directory**: `/`

### 方式二：使用 Wrangler CLI

```bash
npm run build
npx wrangler pages deploy build --project-name=back4appfengbroai
```

**注意**：Cloudflare Pages 會自動複製 `static/_redirects` 到構建輸出目錄，實現 SPA 路由。

## 部署到 Back4app Workers & Pages

### 通過 Back4app Dashboard

1. 前往 [Back4app Workers & Pages](https://dashboard.back4app.com)
2. 連接你的 GitHub 倉庫
3. 設定構建配置：
   - **Build command**: `npm run build`
   - **Deploy command**: `npx wrangler deploy --assets build`
   - **Root directory**: `/`
   - **Node version**: 20（自動從 `.node-version` 讀取）

**重要**：部署命令必須包含 `--assets build` 參數，告訴 Wrangler 要部署靜態資源。
