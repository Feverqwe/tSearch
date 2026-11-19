import ExKitTracker from '../../../src/sandbox/exKitTracker';
import type {TrackerResponse} from '../../../src/tools/exKitRequest';
import {inferTracker} from '../../../src/tools/trackerInference';

const sourceForm = document.querySelector<HTMLFormElement>('#source-form')!;
const pageUrl = document.querySelector<HTMLInputElement>('#page-url')!;
const searchPhrase = document.querySelector<HTMLInputElement>('#search-phrase')!;
const requestUrl = document.querySelector<HTMLInputElement>('#request-url')!;
const requestBody = document.querySelector<HTMLTextAreaElement>('#request-body')!;
const sourceHtml = document.querySelector<HTMLTextAreaElement>('#source-html')!;
const htmlFile = document.querySelector<HTMLInputElement>('#html-file')!;
const resultJson = document.querySelector<HTMLTextAreaElement>('#result-json')!;
const copy = document.querySelector<HTMLButtonElement>('#copy-json')!;
const status = document.querySelector<HTMLElement>('#status')!;
const statusText = document.querySelector<HTMLElement>('#status-text')!;
const searchStatus = document.querySelector<HTMLElement>('#search-status')!;
const searchStatusTitle = document.querySelector<HTMLElement>('#search-status-title')!;
const searchStatusDetail = document.querySelector<HTMLElement>('#search-status-detail')!;
const valueFormats = document.querySelector<HTMLElement>('#value-formats')!;

type SearchPrediction = Extract<Awaited<ReturnType<typeof inferTracker>>, {status: 'results'}>;

const examples = {
  results: {
    url: 'https://tracker.example/search?q=linux',
    html: `<!doctype html>
<html lang="ru">
<title>Результаты поиска</title>
<form action="/search" method="get">
  <input type="search" name="q" value="linux">
</form>
<table id="search-results">
  <thead><tr>
    <th>Название</th><th>Размер</th><th>Сиды</th><th>Пиры</th><th>Дата</th>
  </tr></thead>
  <tbody>
    <tr>
      <td><a href="/details/101">Ubuntu Desktop</a></td>
      <td>5.9 GB</td><td>124</td><td>17</td><td>21.04.2026</td>
    </tr>
    <tr>
      <td><a href="/details/102">Debian Live</a></td>
      <td>3.3 GB</td><td>91</td><td>8</td><td>16.04.2026</td>
    </tr>
    <tr>
      <td><a href="/details/103">Fedora Workstation</a></td>
      <td>2.7 GB</td><td>62</td><td>4</td><td>15.04.2026</td>
    </tr>
  </tbody>
</table>
</html>`,
  },
  login: {
    url: 'https://tracker.example/login',
    html: `<!doctype html>
<html lang="ru">
<title>Вход на трекер</title>
<main>
  <h1>Войдите, чтобы увидеть результаты поиска</h1>
  <form id="login" action="/login" method="post">
    <label>Имя пользователя <input name="username" type="text"></label>
    <label>Пароль <input name="password" type="password"></label>
    <button type="submit">Войти</button>
  </form>
</main>
</html>`,
  },
};

function showStatus(message: string, tone: 'neutral' | 'success' | 'warning' = 'neutral') {
  status.dataset.tone = tone;
  statusText.textContent = message;
}

function showSearchStatus(prediction?: SearchPrediction) {
  searchStatus.hidden = prediction === undefined;
  if (!prediction) {
    searchStatusTitle.textContent = '';
    searchStatusDetail.textContent = '';
    return;
  }

  const {
    searchSource,
    definition: {search},
  } = prediction;
  const location = search.body?.includes('%search%')
    ? 'в теле POST'
    : search.query?.includes('%search%')
      ? 'в параметрах URL'
      : search.url.includes('%search%')
        ? 'в пути URL'
        : undefined;
  if (searchSource === 'unknown' || !location) {
    searchStatus.dataset.tone = 'warning';
    searchStatusTitle.textContent = 'Шаблон поиска не определён';
    searchStatusDetail.textContent =
      'Открой «Уточнить поисковый запрос» и добавь исходный URL, фразу или тело POST.';
    return;
  }
  const source = {url: 'по адресу', form: 'по HTML-форме', request: 'по телу запроса'}[
    searchSource
  ];
  searchStatus.dataset.tone = 'success';
  searchStatusTitle.textContent = 'Шаблон поиска найден';
  searchStatusDetail.textContent = `${search.method} · %search% ${location} · ${source}`;
}

