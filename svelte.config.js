import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

// GitHub Pages のプロジェクトページは /<repo>/ 配下で配信される。
// デプロイ時は workflow で BASE_PATH=/fade-ticae を渡す。ローカルは空。
const base = process.env.BASE_PATH ?? '';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    // SPA 構成：未知ルートは 404.html にフォールバック（GitHub Pages 慣例）
    adapter: adapter({ fallback: '404.html' }),
    paths: { base }
  }
};

export default config;
