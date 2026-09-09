<script lang="ts">
  import type { ModuleConfig, RecordItem } from '$lib/types';
  import { primaryValue, recordSummary, statusText } from '$lib/record';

  export let activeModule: ModuleConfig;
  export let records: RecordItem[] = [];
  export let onEdit: (item: RecordItem) => void;
  export let onDuplicate: (item: RecordItem) => void;
  export let onDelete: (item: RecordItem) => void;
  export let onAdjustAmount: (item: RecordItem, delta: number) => void;
</script>

<section class="records" aria-label="資料列表">
  {#if records.length === 0}
    <div class="empty">
      <strong>目前沒有資料</strong>
      <span>可以新增一筆，或匯入你現有的 Appwrite CSV。</span>
    </div>
  {:else}
    {#each records as item, index}
      <article class="record-row">
        <span class="row-index">{String(index + 1).padStart(2, '0')}</span>
        <div class="row-body">
          <div class="avatar">{activeModule.icon}</div>
          <div>
            <h3>{primaryValue(activeModule, item) || '未命名'}</h3>
            <p>{recordSummary(activeModule, item)}</p>
            {#if item.note || item.content}
              <pre>{item.note || item.content}</pre>
            {/if}
          </div>
        </div>

        <div class="row-tools">
          {#if statusText(item)}
            <span class="status">{statusText(item)}</span>
          {/if}
          {#if activeModule.id === 'food'}
            <div class="stock">
              <button type="button" aria-label="減少庫存" on:click={() => onAdjustAmount(item, -1)}>-</button>
              <strong>{item.amount}</strong>
              <button type="button" aria-label="增加庫存" on:click={() => onAdjustAmount(item, 1)}>+</button>
            </div>
          {/if}
          <div class="row-actions">
            <button type="button" on:click={() => onEdit(item)}>編輯</button>
            <button type="button" on:click={() => onDuplicate(item)}>複製</button>
            <button type="button" on:click={() => onDelete(item)}>刪除</button>
          </div>
        </div>
      </article>
    {/each}
  {/if}
</section>