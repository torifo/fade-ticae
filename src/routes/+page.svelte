<script lang="ts">
  import { scale } from 'svelte/transition';
  import { backOut, cubicOut } from 'svelte/easing';
  import { Circle, X as XIcon, RotateCcw } from 'lucide-svelte';
  import confetti from 'canvas-confetti';

  type Player = 'O' | 'X';
  type Cell = { player: Player; key: number } | null;

  const WIN_LINES = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // 横
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // 縦
    [0, 4, 8], [2, 4, 6] // 斜め
  ];

  // --- 状態（Svelte 5 Runes）---
  let cells = $state<Cell[]>(Array(9).fill(null));
  // 各プレイヤーが置いたマスを古い順に保持するキュー
  let queues = $state<{ O: number[]; X: number[] }>({ O: [], X: [] });
  let current = $state<Player>('O');
  let winner = $state<Player | null>(null);
  let winLine = $state<number[] | null>(null);
  let scores = $state<{ O: number; X: number }>({ O: 0, X: 0 });

  // マークごとのユニークキー（trantion を正しく発火させるため）
  let seq = 0;

  // 次に消える運命のマス：現在のプレイヤーが既に3つ置いている場合の「最も古いマーク」
  let doomed = $derived(
    !winner && queues[current].length === 3 ? queues[current][0] : -1
  );

  function findWin(board: Cell[]): { player: Player; line: number[] } | null {
    for (const line of WIN_LINES) {
      const [a, b, c] = line;
      const ca = board[a];
      if (ca && board[b]?.player === ca.player && board[c]?.player === ca.player) {
        return { player: ca.player, line };
      }
    }
    return null;
  }

  function place(i: number) {
    if (winner || cells[i]) return;

    const p = current;
    cells[i] = { player: p, key: seq++ };
    queues[p].push(i);

    // 4つ目を置いた瞬間、最も古いマークを盤面から消す
    if (queues[p].length > 3) {
      const oldest = queues[p].shift()!;
      cells[oldest] = null;
    }

    const result = findWin(cells);
    if (result) {
      winner = result.player;
      winLine = result.line;
      scores[result.player] += 1;
      celebrate(result.player);
    } else {
      current = p === 'O' ? 'X' : 'O';
    }
  }

  // 盤面・履歴・手番を初期化（スコアは維持）
  function reset() {
    cells = Array(9).fill(null);
    queues = { O: [], X: [] };
    current = 'O';
    winner = null;
    winLine = null;
  }

  // スコアも含めて完全初期化
  function resetAll() {
    reset();
    scores = { O: 0, X: 0 };
  }

  function celebrate(p: Player) {
    const colors =
      p === 'O' ? ['#818cf8', '#a5b4fc', '#6366f1'] : ['#fb7185', '#fda4af', '#f43f5e'];
    confetti({ particleCount: 110, spread: 72, origin: { y: 0.62 }, colors });
    confetti({ particleCount: 60, spread: 100, startVelocity: 42, decay: 0.92, origin: { y: 0.7 }, colors });
  }
</script>

