import { test } from "node:test";
import assert from "node:assert/strict";
import { Hlamburg, HlamburgError, mountGame, playerCardUrl } from "../dist/index.js";

const res = (code, body, h = {}) => new Response(JSON.stringify(body), { status: code, headers: h });
const api = (f, o = {}) => new Hlamburg({ fetch: f, ...o });

test("читает ответ и шлёт параметры", async () => {
  let seen; const r = await api(async (u) => { seen = String(u); return res(200, { rows: [] }); }, { lang: "en" }).tops("level", { limit: 5 });
  assert.deepEqual(r, { rows: [] }); assert.match(seen, /\/api\/public\/v1\/tops\/level\?limit=5&lang=en$/);
});
test("ключ уходит заголовком", async () => {
  let h; await api(async (_, o) => { h = o.headers; return res(200, {}); }, { key: "hk_x" }).status(); assert.equal(h.Authorization, "Bearer hk_x");
});
test("понятная ошибка", async () => {
  await assert.rejects(api(async () => res(404, { error: "not_found", message: "Такого нет." })).player(9), (e) => e instanceof HlamburgError && e.status === 404 && e.code === "not_found" && e.message === "Такого нет.");
});
test("429 повторяется по Retry-After", async () => {
  let n = 0; const r = await api(async () => (++n < 2 ? res(429, { error: "rate_limited" }, { "Retry-After": "0" }) : res(200, { ok: 1 }))).season(); assert.equal(n, 2); assert.deepEqual(r, { ok: 1 });
});
test("повторы кончаются ошибкой, суточный лимит не повторяется", async () => {
  let n = 0; await assert.rejects(api(async () => { n++; return res(429, { error: "rate_limited", retry_after: 0 }, { "Retry-After": "0" }); }, { retries: 1 }).season(), (e) => e.status === 429); assert.equal(n, 2);
  n = 0; await assert.rejects(api(async () => { n++; return res(429, { error: "daily_limit" }, { "Retry-After": "0" }); }).season()); assert.equal(n, 1);
});
test("адрес игрока кодируется", async () => {
  let seen; await api(async (u) => { seen = String(u); return res(200, {}); }).player("a/b"); assert.match(seen, /players\/a%2Fb/);
});
test("карточка и фрейм", () => {
  assert.equal(playerCardUrl(1), "https://hlam.besthost.one/embed/player/1");
  const made = { style: {} }, el = { ownerDocument: { createElement: () => made }, replaceChildren(x) { this.c = x; } }, f = mountGame(el);
  assert.equal(el.c, f); assert.equal(f.src, "https://hlam.besthost.one/site/app?frame=1");
});
