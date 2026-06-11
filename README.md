# Back4appFengBroAI

SvelteKit 版鋒兄工作台，參考 `goldshoot0720/fengbroaiappwrite` 的模組結構，提供 Back4app 資料庫 CRUD、CSV 匯入與 CSV 匯出。

## 功能

- 鋒兄訂閱
- 鋒兄食品（含商品庫存加減）
- 鋒兄筆記
- 鋒兄常用
- 鋒兄圖片、影片、音樂、文件、播客
- 鋒兄銀行（含電子票證）
- 鋒兄例行
- 鋒兄工具：鋒兄比價、手機比價、鋒兄Tube、鋒兄金融
- 鋒兄設定、鋒兄關於

## Back4app

頁面右上角點選「設定 Back4app」，填入：

- Parse Endpoint，預設 `https://parseapi.back4app.com`
- Application ID
- REST API Key

設定完整後，CRUD 與 CSV 匯入會寫入 Back4app Parse Class。若未設定，會自動使用瀏覽器 `localStorage` 備援。

## 開發

```bash
npm install
npm run dev
```

CSV 匯入會依照標題列對應欄位；匯出會輸出 UTF-8 BOM CSV，方便 Excel 開啟。

## Back4app / Cloudflare Pages 部署

這個專案已改為輸出靜態站到 `build/`。

### Back4app 設定

在 Back4app Workers & Pages 的設定中：

- **Build command**: `npm run build`
- **Deploy command**: `npx wrangler deploy --assets build`
- **Root directory**: `/`

### 本地部署

```bash
npm run build
npx wrangler deploy --assets build
```

注意：必須使用 `--assets build` 參數來指定靜態資源目錄。
