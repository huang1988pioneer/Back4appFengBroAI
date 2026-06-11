<script lang="ts">
  export let toolTab = 'price';
  export let onTabChange: (tab: string) => void;

  const tabs = [
    ['price', '鋒兄比價'],
    ['phone', '手機比價'],
    ['tube', '鋒兄Tube'],
    ['finance', '鋒兄金融']
  ];
</script>

<section class="tool-tabs" aria-label="工具子項目">
  {#each tabs as tab}
    <button class:active={toolTab === tab[0]} type="button" on:click={() => onTabChange(tab[0])}>
      {tab[1]}
    </button>
  {/each}
</section>

<section class="tool-panel">
  {#if toolTab === 'price'}
    <h3>鋒兄比價</h3>
    <p>貼上商品網址或關鍵字，先存成工具紀錄；之後可接 BigGo、PChome 或 Back4app Functions。</p>
  {:else if toolTab === 'phone'}
    <h3>手機比價</h3>
    <p>預設支援 Landtop / 手機型號查詢紀錄，可管理 Apple、Samsung 與通路價格線索。</p>
  {:else if toolTab === 'tube'}
    <h3>鋒兄Tube</h3>
    <p>保存頻道 URL、查詢字串與備註，方便之後接 YouTube RSS 或 Back4app 排程抓取。</p>
  {:else}
    <h3>鋒兄金融</h3>
    <p>保存股票、匯率、利率與加密貨幣查詢設定，後續可串 Yahoo Finance 或自建 API。</p>
  {/if}
</section>
