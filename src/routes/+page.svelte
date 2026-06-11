<script lang="ts">
  import { onMount } from 'svelte';
  import Back4appPanel from '$lib/components/Back4appPanel.svelte';
  import ModuleNav from '$lib/components/ModuleNav.svelte';
  import RecordForm from '$lib/components/RecordForm.svelte';
  import RecordList from '$lib/components/RecordList.svelte';
  import StatsRow from '$lib/components/StatsRow.svelte';
  import ToolPanel from '$lib/components/ToolPanel.svelte';
  import { csvFilename, recordsFromCsv, recordsToCsv } from '$lib/csv';
  import { modules } from '$lib/modules';
  import {
    createBlankRecord,
    normalizeRecord,
    normalizeSeed,
    primaryField,
    primaryValue,
    sortRecords
  } from '$lib/record';
  import {
    defaultBack4appConfig,
    FengbroRepository,
    isBack4appReady,
    loadBack4appConfig,
    saveBack4appConfig
  } from '$lib/storage';
  import type { Back4appConfig, ModuleConfig, RecordItem, RepositoryMode } from '$lib/types';

  let activeModule = modules[0];
  let records: RecordItem[] = [];
  let form: RecordItem = createBlankRecord(activeModule);
  let editingId = '';
  let query = '';
  let importMessage = '';
  let syncMessage = '';
  let toolTab = 'price';
  let dbPanelOpen = false;
  let loadingRecords = false;
  let dbConfig: Back4appConfig = { ...defaultBack4appConfig };
  let mode: RepositoryMode = 'localStorage';

  $: repository = new FengbroRepository(activeModule, dbConfig);
  $: mode = repository.mode;
  $: filteredRecords = sortRecords(
    activeModule,
    records.filter((item) => {
      const needle = query.trim().toLowerCase();
      if (!needle) return true;
      return activeModule.fields.some((field) => String(item[field.key] ?? '').toLowerCase().includes(needle));
    })
  );
  $: totalAmount = records.reduce((sum, item) => {
    const price = Number(item.price ?? item.deposit ?? 0);
    const amount = Number(item.amount ?? 1);
    return sum + (Number.isFinite(price) ? price : 0) * (Number.isFinite(amount) ? amount : 1);
  }, 0);

  onMount(() => {
    dbConfig = loadBack4appConfig();
    void selectModule(activeModule);
  });

  async function selectModule(module: ModuleConfig) {
    activeModule = module;
    form = createBlankRecord(module);
    editingId = '';
    query = '';
    importMessage = '';
    await loadRecords();
  }

  async function loadRecords() {
    loadingRecords = true;
    syncMessage = '';
    try {
      records = await repository.list();
      syncMessage = `${mode === 'back4app' ? 'Back4app' : 'localStorage'} 已載入：${activeModule.className} / ${records.length} 筆`;
    } catch (error) {
      records = [];
      syncMessage = error instanceof Error ? error.message : '讀取資料失敗';
    } finally {
      loadingRecords = false;
    }
  }

  function cancelEdit() {
    form = createBlankRecord(activeModule);
    editingId = '';
  }

  async function submitRecord() {
    const cleaned = normalizeRecord(activeModule, form);
    try {
      if (editingId) await repository.update(editingId, cleaned);
      else await repository.create(cleaned);
      cancelEdit();
      await loadRecords();
    } catch (error) {
      syncMessage = error instanceof Error ? error.message : '儲存失敗';
    }
  }

  function editRecord(item: RecordItem) {
    form = { ...createBlankRecord(activeModule), ...item };
    editingId = item.id;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function duplicateRecord(item: RecordItem) {
    const copy: RecordItem = { ...item, id: '' };
    const label = primaryValue(activeModule, item);
    if (label) copy[primaryField(activeModule).key] = `${label} (複製)`;

    try {
      await repository.create(normalizeRecord(activeModule, copy));
      await loadRecords();
    } catch (error) {
      syncMessage = error instanceof Error ? error.message : '複製失敗';
    }
  }

  async function deleteRecord(item: RecordItem) {
    const label = primaryValue(activeModule, item) || '這筆資料';
    if (!confirm(`刪除「${label}」？`)) return;

    try {
      await repository.delete(item.id);
      await loadRecords();
    } catch (error) {
      syncMessage = error instanceof Error ? error.message : '刪除失敗';
    }
  }

  async function adjustAmount(item: RecordItem, delta: number) {
    const updated = normalizeRecord(activeModule, {
      ...item,
      amount: Math.max(0, Number(item.amount || 0) + delta)
    });

    try {
      await repository.update(item.id, updated);
      await loadRecords();
    } catch (error) {
      syncMessage = error instanceof Error ? error.message : '庫存更新失敗';
    }
  }

  async function importCsv(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const imported = recordsFromCsv(activeModule, await file.text());
    let success = 0;
    for (const item of imported) {
      await repository.create(item);
      success += 1;
    }
    await loadRecords();
    importMessage = `已匯入 ${success}/${imported.length} 筆：${file.name}`;
    input.value = '';
  }

  function exportCsv() {
    const csv = recordsToCsv(activeModule, records);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = csvFilename(activeModule);
    link.click();
    URL.revokeObjectURL(link.href);
  }

  async function resetSeed() {
    if (!confirm(`重置「${activeModule.title}」為範例資料？`)) return;
    if (mode === 'back4app') {
      for (const item of normalizeSeed(activeModule)) await repository.create(item);
    } else {
      await repository.replaceLocal(normalizeSeed(activeModule));
    }
    await loadRecords();
  }

  async function clearModule() {
    if (!confirm(`清空「${activeModule.title}」全部資料？`)) return;
    for (const item of records) await repository.delete(item.id);
    await loadRecords();
  }

  function saveDatabaseConfig() {
    saveBack4appConfig(dbConfig);
    syncMessage = isBack4appReady(dbConfig) ? 'Back4app 設定已儲存。' : 'Back4app 設定未完整，暫時使用 localStorage。';
    void loadRecords();
  }

  async function testDatabaseConnection() {
    if (!isBack4appReady(dbConfig)) {
      syncMessage = '請先填入 Endpoint、Application ID 與 Master Key。';
      return;
    }

    try {
      await repository.testConnection();
      syncMessage = `Back4app 連線成功：${activeModule.className}`;
    } catch (error) {
      syncMessage = error instanceof Error ? error.message : 'Back4app 連線失敗';
    }
  }

  function useLocalStorage() {
    dbConfig = { ...defaultBack4appConfig, appId: '', masterKey: '' };
    saveDatabaseConfig();
  }
</script>

<svelte:head>
  <meta name="description" content="鋒兄 Back4app SvelteKit CRUD workspace with CSV import and export." />
</svelte:head>

<main class="app-shell">
  <ModuleNav {modules} {activeModule} onSelect={selectModule} />

  <section class="workspace">
    <header class="topbar">
      <div>
        <p class="crumb">參考 fengbroaiappwrite / Back4app / Appwrite CSV</p>
        <h2>{activeModule.title}</h2>
        <p>{activeModule.description}</p>
      </div>
      <div class="actions">
        <button class="secondary" type="button" on:click={() => (dbPanelOpen = !dbPanelOpen)}>
          {isBack4appReady(dbConfig) ? 'Back4app 已啟用' : '設定 Back4app'}
        </button>
        <label class="file-button">
          匯入 CSV
          <input type="file" accept=".csv,text/csv" on:change={importCsv} />
        </label>
        <button class="secondary" type="button" on:click={exportCsv}>匯出 CSV</button>
      </div>
    </header>

    {#if dbPanelOpen}
      <Back4appPanel
        bind:config={dbConfig}
        {activeModule}
        onSave={saveDatabaseConfig}
        onTest={testDatabaseConnection}
        onUseLocal={useLocalStorage}
      />
    {/if}

    <StatsRow {activeModule} recordCount={records.length} {totalAmount} {mode} />

    {#if syncMessage}
      <pre class="notice">{syncMessage}</pre>
    {/if}
    {#if loadingRecords}
      <p class="notice">讀取資料中...</p>
    {/if}

    {#if activeModule.id === 'tools'}
      <ToolPanel {toolTab} onTabChange={(tab) => (toolTab = tab)} />
    {/if}

    <RecordForm bind:form {activeModule} {editingId} onSubmit={submitRecord} onCancel={cancelEdit} />

    <section class="list-head">
      <div class="search">
        <input bind:value={query} placeholder={`搜尋 ${activeModule.short}`} />
      </div>
      <div class="compact-actions">
        <button class="ghost" type="button" on:click={resetSeed}>載入範例</button>
        <button class="danger" type="button" on:click={clearModule}>清空</button>
      </div>
    </section>

    {#if importMessage}
      <p class="notice">{importMessage}</p>
    {/if}

    <RecordList
      {activeModule}
      records={filteredRecords}
      onEdit={editRecord}
      onDuplicate={duplicateRecord}
      onDelete={deleteRecord}
      onAdjustAmount={adjustAmount}
    />
  </section>
</main>