{#snippet playerCard(p: Player)}
  {@const isO = p === 'O'}
  {@const active = current === p && !winner}
  {@const won = winner === p}
  <div
    class="flex flex-1 items-center gap-3 rounded-2xl border px-4 py-3 transition-all duration-300 {active || won
      ? isO
        ? 'border-indigo-400/60 bg-indigo-500/10 shadow-[0_0_30px_-10px] shadow-indigo-500/50'
        : 'border-rose-400/60 bg-rose-500/10 shadow-[0_0_30px_-10px] shadow-rose-500/50'
      : 'border-white/5 bg-white/[0.02]'}"
  >
    <div class="grid h-9 w-9 shrink-0 place-items-center {isO ? 'text-indigo-300' : 'text-rose-300'}">
      {#if isO}
        <Circle size={22} strokeWidth={2.5} />
      {:else}
        <XIcon size={24} strokeWidth={2.75} />
      {/if}
    </div>
    <div class="flex min-w-0 flex-col">
      <span class="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
        {isO ? 'Player 1' : 'Player 2'}
      </span>
      <span class="font-display text-2xl font-semibold leading-none tabular-nums text-slate-100">
        {scores[p]}
      </span>
    </div>
  </div>
{/snippet}

<div
  class="relative min-h-dvh overflow-hidden bg-slate-950 font-body text-slate-100 antialiased selection:bg-indigo-500/30"
>
  <!-- アンビエントグロー -->
  <div class="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-indigo-600/20 blur-[110px]"></div>
  <div class="pointer-events-none absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-rose-600/20 blur-[110px]"></div>
  <div
    class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_-10%,rgba(99,102,241,0.10),transparent_55%)]"
  ></div>

  <main
    class="relative mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center gap-7 px-5 py-10"
  >
    <!-- ヘッダー -->
    <header class="flex flex-col items-center gap-2 text-center">
      <span class="font-mono text-[11px] uppercase tracking-[0.45em] text-indigo-300/70">
        fading tic-tac-toe
      </span>
      <h1 class="font-display text-5xl font-bold tracking-tight">
        <span class="bg-gradient-to-br from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
          ticae
        </span>
      </h1>
      <p class="max-w-xs text-sm leading-relaxed text-slate-400">
        最新の3手だけが盤面に残る。引き分けのない、無限の三目並べ。
      </p>
    </header>

    <!-- ステータス -->
    <div class="flex h-7 items-center justify-center">
      {#if winner}
        <p class="font-display text-lg font-semibold text-slate-100">
          <span class={winner === 'O' ? 'text-indigo-300' : 'text-rose-300'}>
            {winner === 'O' ? '〇' : '×'}
          </span>
          の勝ち！
        </p>
      {:else}
        <p class="flex items-center gap-2 text-sm text-slate-400">
          <span
            class="h-1.5 w-1.5 animate-pulse rounded-full {current === 'O' ? 'bg-indigo-400' : 'bg-rose-400'}"
          ></span>
          <span class="font-medium {current === 'O' ? 'text-indigo-200' : 'text-rose-200'}">
            {current === 'O' ? '〇' : '×'}
          </span>
          の番です
        </p>
      {/if}
    </div>

    <!-- 盤面 -->
    <div
      class="grid aspect-square w-full grid-cols-3 gap-2.5 rounded-[1.75rem] border border-white/5 bg-white/[0.02] p-2.5 backdrop-blur-sm"
    >
      {#each cells as cell, i (i)}
        <button
          type="button"
          onclick={() => place(i)}
          disabled={!!winner || !!cell}
          aria-label="マス {i + 1}"
          class="group relative grid aspect-square place-items-center rounded-2xl border transition-all duration-200 {winLine?.includes(
            i
          )
            ? winner === 'O'
              ? 'border-indigo-400/70 bg-indigo-500/15 shadow-[0_0_45px_-12px] shadow-indigo-500/70'
              : 'border-rose-400/70 bg-rose-500/15 shadow-[0_0_45px_-12px] shadow-rose-500/70'
            : 'border-white/[0.04] bg-slate-900/40'} {!cell && !winner
            ? 'cursor-pointer hover:border-white/15 hover:bg-slate-800/50 active:scale-[0.97]'
            : 'cursor-default'}"
        >
          {#if cell}
            {@const isDoomed = i === doomed}
            <span
              in:scale={{ duration: 260, start: 0.3, easing: backOut }}
              out:scale={{ duration: 240, start: 0.5, easing: cubicOut }}
              class="flex items-center justify-center transition-opacity duration-300 {cell.player ===
              'O'
                ? 'text-indigo-400'
                : 'text-rose-400'} {isDoomed ? 'animate-pulse opacity-40' : 'opacity-100'}"
            >
              {#if cell.player === 'O'}
                <Circle class="h-11 w-11 sm:h-12 sm:w-12" strokeWidth={2.5} />
              {:else}
                <XIcon class="h-12 w-12 sm:h-[3.25rem] sm:w-[3.25rem]" strokeWidth={2.5} />
              {/if}
            </span>
          {/if}
        </button>
      {/each}
    </div>

    <!-- コントロール -->
    <div class="flex w-full flex-col items-center gap-3">
      <button
        onclick={reset}
        class="group flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-5 py-2.5 text-sm font-medium text-slate-300 transition-all hover:border-white/20 hover:bg-white/[0.06] hover:text-white active:scale-95"
      >
        <RotateCcw size={16} class="transition-transform duration-500 group-hover:-rotate-180" />
        {winner ? 'もう一度' : 'リセット'}
      </button>

      {#if scores.O > 0 || scores.X > 0}
        <button
          onclick={resetAll}
          class="font-mono text-[11px] uppercase tracking-widest text-slate-600 transition-colors hover:text-slate-400"
        >
          スコアもリセット
        </button>
      {/if}
    </div>

    <!-- スコアボード（勝敗の記録） -->
    <div class="flex w-full flex-col items-center gap-2">
      <span class="font-mono text-[10px] uppercase tracking-[0.3em] text-slate-600">score</span>
      <div class="flex w-full items-stretch gap-3">
        {@render playerCard('O')}
        {@render playerCard('X')}
      </div>
    </div>

    <!-- ルールのヒント -->
    <p class="max-w-xs text-center text-xs leading-relaxed text-slate-600">
      各プレイヤーは3つまで配置可能。4つ目を置くと
      <span class="text-slate-500">最も古いマーク</span>
      が消えます（消える手は点滅で予告）。
    </p>
  </main>
</div>
