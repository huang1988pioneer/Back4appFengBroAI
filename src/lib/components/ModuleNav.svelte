<script lang="ts">
  import type { ModuleConfig } from '$lib/types';

  export let modules: ModuleConfig[];
  export let activeModule: ModuleConfig;
  export let onSelect: (module: ModuleConfig) => void;
</script>

<aside class="sidebar">
  <div class="brand">
    <div class="brand-mark">鋒</div>
    <div>
      <h1>鋒兄工作台</h1>
      <p>SvelteKit CRUD</p>
    </div>
  </div>

  <nav aria-label="模組">
    {#each modules as module}
      <button
        class:active={module.id === activeModule.id}
        class="nav-item"
        type="button"
        on:click={() => onSelect(module)}
      >
        <span>{module.icon}</span>
        <strong>{module.short}</strong>
      </button>
    {/each}
  </nav>
</aside>
