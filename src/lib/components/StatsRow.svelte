<script lang="ts">
  import type { ModuleConfig, RepositoryMode } from '$lib/types';

  export let activeModule: ModuleConfig;
  export let recordCount = 0;
  export let totalAmount = 0;
  export let mode: RepositoryMode = 'localStorage';
</script>

<section class="stats-row" aria-label="統計">
  <div>
    <span>資料筆數</span>
    <strong>{recordCount}</strong>
  </div>
  <div>
    <span>欄位數</span>
    <strong>{activeModule.fields.length}</strong>
  </div>
  <div>
    <span>金額合計</span>
    <strong>{Math.round(totalAmount).toLocaleString('zh-TW')}</strong>
  </div>
  <div>
    <span>資料來源</span>
    <strong>{mode === 'back4app' ? 'Back4app' : 'localStorage'}</strong>
  </div>
  <div>
    <span>CSV 名稱</span>
    <strong>{activeModule.csvName}</strong>
  </div>
</section>
