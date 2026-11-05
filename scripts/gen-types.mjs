// типы из openapi.json → src/types.ts. схема — копия https://hlam.besthost.one/api/public/v1/openapi.json
import { readFileSync, writeFileSync } from "node:fs";

const api = JSON.parse(readFileSync(new URL("../openapi.json", import.meta.url), "utf8"));
const ty = (s) => {
  if (s.$ref) return s.$ref.split("/").at(-1);
  if (s.enum) return s.enum.map((x) => JSON.stringify(x)).join(" | ");
  const one = (t) => t === "integer" || t === "number" ? "number" : t === "array" ? `${ty(s.items)}[]` : t === "object" ? obj(s) : t;
  return [s.type].flat().map(one).join(" | ");
};
const obj = (s) => `{ ${Object.entries(s.properties ?? {}).map(([k, v]) => `${k}${s.required?.includes(k) ? "" : "?"}: ${ty(v)}`).join("; ")} }`;
const out = Object.entries(api.components.schemas).map(([k, s]) => `export type ${k} = ${ty(s)};`);
writeFileSync(new URL("../src/types.ts", import.meta.url), `// собрано из openapi.json: npm run gen. руками не править\n${out.join("\n")}\n`);
