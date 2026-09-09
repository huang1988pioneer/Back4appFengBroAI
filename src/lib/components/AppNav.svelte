<script lang="ts">
  import { onMount } from 'svelte';
  import type { ToolTab } from '$lib/components/ToolPanel.svelte';
  import type { ModuleConfig } from '$lib/types';
  import { applyTheme, nextTheme, readTheme, themeGlyph, themeLabel, type ThemeMode } from '$lib/theme';

  export let modules: ModuleConfig[];
  export let activeModule: ModuleConfig;
  export let activeLabel = '';
  export let toolTab: ToolTab = 'price';
  export let onSelect: (module: ModuleConfig) => void;
  export let onToolTabChange: (tab: ToolTab) => void = () => undefined;

  const toolChildren: Array<{ id: ToolTab; label: string; icon: string; subtitle: string }> = [
    { id: 'price', label: '鋒兄比價', icon: '⌕', subtitle: 'BigGo 歷史價' },
    { id: 'phone', label: '手機比價', icon: '▯', subtitle: '地標 / 傑昇' },
    { id: 'tube', label: '鋒兄Tube', icon: '▷', subtitle: 'YouTube RSS' },
    { id: 'finance', label: '鋒兄金融', icon: '▥', subtitle: 'Yahoo 報價' }
  ];

  const navGroups: Array<{ label: string; items: ModuleConfig[]; toolsChild?: boolean }> = [
    {
      label: '日常管理',
      items: modules.filter((module) => ['subscription', 'food', 'article', 'commonaccount', 'bank', 'routine'].includes(module.id))
    },
    { label: '工具', items: modules.filter((module) => module.id === 'tools'), toolsChild: true },
    { label: '系統', items: modules.filter((module) => ['settings', 'about'].includes(module.id)) }
  ];

  let themeMode: ThemeMode = 'system';
  let sheetOpen = false;

  $: toolsModule = modules.find((module) => module.id === 'tools');
  $: dockModules = modules.slice(0, 4);
  $: isDockActive = dockModules.some((module) => module.id === activeModule.id);

  onMount(() => {
    themeMode = readTheme();
    applyTheme(themeMode);

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onSystemChange = () => {
      if (themeMode === 'system') applyTheme('system');
    };
    media.addEventListener('change', onSystemChange);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') sheetOpen = false;
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      media.removeEventListener('change', onSystemChange);
      window.removeEventListener('keydown', onKeyDown);
    };
  });

  function toggleTheme() {
    themeMode = nextTheme(themeMode);
    applyTheme(themeMode);
  }

  function pick(module: ModuleConfig) {
    sheetOpen = false;
    onSelect(module);
  }

  function selectToolChild(tab: ToolTab) {
    if (toolsModule && activeModule.id !== 'tools') onSelect(toolsModule);
    onToolTabChange(tab);
    sheetOpen = false;
  }
</script>

