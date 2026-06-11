import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: 'index.html',  // 使用 index.html 作為 fallback，適合 Vercel 和 Cloudflare
      precompress: false,
      strict: true
    })
  }
};

export default config;
