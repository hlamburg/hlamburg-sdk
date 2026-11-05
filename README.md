# @hlamburg/sdk

Клиент публичного API [Хламбурга](https://hlam.besthost.one): TypeScript, ESM, без зависимостей. Типы собраны из `openapi.json`.
Документация: https://hlam.besthost.one/api-documentation

В npm пакет не опубликован, ставится из репозитория:

```sh
npm i github:hlamburg/hlamburg-sdk
```

## Запросы

```ts
import { Hlamburg, HlamburgError } from "@hlamburg/sdk";

const api = new Hlamburg({ lang: "ru" });
console.log(await api.status());
console.log(await api.season());
console.log((await api.tops("level", { limit: 5 })).rows);
console.log(await api.prices());

try {
  console.log(await api.player(1));
} catch (e) {
  if (e instanceof HlamburgError) console.log(e.status, e.code, e.message);
}
```

Закрытый профиль отвечает 404. При 429 клиент ждёт `Retry-After` и повторяет запрос (`retries`, по умолчанию 2). Суточный лимит ключа не повторяется.

## Ключ

Ключ поднимает лимиты. Создаётся в игре: «Настройки» → «Разработчикам». Держи его на сервере.

```ts
const api = new Hlamburg({ key: process.env.HLAM_KEY });
```

## Карточка игрока

```html
<iframe src="https://hlam.besthost.one/embed/player/1" width="360" height="130" style="border:0" title="Хламбург"></iframe>
```

## Игра во фрейме

Работает только на `https://acyka.cc` и его поддоменах.

```ts
import { mountGame } from "@hlamburg/sdk";

mountGame(document.querySelector("#game"));
```

Вход идёт во всплывающем окне сайта игры, токен сессии живёт в памяти фрейма. Страница вокруг данные игрока не получает. Покупки за GRAM и ⭐ открываются на сайте в новой вкладке.

## Разработка

```sh
npm i
npm test       # сборка и тесты
npm run gen    # типы из openapi.json
```
