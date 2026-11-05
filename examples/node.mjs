import { Hlamburg } from "@hlamburg/sdk";

const api = new Hlamburg({ lang: "ru" });
console.log(await api.status());
console.log((await api.tops("level", { limit: 5 })).rows);
