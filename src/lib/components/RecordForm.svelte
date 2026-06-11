<script lang="ts">
  import type { ModuleConfig, RecordItem } from '$lib/types';

  export let activeModule: ModuleConfig;
  export let form: RecordItem;
  export let editingId = '';
  export let onSubmit: () => void;
  export let onCancel: () => void;

  function setField(key: string, value: string | number | boolean) {
    form = { ...form, [key]: value };
  }
</script>

<section class="editor">
  <div class="section-title">
    <div>
      <h3>{editingId ? '編輯資料' : '新增資料'}</h3>
      <p>{editingId ? '修改後按儲存更新目前資料。' : '填入欄位後新增到目前模組。'}</p>
    </div>
    {#if editingId}
      <button class="ghost" type="button" on:click={onCancel}>取消編輯</button>
    {/if}
  </div>

  <form class="form-grid" on:submit|preventDefault={onSubmit}>
    {#each activeModule.fields as field}
      <label class:wide={field.type === 'textarea'}>
        <span>{field.label}</span>
        {#if field.type === 'textarea'}
          <textarea
            rows="4"
            placeholder={field.placeholder || field.label}
            value={String(form[field.key] ?? '')}
            on:input={(event) => setField(field.key, (event.currentTarget as HTMLTextAreaElement).value)}
          ></textarea>
        {:else if field.type === 'checkbox'}
          <span class="switch-row">
            <input
              type="checkbox"
              checked={form[field.key] === true || form[field.key] === 'true'}
              on:change={(event) => setField(field.key, (event.currentTarget as HTMLInputElement).checked)}
            />
            <em>{form[field.key] === true || form[field.key] === 'true' ? '是' : '否'}</em>
          </span>
        {:else}
          <input
            type={field.type || 'text'}
            placeholder={field.placeholder || field.label}
            value={String(form[field.key] ?? '')}
            on:input={(event) => setField(field.key, (event.currentTarget as HTMLInputElement).value)}
          />
        {/if}
      </label>
    {/each}

    <div class="form-actions">
      <button class="primary" type="submit">{editingId ? '儲存修改' : '新增資料'}</button>
      <button class="secondary" type="button" on:click={onCancel}>清空表單</button>
    </div>
  </form>
</section>
