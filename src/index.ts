// клиент публичного API Хламбурга: fetch, без зависимостей. 429 повторяется по Retry-After, остальные ошибки — HlamburgError
import type { Player, Prices, Season, Status, Top } from "./types.js";

export type * from "./types.js";
export const ORIGIN = "https://hlam.besthost.one";
export type Options = { origin?: string; key?: string; lang?: "ru" | "en"; retries?: number; fetch?: typeof fetch };
export type TopKind = "level" | "league" | "season";

export class HlamburgError extends Error {
  readonly status: number; readonly code: string; readonly retryAfter?: number;
  constructor(status: number, code: string, message: string, retryAfter?: number) { super(message); this.name = "HlamburgError"; this.status = status; this.code = code; this.retryAfter = retryAfter; }
}
const wait = (s: number) => new Promise((ok) => setTimeout(ok, s * 1000));

export class Hlamburg {
  private o: Required<Pick<Options, "origin" | "retries">> & Options;
  constructor(o: Options = {}) { this.o = { origin: ORIGIN, retries: 2, ...o }; }
  private async get<T>(path: string, q: Record<string, string | number | undefined> = {}): Promise<T> {
    const u = new URL(`/api/public/v1${path}`, this.o.origin), f = this.o.fetch ?? fetch;
    for (const [k, v] of Object.entries(q)) if (v !== undefined) u.searchParams.set(k, String(v));
    for (let i = 0; ; i++) {
      const r = await f(u, { headers: this.o.key ? { Authorization: `Bearer ${this.o.key}` } : {} });
      if (r.ok) return await r.json() as T;
      const j = await r.json().catch(() => ({})) as { error?: string; message?: string; retry_after?: number }, after = Number(r.headers.get("Retry-After") ?? j.retry_after) || undefined;
      if (r.status === 429 && i < this.o.retries && j.error !== "daily_limit") { await wait(Math.min(after ?? 1, 60)); continue; }
      throw new HlamburgError(r.status, j.error ?? "internal", j.message ?? `HTTP ${r.status}`, after);
    }
  }
  status() { return this.get<Status>("/status"); }
  season() { return this.get<Season>("/season"); }
  tops(kind: TopKind, q: { limit?: number; offset?: number } = {}) { return this.get<Top>(`/tops/${kind}`, { ...q, lang: this.o.lang }); }
  /** номер игрока или его адрес. закрытый профиль — HlamburgError со status 404 */
  player(id: number | string) { return this.get<Player>(`/players/${encodeURIComponent(id)}`, { lang: this.o.lang }); }
  prices() { return this.get<Prices>("/market/prices", { lang: this.o.lang }); }
}
export const playerCardUrl = (id: number, origin = ORIGIN) => `${origin}/embed/player/${id}`;

export type GameOptions = { origin?: string; title?: string };
/** игра во фрейме: работает только на acyka.cc и его поддоменах. вход идёт в окне сайта игры, странице вокруг данные игрока не приходят */
export function mountGame(el: HTMLElement, o: GameOptions = {}): HTMLIFrameElement {
  const f = el.ownerDocument.createElement("iframe");
  f.src = `${o.origin ?? ORIGIN}/site/app?frame=1`; f.title = o.title ?? "Хламбург"; f.style.cssText = "width:100%;height:100%;border:0"; f.allow = "clipboard-write";
  el.replaceChildren(f); return f;
}
