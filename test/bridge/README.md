# Bridge

Подпроект для Jest-тестов трекеров и других сайтов. Bridge выполняет запрос в Chromium и возвращает `Response` в Jest. Запрос из вкладки может использовать её текущую сессию.

Из корня репозитория:

```sh
npm --prefix test/bridge ci
npm --prefix test/bridge exec -- playwright install chromium
npm --prefix test/bridge test
```

Локальная проверка использует временный профиль. Для установки Bridge в [обычный Chrome стенда](../../docs/development.md#проверка-в-браузере) собери расширение:

```sh
npm --prefix test/bridge run build
```

На странице `chrome://extensions` включи режим разработчика и выбери `dist/bridge-chrome/extension` как распакованное расширение. На macOS и Linux сборка регистрирует компонент Native Messaging в профиле стенда. По умолчанию у Bridge есть доступ к RuTracker и PiratBit. Для другой конфигурации передай нужные адреса после `npm --prefix test/bridge run build --`.

После пересборки подключённый Bridge можно перезагрузить из корня репозитория:

```sh
node -e 'require("./test/bridge/live.cjs").connectLiveBridge().restart().catch(error => { console.error(error.message); process.exitCode = 1; })'
```

`restart()` перезагружает расширение Bridge и ждёт нового подключения. Вызывай его между запросами. Если установлена сборка без этого API или Bridge отключён, сначала перезагрузи его карточку на `chrome://extensions`.

В обычном Chrome стенда Bridge подключается автоматически. Надпись `ON` на значке означает, что соединение активно. Если оно не установилось, нажми на значок Bridge. Для проверки через вкладку открой сайт в этом же профиле и при необходимости войди. Пример:

```sh
TSEARCH_BRIDGE_URL='https://rutracker.org/forum/tracker.php' npm --prefix test/bridge run test:live
```

Bridge поддерживает два контекста запроса:

| `requestContext` | Где выполняется запрос | Какому режиму tSearch соответствует |
| --- | --- | --- |
| `extension` | В расширении Bridge. Вкладку сайта открывать не нужно. | Прямой запрос, по умолчанию |
| `tab` | В уже открытой вкладке сайта с её текущей сессией. | «Включить поддержку прокси» в профиле. В этом режиме tSearch открывает временную вкладку сам. |

У живого Bridge по умолчанию выбран `tab`. Для прямой проверки добавь `TSEARCH_BRIDGE_CONTEXT=extension` к команде выше. Для сравнения передавай обоим режимам один и тот же URL, метод, заголовки и тело.

Добавляй тесты рядом с проверяемыми исходниками в `__tests__/`. Для живых тестов подпроекта используй суффикс `.live.test.cjs` и команду `test:live`.

```js
// Из теста в test/bridge/__tests__/.
const {connectLiveBridge} = require('../live.cjs');
const {fetch} = connectLiveBridge();
const response = await fetch('https://rutracker.org/forum/tracker.php');
expect(response.ok).toBe(true);

const direct = await fetch('https://rutracker.org/forum/tracker.php', {
  requestContext: 'extension',
});
console.log(direct.status);
```

Для изолированной проверки на локальном сервере используй `launchBridge` из `browser.cjs`. По умолчанию он делает прямой запрос; для проверки через вкладку передай `requestContext: 'tab'` и открой сайт в том же контексте браузера. Передай адреса разрешённых сайтов в `origins` и закрой временный браузер в `finally` или `afterAll`.

Мост принимает URL или `Request`, поддерживает метод, заголовки, тело и настройки `credentials`, `redirect`, `mode` и `cache`. В живом Bridge запросы по URL используют `credentials: 'same-origin'` по умолчанию, как в tSearch. Изолированный прямой режим по умолчанию использует `include`; для сравнения с tSearch передай `credentials: 'same-origin'`. В режиме вкладки сессия используется для запросов к её origin, а `credentials: 'omit'` позволяет проверить ответ без неё.

Ответ целиком передаётся в Jest, включая ответы с HTTP-ошибкой. Успешный статус сам по себе не гарантирует, что сайт открыл страницу за логином. Порядок проверки выдачи описан в [руководстве по ремонту трекеров](../../docs/development.md#проверка-и-ремонт-трекеров).
