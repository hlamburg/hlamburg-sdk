// собрано из openapi.json: npm run gen. руками не править
export type Status = { game: string; version: string; status: "ok" | "maintenance"; players: number; time: string };
export type Badge = { key: string; name: string; tier: number; tier_name: string; value: string };
export type Pin = { key: string; name: string };
export type ShowItem = { name: string; rarity: number };
export type Player = { id: number; url: string; slug: string | null; name: string; level: number; title: string | null; seniority: number; avatar: string | null; badges: Badge[]; achievements: { got: number; total: number; pinned: Pin[] }; showcase: ShowItem[] };
export type TopRow = { place: number; id: number; name: string; level: number; value: string };
export type Top = { kind: string; total: number; limit: number; offset: number; rows: TopRow[] };
export type Price = { rarity: number; name: string; avg: number; sales: number; trend: -1 | 0 | 1 };
export type Prices = { currency: string; fee_percent: number; rows: Price[] };
export type Season = { number: number; key: string; ends_at: string; days_left: number; max_level: number };
export type Error = { error: string; message: string; retry_after?: number };
