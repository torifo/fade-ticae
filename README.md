# ticae

> fading tic-tac-toe — 最新の3手だけが盤面に残る、引き分けのない無限の三目並べ。

各プレイヤーが置けるマークは最大3つ。4つ目を置くと最も古いマークが自動的に消えるため、盤面が埋まり切らず引き分けが発生しません。次に消えるマークは点滅で予告されます。

## 技術スタック

- **SvelteKit**（SPA / `adapter-static`）
- **Svelte 5 Runes**（`$state` / `$derived`）
- **TypeScript**
- **Tailwind CSS v4**
- **Lucide**（アイコン）/ **canvas-confetti**（勝利演出）

## 開発

```bash
npm install
npm run dev        # 開発サーバー
npm run build      # 本番ビルド（build/ に静的出力）
npm run preview    # ビルドのプレビュー
npm run check      # 型チェック（svelte-check）
```

## 遊び方

1. 〇（先攻）と×（後攻）が同じ端末で交互にマスをタップ。
2. 各自4つ目を置くと、自分の最も古いマークが消える（消える手は点滅で予告）。
3. 縦・横・斜めのいずれかに自分のマークが3つ並んだら勝ち。
4. 「リセット」で盤面をやり直し（スコアは維持）。

詳細な要件は [`spec.md`](./spec.md) を参照。
