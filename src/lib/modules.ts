import type { ModuleConfig } from './types';

const commonAccountSites = Array.from({ length: 37 }, (_, index) => [
  { key: `site${String(index + 1).padStart(2, '0')}`, label: `站台 ${index + 1}` },
  { key: `note${String(index + 1).padStart(2, '0')}`, label: `備註 ${index + 1}` }
]).flat();

export const modules: ModuleConfig[] = [
  {
    id: 'subscription',
    title: '鋒兄訂閱',
    short: '訂閱',
    icon: '訂',
    description: '續訂、扣款日、帳號與幣別管理。CSV 欄位相容 appwrite-subscription。',
    csvName: 'appwrite-subscription',
    className: 'subscription',
    fields: [
      { key: 'name', label: '名稱' },
      { key: 'site', label: '網站', type: 'url' },
      { key: 'price', label: '價格', type: 'number' },
      { key: 'nextdate', label: '下次日期', type: 'date' },
      { key: 'note', label: '備註', type: 'textarea' },
      { key: 'account', label: '帳號' },
      { key: 'currency', label: '幣別', placeholder: 'TWD' },
      { key: 'continue', label: '續訂', type: 'checkbox' }
    ],
    seed: [
      {
        name: 'ChatGPT/PLUS',
        site: 'https://chatgpt.com/#pricing',
        price: 690,
        nextdate: '2026-07-04',
        note: 'outlook\n街口\n中信\nApple Pay',
        account: 'gaokaolevel3iptopscorer',
        currency: 'TWD',
        continue: true
      },
      {
        name: 'Proton Drive Plus 200 GB',
        site: 'https://drive.proton.me',
        price: 5,
        nextdate: '2026-06-15',
        note: '',
        account: 'huang1988pioneer',
        currency: 'USD',
        continue: false
      }
    ]
  },
  {
    id: 'food',
    title: '鋒兄食品（＋商品庫存）',
    short: '食品',
    icon: '食',
    description: '保存期限、數量、價格、店家與照片 URL，支援快速增減庫存。',
    csvName: 'appwrite-food',
    className: 'food',
    fields: [
      { key: 'name', label: '名稱' },
      { key: 'amount', label: '數量', type: 'number' },
      { key: 'todate', label: '到期日', type: 'date' },
      { key: 'photo', label: '照片', type: 'url' },
      { key: 'price', label: '價格', type: 'number' },
      { key: 'shop', label: '店家' },
      { key: 'photohash', label: '照片 Hash' }
    ],
    seed: [
      {
        name: '【泰山】八寶粥',
        amount: 5,
        todate: '2027-04-14',
        photo: 'https://shoplineimg.com/64587ad406d620007ce10917/6463162e0fa8d10001cc0eb5/800x.jpg?',
        price: 0,
        shop: '',
        photohash: ''
      },
      {
        name: '小北百貨30元購物金',
        amount: 1,
        todate: '2026-06-11',
        photo: '',
        price: 0,
        shop: '',
        photohash: ''
      }
    ]
  },
  {
    id: 'article',
    title: '鋒兄筆記',
    short: '筆記',
    icon: '筆',
    description: '文章、想法、連結與附件欄位，對應 appwrite-article。',
    csvName: 'appwrite-article',
    className: 'article',
    fields: [
      { key: 'title', label: '標題' },
      { key: 'content', label: '內容', type: 'textarea' },
      { key: 'category', label: '分類' },
      { key: 'newDate', label: '日期', type: 'date' },
      { key: 'url1', label: '連結 1', type: 'url' },
      { key: 'url2', label: '連結 2', type: 'url' },
      { key: 'url3', label: '連結 3', type: 'url' },
      { key: 'file1', label: '檔案 1' },
      { key: 'file1name', label: '檔名 1' },
      { key: 'file1type', label: '類型 1' },
      { key: 'file2', label: '檔案 2' },
      { key: 'file2name', label: '檔名 2' },
      { key: 'file2type', label: '類型 2' },
      { key: 'file3', label: '檔案 3' },
      { key: 'file3name', label: '檔名 3' },
      { key: 'file3type', label: '類型 3' }
    ],
    seed: [
      {
        title: '歷史價格紀錄',
        content: 'KIOXIA 鎧俠 Exceria Plus G3 SSD 1TB 曾經來到 2090 元',
        category: '',
        newDate: '2026-06-04',
        url1: 'https://24h.pchome.com.tw/prod/DRAHGT-A900GOJVX'
      }
    ]
  },
  {
    id: 'commonaccount',
    title: '鋒兄常用',
    short: '常用',
    icon: '常',
    description: '常用帳號與多組站台備註，保留 37 組 site/note 欄位。',
    csvName: 'appwrite-commonaccount',
    className: 'commonaccount',
    fields: [{ key: 'name', label: '帳號名稱' }, ...commonAccountSites],
    seed: [
      {
        name: 'goldshoot0720@gmail.com',
        site01: 'Appwrite',
        note01: '',
        site02: 'Cloudflare',
        note02: '',
        site03: 'Vercel',
        note03: ''
      }
    ]
  },
  {
    id: 'image',
    title: '鋒兄圖片',
    short: '圖片',
    icon: '圖',
    description: '圖片資產、提示詞、分類與來源。',
    csvName: 'appwrite-image',
    className: 'image',
    fields: [
      { key: 'title', label: '標題' },
      { key: 'url', label: '圖片 URL', type: 'url' },
      { key: 'prompt', label: '提示詞', type: 'textarea' },
      { key: 'category', label: '分類' },
      { key: 'createdAt', label: '建立日', type: 'date' },
      { key: 'note', label: '備註', type: 'textarea' }
    ]
  },
  {
    id: 'video',
    title: '鋒兄影片',
    short: '影片',
    icon: '影',
    description: '影片 URL、封面、分類與備註。',
    csvName: 'appwrite-video',
    className: 'video',
    fields: [
      { key: 'title', label: '標題' },
      { key: 'url', label: '影片 URL', type: 'url' },
      { key: 'cover', label: '封面 URL', type: 'url' },
      { key: 'duration', label: '長度' },
      { key: 'category', label: '分類' },
      { key: 'note', label: '備註', type: 'textarea' }
    ]
  },
  {
    id: 'music',
    title: '鋒兄音樂',
    short: '音樂',
    icon: '音',
    description: '音訊、歌詞、語言與來源。',
    csvName: 'appwrite-music',
    className: 'music',
    fields: [
      { key: 'title', label: '標題' },
      { key: 'artist', label: '作者' },
      { key: 'url', label: '音樂 URL', type: 'url' },
      { key: 'lyrics', label: '歌詞', type: 'textarea' },
      { key: 'language', label: '語言' },
      { key: 'note', label: '備註', type: 'textarea' }
    ]
  },
  {
    id: 'document',
    title: '鋒兄文件',
    short: '文件',
    icon: '文',
    description: '文件檔案、類型、連結與摘要。',
    csvName: 'appwrite-document',
    className: 'document',
    fields: [
      { key: 'title', label: '標題' },
      { key: 'file', label: '檔案 URL', type: 'url' },
      { key: 'type', label: '類型' },
      { key: 'summary', label: '摘要', type: 'textarea' },
      { key: 'createdAt', label: '建立日', type: 'date' },
      { key: 'note', label: '備註', type: 'textarea' }
    ]
  },
  {
    id: 'podcast',
    title: '鋒兄播客',
    short: '播客',
    icon: '播',
    description: 'Podcast 音訊、節目、集數與逐字稿。',
    csvName: 'appwrite-podcast',
    className: 'podcast',
    fields: [
      { key: 'title', label: '標題' },
      { key: 'show', label: '節目' },
      { key: 'episode', label: '集數' },
      { key: 'url', label: '音訊 URL', type: 'url' },
      { key: 'transcript', label: '逐字稿', type: 'textarea' },
      { key: 'publishedAt', label: '發布日', type: 'date' }
    ]
  },
  {
    id: 'bank',
    title: '鋒兄銀行（+電子票證）',
    short: '銀行',
    icon: '銀',
    description: '銀行、電子票證、餘額、金融卡與帳號資訊。',
    csvName: 'appwrite-bank',
    className: 'bank',
    fields: [
      { key: 'name', label: '名稱' },
      { key: 'deposit', label: '餘額', type: 'number' },
      { key: 'site', label: '網站', type: 'url' },
      { key: 'address', label: '地址' },
      { key: 'withdrawals', label: '提款次數', type: 'number' },
      { key: 'transfer', label: '轉帳次數', type: 'number' },
      { key: 'activity', label: '活動', type: 'url' },
      { key: 'card', label: '卡片' },
      { key: 'account', label: '帳號' }
    ],
    seed: [
      {
        name: '台新銀行',
        deposit: 500,
        site: 'https://www.taishinbank.com.tw',
        address: '',
        withdrawals: 5,
        transfer: 5,
        activity: 'https://richart.tw/TSDIB_RichartWeb/ntd-saving-currency',
        card: '台新Richart VISA金融卡 1902',
        account: '末五碼 57295'
      },
      {
        name: 'Supercard超級悠遊卡LOGO線條款',
        deposit: 242,
        site: 'https://www.easycard.com.tw/',
        address: '',
        withdrawals: 0,
        transfer: 0,
        activity: '',
        card: '',
        account: ''
      }
    ]
  },
  {
    id: 'routine',
    title: '鋒兄例行',
    short: '例行',
    icon: '例',
    description: '例行事項、最近日期、連結與照片。',
    csvName: 'appwrite-routine',
    className: 'routine',
    fields: [
      { key: 'name', label: '名稱' },
      { key: 'note', label: '備註', type: 'textarea' },
      { key: 'lastdate1', label: '日期 1', type: 'date' },
      { key: 'lastdate2', label: '日期 2', type: 'date' },
      { key: 'lastdate3', label: '日期 3', type: 'date' },
      { key: 'link', label: '連結', type: 'url' },
      { key: 'photo', label: '照片', type: 'url' }
    ],
    seed: [
      {
        name: '鋒兄牙刷',
        note: '預定每90天更換\n刷樂濃密炭深潔牙刷',
        lastdate1: '2026-05-19',
        lastdate2: '',
        lastdate3: '',
        link: '',
        photo: ''
      }
    ]
  },
  {
    id: 'tools',
    title: '鋒兄工具',
    short: '工具',
    icon: '工',
    description: '工具集合：鋒兄比價、手機比價、鋒兄Tube、鋒兄金融。',
    csvName: 'appwrite-tools',
    className: 'tools',
    fields: [
      { key: 'name', label: '工具名稱' },
      { key: 'type', label: '類型' },
      { key: 'url', label: 'URL', type: 'url' },
      { key: 'query', label: '查詢字串' },
      { key: 'note', label: '備註', type: 'textarea' }
    ],
    seed: [
      { name: '鋒兄比價', type: 'price', url: 'https://24h.pchome.com.tw/', query: 'KIOXIA SSD', note: '' },
      { name: '手機比價', type: 'phone', url: 'https://www.landtop.com.tw/', query: 'Samsung 26', note: '' },
      { name: '鋒兄Tube', type: 'tube', url: 'https://www.youtube.com/', query: 'henren778', note: '' },
      { name: '鋒兄金融', type: 'finance', url: 'https://finance.yahoo.com/', query: 'TWD USD', note: '' }
    ]
  },
  {
    id: 'settings',
    title: '鋒兄設定',
    short: '設定',
    icon: '設',
    description: 'Back4app 與本機工作台設定。',
    csvName: 'appwrite-settings',
    className: 'settings',
    fields: [
      { key: 'name', label: '設定名稱' },
      { key: 'value', label: '設定值', type: 'textarea' },
      { key: 'note', label: '備註', type: 'textarea' }
    ],
    seed: [{ name: '儲存模式', value: 'Back4app / localStorage', note: '設定完整時使用 Back4app，否則使用 localStorage。' }]
  },
  {
    id: 'about',
    title: '鋒兄關於',
    short: '關於',
    icon: '關',
    description: '專案說明、版本紀錄與重要連結。',
    csvName: 'appwrite-about',
    className: 'about',
    fields: [
      { key: 'title', label: '標題' },
      { key: 'content', label: '內容', type: 'textarea' },
      { key: 'url', label: 'URL', type: 'url' },
      { key: 'updatedAt', label: '更新日', type: 'date' }
    ],
    seed: [
      {
        title: 'SvelteKit 版鋒兄工作台',
        content: '參考 fengbroaiappwrite，實作 Back4app CRUD 與 Appwrite CSV 匯入匯出。',
        url: 'https://github.com/goldshoot0720/fengbroaiappwrite',
        updatedAt: '2026-06-11'
      }
    ]
  }
];
