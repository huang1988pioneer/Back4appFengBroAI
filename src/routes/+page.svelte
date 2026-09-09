<script lang="ts">
  import { onMount } from 'svelte';
  import Back4appPanel from '$lib/components/Back4appPanel.svelte';
  import AppNav from '$lib/components/AppNav.svelte';
  import RecordForm from '$lib/components/RecordForm.svelte';
  import RecordList from '$lib/components/RecordList.svelte';
  import StatsRow from '$lib/components/StatsRow.svelte';
  import ToolPanel from '$lib/components/ToolPanel.svelte';
  import type { ToolTab } from '$lib/components/ToolPanel.svelte';
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

  const hiddenMenuIds = new Set(['image', 'video', 'music', 'document', 'podcast']);
  const menuModules = modules.filter((module) => !hiddenMenuIds.has(module.id));

  let activeModule = modules[0];
  let records: RecordItem[] = [];
  let form: RecordItem = createBlankRecord(activeModule);
  let editingId = '';
  let query = '';
  let importMessage = '';
  let syncMessage = '';
  let toolTab: ToolTab = 'price';
  let dbPanelOpen = false;
  let loadingRecords = false;
  let dbConfig: Back4appConfig = { ...defaultBack4appConfig };
  let mode: RepositoryMode = 'localStorage';

  $: activeSurfaceLabel = activeModule.id === 'tools' ? toolTabLabel(toolTab) : activeModule.short;
  $: mode = getRepository(activeModule).mode;
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

  function getRepository(module: ModuleConfig) {
    return new FengbroRepository(module, dbConfig);
  }

  async function selectModule(module: ModuleConfig) {
    activeModule = module;
    form = createBlankRecord(module);
    editingId = '';
    query = '';
    importMessage = '';
    await loadRecords(module);
  }

  async function loadRecords(module = activeModule) {
    loadingRecords = true;
    syncMessage = '';
    const activeRepository = getRepository(module);
    const activeMode = activeRepository.mode;

    try {
      const nextRecords = await activeRepository.list();
      if (activeModule.id !== module.id) return;
      records = nextRecords;
      syncMessage = `${activeMode === 'back4app' ? 'Back4app' : 'localStorage'} 已載入：${module.className} / ${records.length} 筆`;
    } catch (error) {
      if (activeModule.id === module.id) {
        records = [];
        syncMessage = error instanceof Error ? error.message : '讀取資料失敗';
      }
    } finally {
      if (activeModule.id === module.id) loadingRecords = false;
    }
  }

  function cancelEdit() {
    form = createBlankRecord(activeModule);
    editingId = '';
  }

  async function submitRecord() {
    const module = activeModule;
    const activeRepository = getRepository(module);
    const cleaned = normalizeRecord(module, form);

    try {
      if (editingId) await activeRepository.update(editingId, cleaned);
      else await activeRepository.create(cleaned);
      cancelEdit();
      await loadRecords(module);
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
    const module = activeModule;
    const copy: RecordItem = { ...item, id: '' };
    const label = primaryValue(module, item);
    if (label) copy[primaryField(module).key] = `${label} (複製)`;

    try {
      await getRepository(module).create(normalizeRecord(module, copy));
      await loadRecords(module);
    } catch (error) {
      syncMessage = error instanceof Error ? error.message : '複製失敗';
    }
  }

  async function deleteRecord(item: RecordItem) {
    const module = activeModule;
    const label = primaryValue(module, item) || '這筆資料';
    if (!confirm(`刪除 ${label}？`)) return;

    try {
      await getRepository(module).delete(item.id);
      await loadRecords(module);
    } catch (error) {
      syncMessage = error instanceof Error ? error.message : '刪除失敗';
    }
  }

  async function adjustAmount(item: RecordItem, delta: number) {
    const module = activeModule;
    const updated = normalizeRecord(module, {
      ...item,
      amount: Math.max(0, Number(item.amount || 0) + delta)
    });

    try {
      await getRepository(module).update(item.id, updated);
      await loadRecords(module);
    } catch (error) {
      syncMessage = error instanceof Error ? error.message : '更新庫存失敗';
    }
  }

  async function importCsv(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const module = activeModule;
    const activeRepository = getRepository(module);
    const imported = recordsFromCsv(module, await file.text());
    let success = 0;
    for (const item of imported) {
      await activeRepository.create(item);
      success += 1;
    }
    await loadRecords(module);
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
    const module = activeModule;
    if (!confirm(`重新載入 ${module.title} 範例資料？`)) return;

    const activeRepository = getRepository(module);
    if (activeRepository.mode === 'back4app') {
      for (const item of normalizeSeed(module)) await activeRepository.create(item);
    } else {
      await activeRepository.replaceLocal(normalizeSeed(module));
    }
    await loadRecords(module);
  }

  async function clearModule() {
    const module = activeModule;
    if (!confirm(`清空 ${module.title} 目前資料？`)) return;

    const activeRepository = getRepository(module);
    for (const item of records) await activeRepository.delete(item.id);
    await loadRecords(module);
  }

  function saveDatabaseConfig() {
    saveBack4appConfig(dbConfig);
    syncMessage = isBack4appReady(dbConfig) ? 'Back4app 設定已儲存' : 'Back4app 設定未完整，將使用 localStorage';
    void loadRecords(activeModule);
  }

  async function testDatabaseConnection() {
    if (!isBack4appReady(dbConfig)) {
      syncMessage = '請先填入 Endpoint、Application ID 與 Master Key';
      return;
    }

    try {
      await getRepository(activeModule).testConnection();
      syncMessage = `Back4app 連線成功：${activeModule.className}`;
    } catch (error) {
      syncMessage = error instanceof Error ? error.message : 'Back4app 連線失敗';
    }
  }

  function useLocalStorage() {
    dbConfig = { ...defaultBack4appConfig, appId: '', masterKey: '' };
    saveDatabaseConfig();
  }

  function toolTabLabel(tab: ToolTab) {
    if (tab === 'price') return '鋒兄比價';
    if (tab === 'phone') return '手機比價';
    if (tab === 'tube') return '鋒兄Tube';
    return '鋒兄金融';
  }

  function todayLabel() {
    return new Intl.DateTimeFormat('zh-TW', {
      month: 'long',
      day: 'numeric',
      weekday: 'long',
      timeZone: 'Asia/Taipei'
    }).format(new Date());
  }
</script>

<svelte:head>
  <link rel="icon" href="/favicon.svg" />
  <meta name="description" content="鋒兄 Back4app SvelteKit CRUD workspace with CSV import and export." />
</svelte:head>

<div class="ambient-backdrop" aria-hidden="true"></div>
<div class="ambient-topglow" aria-hidden="true"></div>

<div class="app-shell">
  <AppNav
    modules={menuModules}
    {activeModule}
    activeLabel={activeSurfaceLabel}
    {toolTab}
    onSelect={selectModule}
    onToolTabChange={(tab) => (toolTab = tab)}
  />

  <div class="app-body">
    <main class="workspace">
      <div class="workspace-inner">
        <header class="page-head">
          <div class="page-head-main">
            <p class="eyebrow">Console View · {activeSurfaceLabel}</p>
            <h2>{activeModule.title}</h2>
            <p class="lede">{activeModule.description}</p>
            <div class="page-meta">
              <span class="meta-pill"><small>Today</small>{todayLabel()}</span>
              <span class="meta-pill"><small>Modules</small>{menuModules.length} 個模組</span>
              {#if activeModule.id !== 'tools'}
                <span class="meta-pill"><small>Class</small>{activeModule.className}</span>
              {/if}
            </div>
          </div>

          {#if activeModule.id !== 'tools'}
            <div class="head-actions">
              <button class="secondary" type="button" on:click={() => (dbPanelOpen = !dbPanelOpen)}>
                {isBack4appReady(dbConfig) ? 'Back4app 已啟用' : '設定 Back4app'}
              </button>
              <label class="file-button">
                匯入 CSV
                <input type="file" accept=".csv,text/csv" on:change={importCsv} />
              </label>
              <button class="secondary" type="button" on:click={exportCsv}>匯出 CSV</button>
            </div>
          {/if}
        </header>

        {#if activeModule.id === 'tools'}
          <ToolPanel {toolTab} onTabChange={(tab) => (toolTab = tab)} />
        {:else}
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
            <p class="notice">{syncMessage}</p>
          {/if}
          {#if loadingRecords}
            <p class="notice">讀取資料中...</p>
          {/if}

          <div class="split">
            <div class="records-col">
              <section class="panel">
                <div class="list-head">
                  <div class="search">
                    <input bind:value={query} placeholder={`搜尋 ${activeModule.short}`} aria-label={`搜尋 ${activeModule.short}`} />
                  </div>
                  <div class="compact-actions">
                    <button class="ghost" type="button" on:click={resetSeed}>載入範例</button>
                    <button class="danger" type="button" on:click={clearModule}>清空</button>
                  </div>
                </div>

                {#if importMessage}
                  <p class="notice" style="margin-top:0.75rem;margin-bottom:0">{importMessage}</p>
                {/if}
              </section>

              <RecordList
                {activeModule}
                records={filteredRecords}
                onEdit={editRecord}
                onDuplicate={duplicateRecord}
                onDelete={deleteRecord}
                onAdjustAmount={adjustAmount}
              />
            </div>

            <aside class="inspector" class:editing={!!editingId} aria-label="資料編輯器">
              <RecordForm bind:form {activeModule} {editingId} onSubmit={submitRecord} onCancel={cancelEdit} />
            </aside>
          </div>
        {/if}
      </div>
    </main>
  </div>
</div>
