<script lang="ts">
  import type { Back4appConfig, ModuleConfig } from '$lib/types';
  import { isBack4appReady } from '$lib/storage';

  export let config: Back4appConfig;
  export let activeModule: ModuleConfig;
  export let onSave: () => void;
  export let onTest: () => void;
  export let onUseLocal: () => void;
</script>

<section class="db-panel">
  <div class="section-title">
    <div>
      <h3>Back4app 資料庫</h3>
      <p>使用 Parse REST API。Class 會依模組自動使用，例如 {activeModule.className}。</p>
    </div>
    <span class:ready={isBack4appReady(config)}>
      {isBack4appReady(config) ? '資料庫模式' : '本機備援模式'}
    </span>
  </div>

  <div class="db-grid">
    <label>
      <span>Parse Endpoint</span>
      <input bind:value={config.endpoint} placeholder="https://parseapi.back4app.com" />
    </label>
    <label>
      <span>Application ID</span>
      <input bind:value={config.appId} placeholder="Back4app Application ID" />
    </label>
    <label>
      <span>Master Key</span>
      <input bind:value={config.masterKey} type="password" placeholder="Back4app Master Key" />
    </label>
  </div>

  <div class="form-actions">
    <button class="primary" type="button" on:click={onSave}>儲存並重新連線</button>
    <button class="secondary" type="button" on:click={onTest}>測試連線</button>
    <button class="ghost" type="button" on:click={onUseLocal}>改用 localStorage</button>
  </div>
</section>
