# Back4appFengBroAI

SvelteKit 版鋒兄工作台，參考 `goldshoot0720/fengbroaiappwrite` 的模組結構，提供本機 CRUD、CSV 匯入與 CSV 匯出。

## 開發

```bash
npm install
npm run dev
```

目前資料儲存在瀏覽器 `localStorage`。匯入 Appwrite CSV 時會依照標題列對應欄位；匯出時會輸出 UTF-8 BOM CSV，方便 Excel 開啟。