function showJson(value?: unknown) {
  if (value === undefined) {
    valueFormats.hidden = true;
    valueFormats.textContent = '';
  }
  resultJson.value = value === undefined ? '' : JSON.stringify(value, null, 2);
  resultJson.scrollTop = 0;
  copy.disabled = !resultJson.value;
  copy.textContent = 'Скопировать JSON';
}

function useExample(example: (typeof examples)[keyof typeof examples]) {
  pageUrl.value = example.url;
  searchPhrase.value = '';
  requestUrl.value = '';
  requestBody.value = '';
  sourceHtml.value = example.html;
  sourceForm.requestSubmit();
}

document
  .querySelector('#results-example')!
  .addEventListener('click', () => useExample(examples.results));
document
  .querySelector('#login-example')!
  .addEventListener('click', () => useExample(examples.login));

htmlFile.addEventListener('change', async () => {
  const file = htmlFile.files?.[0];
  if (!file) return;
  try {
    const html = await file.text();
    if (htmlFile.files?.[0] !== file) return;
    sourceHtml.value = html;
    showStatus('HTML загружен. Укажи URL и нажми «Разобрать».');
    showSearchStatus();
    showJson();
  } catch {
    showStatus('Не удалось прочитать файл. Вставь HTML в поле вручную.', 'warning');
  } finally {
    if (htmlFile.files?.[0] === file) htmlFile.value = '';
  }
});

let run = 0;
sourceForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const current = ++run;
  const html = sourceHtml.value;
  const url = pageUrl.value.trim();
  showJson();
  showSearchStatus();
  if (!html.trim()) {
    showStatus('Вставь HTML страницы выдачи.', 'warning');
    return;
  }

  try {
    const parsedUrl = new URL(url);
    if (
      !['http:', 'https:'].includes(parsedUrl.protocol) ||
      parsedUrl.username ||
      parsedUrl.password
    ) {
      showStatus('Укажи обычный адрес страницы по HTTP или HTTPS.', 'warning');
      return;
    }
    const evidence = {
      phrase: searchPhrase.value,
      requestUrl: requestUrl.value,
      requestBody: requestBody.value,
    };
    showStatus('Загружаю модель и разбираю HTML…');
    const prediction = await inferTracker(
      {body: html, url: parsedUrl.href, statusCode: 200, statusText: 'OK', headers: {}},
      evidence,
    );
    if (current !== run) return;
    if (prediction.status !== 'results') {
      const messages = {
        'login-required': 'Трекер требует входа.',
        empty: 'Поиск не дал результатов.',
        unsupported: 'Модель не нашла таблицу выдачи.',
        'request-failed': 'Трекер вернул ошибку.',
      };
      showJson(prediction);
      showStatus(
        messages[prediction.status],
        prediction.status === 'empty' ? 'neutral' : 'warning',
      );
      return;
    }

    showJson(prediction.definition);
    showSearchStatus(prediction);
    valueFormats.textContent = Object.entries(prediction.formats)
      .map(
        ([field, format]) =>
          `${field === 'size' ? 'Размер' : 'Дата'} — ${format.label}${format.assumption ? `. ${format.assumption}` : ''}`,
      )
      .join(' · ');
    valueFormats.hidden = !valueFormats.textContent;
    showStatus('Проверяю конфиг штатным парсером…');
    const tracker = new ExKitTracker();
    await tracker.init(prediction.definition);
    if (current !== run) return;
    const response: TrackerResponse = {
      url: parsedUrl.href,
      body: html,
      statusCode: 200,
      statusText: 'OK',
      headers: {},
    };
    const {results} = tracker.parseResponse(
      {tracker, event: 'search', request: null, response},
      response,
    );
    const complete = results.length === prediction.rowCount;
    showStatus(
      `Штатный парсер разобрал ${results.length} из ${prediction.rowCount} строк.`,
      complete ? 'success' : 'warning',
    );
  } catch {
    if (current === run) showStatus('Разбор не удался. Проверь URL и HTML страницы.', 'warning');
  }
});

copy.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(resultJson.value);
    copy.textContent = 'Скопировано';
  } catch {
    resultJson.focus();
    resultJson.select();
    copy.textContent = 'Выделено для копирования';
  }
});