<!-- 桌機分組側欄 ≥1024px -->
<aside class="sidebar" aria-label="模組導覽">
  <div class="sidebar-brand">
    <span class="brand-mark">⌘</span>
    <div class="brand-text">
      <p>FengBro</p>
      <h1>鋒兄 AI 工作台</h1>
    </div>
  </div>

  <nav class="sidebar-nav" aria-label="主要導覽">
    {#each navGroups as group}
      <div class="nav-group">
        <div class="nav-group-title">{group.label}</div>
        {#each group.items as module}
          <button
            type="button"
            title={module.title}
            aria-current={module.id === activeModule.id ? 'page' : undefined}
            class="nav-item"
            class:active={module.id === activeModule.id}
            on:click={() => pick(module)}
          >
            <span class="glyph">{module.icon}</span>
            <span>
              <strong>{module.short}</strong>
              <small>{module.className}</small>
            </span>
          </button>
          {#if group.toolsChild}
            <div class="nav-child" aria-label="鋒兄工具子項目">
              {#each toolChildren as child}
                <button
                  type="button"
                  aria-current={toolsModule?.id === activeModule.id && toolTab === child.id ? 'page' : undefined}
                  class:active={toolsModule?.id === activeModule.id && toolTab === child.id}
                  on:click={() => selectToolChild(child.id)}
                >
                  <span class="glyph">{child.icon}</span>
                  <span>{child.label}</span>
                </button>
              {/each}
            </div>
          {/if}
        {/each}
      </div>
    {/each}
  </nav>

  <div class="sidebar-foot">
    <span class="foot-note">Impeccable 風格<br />紙帳工作台</span>
    <button class="icon-button" type="button" on:click={toggleTheme} aria-label={`切換主題（目前：${themeLabel(themeMode)}）`} title={themeLabel(themeMode)}>
      {themeGlyph(themeMode)}
    </button>
  </div>
</aside>

<!-- 平板圖示側欄 768–1023px -->
<aside class="rail-nav" aria-label="模組導覽">
  <div class="rail-head">
    <span class="brand-mark">⌘</span>
  </div>
  <nav class="rail-items" aria-label="主要導覽">
    {#each modules as module}
      <button
        type="button"
        title={module.title}
        aria-current={module.id === activeModule.id ? 'page' : undefined}
        class="rail-link"
        class:active={module.id === activeModule.id}
        on:click={() => pick(module)}
      >
        <span class="glyph">{module.icon}</span>
        <span class="label">{module.short}</span>
      </button>
    {/each}
  </nav>
  <div class="rail-foot">
    <button type="button" class="rail-link" on:click={toggleTheme} title={themeLabel(themeMode)}>
      <span class="glyph">{themeGlyph(themeMode)}</span>
      <span class="label">主題</span>
    </button>
  </div>
</aside>

<header class="chrome">
  <div class="chrome-row">
    <div class="brand">
      <span class="brand-mark">⌘</span>
      <div class="brand-text">
        <p>FengBro</p>
        <h1>鋒兄 AI 工作台</h1>
      </div>
    </div>

    <div class="topbar-title">
      <p>Console View · {activeLabel || activeModule.title}</p>
      <h2>{activeModule.title}</h2>
    </div>

    <div class="chrome-actions">
      <div class="mode-cluster">
        <button
          class="icon-button"
          type="button"
          on:click={toggleTheme}
          aria-label={`切換主題（目前：${themeLabel(themeMode)}）`}
          title={themeLabel(themeMode)}
        >
          {themeGlyph(themeMode)}
        </button>
        <div class="mode-label">
          <p>Design Mode</p>
          <strong>紙帳 2026</strong>
        </div>
      </div>
      <button
        class="icon-button menu-button"
        type="button"
        aria-expanded={sheetOpen}
        aria-controls="module-sheet"
        aria-label={sheetOpen ? '關閉選單' : '開啟選單'}
        on:click={() => (sheetOpen = !sheetOpen)}
      >
        {sheetOpen ? '✕' : '☰'}
      </button>
    </div>
  </div>
</header>

<!-- 手機底部 dock -->
<nav class="dock" aria-label="手機快捷選單">
  <div class="dock-inner">
    {#each dockModules as module}
      <button
        type="button"
        aria-current={module.id === activeModule.id ? 'page' : undefined}
        class="dock-link"
        class:active={module.id === activeModule.id}
        on:click={() => pick(module)}
      >
        <span class="glyph">{module.icon}</span>
        <span class="label">{module.short}</span>
      </button>
    {/each}
    <button
      type="button"
      class="dock-link"
      class:active={sheetOpen || !isDockActive}
      aria-expanded={sheetOpen}
      aria-controls="module-sheet"
      on:click={() => (sheetOpen = !sheetOpen)}
    >
      <span class="glyph">⊞</span>
      <span class="label">更多</span>
    </button>
  </div>
</nav>

{#if sheetOpen}
  <button class="sheet-backdrop" type="button" aria-label="關閉選單背景" on:click={() => (sheetOpen = false)}></button>
  <div id="module-sheet" class="sheet" role="dialog" aria-modal="true" aria-label="全部模組">
    <span class="sheet-handle" aria-hidden="true"></span>
    <div class="sheet-head">
      <strong>全部模組</strong>
      <button class="icon-button menu-button" type="button" aria-label="關閉選單" on:click={() => (sheetOpen = false)}>✕</button>
    </div>
    <div class="sheet-body">
      <div class="sheet-grid">
        {#each modules as module}
          <button
            type="button"
            aria-current={module.id === activeModule.id ? 'page' : undefined}
            class:active={module.id === activeModule.id}
            on:click={() => pick(module)}
          >
            <span class="glyph">{module.icon}</span>
            <span class="label">{module.short}</span>
          </button>
        {/each}
      </div>
    </div>
  </div>
{/if}