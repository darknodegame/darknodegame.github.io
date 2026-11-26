// Minusweeper core logic: pure, DOM-free, usable from the browser and from node tests.
(function (root) {
  'use strict';

  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function createGame(opts) {
    const w = opts.w, h = opts.h;
    const mines = Math.min(opts.mines, w * h - 9);
    const seed = opts.seed != null ? opts.seed : (Math.random() * 2 ** 32) >>> 0;
    return {
      w, h, mines, seed,
      mine: new Uint8Array(w * h),     // live (not yet clicked) mine
      defused: new Uint8Array(w * h),  // mine the player clicked
      open: new Uint8Array(w * h),     // revealed cell
      placed: false,
      status: 'ready',                 // ready | playing | won | lost
      defusedCount: 0,
      boomAt: -1,
    };
  }

  function neighbors(g, i) {
    const x = i % g.w, y = (i / g.w) | 0, out = [];
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dy) continue;
        const nx = x + dx, ny = y + dy;
        if (nx >= 0 && ny >= 0 && nx < g.w && ny < g.h) out.push(ny * g.w + nx);
      }
    }
    return out;
  }

  // Number shown on a revealed cell: live mines around it. Drops as mines get clicked.
  function count(g, i) {
    let n = 0;
    for (const j of neighbors(g, i)) n += g.mine[j];
    return n;
  }

  // Mines avoid the first click and its neighbours so the game always opens with a cascade.
  function placeMines(g, first) {
    const rand = mulberry32(g.seed);
    const banned = new Set([first, ...neighbors(g, first)]);
    const pool = [];
    for (let i = 0; i < g.w * g.h; i++) if (!banned.has(i)) pool.push(i);
    for (let k = 0; k < g.mines; k++) {
      const r = k + Math.floor(rand() * (pool.length - k));
      [pool[k], pool[r]] = [pool[r], pool[k]];
      g.mine[pool[k]] = 1;
    }
    g.placed = true;
  }

  // Flood-reveal from every zero cell in `starts`; returns newly opened indices.
  function cascade(g, starts) {
    const opened = [];
    const stack = starts.filter((i) => g.open[i] && count(g, i) === 0);
    while (stack.length) {
      const i = stack.pop();
      for (const j of neighbors(g, i)) {
        if (g.open[j] || g.mine[j]) continue;
        g.open[j] = 1;
        opened.push(j);
        if (count(g, j) === 0) stack.push(j);
      }
    }
    return opened;
  }

  function click(g, i) {
    if (g.status === 'won' || g.status === 'lost' || g.open[i]) {
      return { result: 'ignored', opened: [], changed: [] };
    }

    if (!g.placed) {
      placeMines(g, i);
      g.status = 'playing';
      g.open[i] = 1;
      return { result: 'opened', opened: [i, ...cascade(g, [i])], changed: [] };
    }

    if (!g.mine[i]) {
      g.status = 'lost';
      g.boomAt = i;
      return { result: 'boom', opened: [], changed: [] };
    }

    g.mine[i] = 0;
    g.defused[i] = 1;
    g.open[i] = 1;
    g.defusedCount++;
    const around = neighbors(g, i);
    const changed = around.filter((j) => g.open[j]);
    const opened = [i, ...cascade(g, [i, ...changed])];

    if (g.defusedCount === g.mines) {
      g.status = 'won';
      for (let k = 0; k < g.w * g.h; k++) {
        if (!g.open[k]) { g.open[k] = 1; opened.push(k); }
      }
    }
    return { result: 'defused', opened, changed };
  }

  // Custom size limits: classic 9..30 x 9..24; at least the 3x3 opening free and one mine to win.
  function customLevel(w, h, free) {
    const clamp = (v, lo, hi, d) => (Number.isFinite(+v) && v !== '' && v != null ? Math.min(hi, Math.max(lo, Math.round(+v))) : d);
    w = clamp(w, 9, 30, 9);
    h = clamp(h, 9, 24, 9);
    free = clamp(free, 9, w * h - 1, 10);
    return { w, h, free };
  }

  const api = { createGame, click, count, neighbors, mulberry32, customLevel };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Minus = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
