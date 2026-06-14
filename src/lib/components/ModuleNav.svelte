<script lang="ts">
  import type { ToolTab } from '$lib/components/ToolPanel.svelte';
  import type { ModuleConfig } from '$lib/types';

  export let modules: ModuleConfig[];
  export let activeModule: ModuleConfig;
  export let toolTab: ToolTab = 'price';
  export let onSelect: (module: ModuleConfig) => void;
  export let onToolTabChange: (tab: ToolTab) => void = () => undefined;

  const toolChildren: Array<{ id: ToolTab; label: string; icon: string; subtitle?: string }> = [
    { id: 'price', label: '鋒兄比價', icon: '⌕' },
    { id: 'phone', label: '手機比價', icon: '▯' },
    { id: 'tube', label: '鋒兄Tube', icon: '▷' },
    { id: 'finance', label: '鋒兄金融', icon: '▥', subtitle: 'CNBC 報價' }
  ];

  $: toolsModule = modules.find((module) => module.id === 'tools');

  function selectToolChild(tab: ToolTab) {
    if (toolsModule && activeModule.id !== 'tools') onSelect(toolsModule);
    onToolTabChange(tab);
  }
</script>

<aside class="sidebar">
  <div class="sidebar-panel">
    <div class="brand">
      <div class="brand-mark">⌘</div>
      <div>
        <p>FengBro</p>
        <h1>AI Appwrite Console</h1>
      </div>
    </div>

    <div class="design-mode">
      <span>◐</span>
      <div>
        <p>Design Mode</p>
        <strong>Impeccable 2026</strong>
      </div>
    </div>

    <nav aria-label="鋒兄選單">
      {#each modules as module}
        <div class="nav-group" class:expanded={module.id === 'tools'}>
          <button
            class:active={module.id === activeModule.id}
            class="nav-item"
            type="button"
            on:click={() => onSelect(module)}
          >
            <span>{module.icon}</span>
            <strong>{module.short}</strong>
            {#if module.id === 'tools'}
              <em>⌄</em>
            {/if}
          </button>

          {#if module.id === 'tools'}
            <div class="subnav" aria-label="鋒兄工具子項目">
              {#each toolChildren as child}
                <button
                  class:active={activeModule.id === 'tools' && toolTab === child.id}
                  type="button"
                  on:click={() => selectToolChild(child.id)}
                >
                  <span>{child.icon}</span>
                  <strong>{child.label}</strong>
                  {#if child.subtitle}<small>{child.subtitle}</small>{/if}
                </button>
              {/each}
            </div>
          {/if}
        </div>
      {/each}
    </nav>

    <div class="workspace-note">
      <span>⚙</span>
      <div>
        <strong>Unified Household Workspace</strong>
        <p>將訂閱、食品、文件與工具集中在一個安靜的工作台裡。</p>
      </div>
    </div>
  </div>
</aside>
