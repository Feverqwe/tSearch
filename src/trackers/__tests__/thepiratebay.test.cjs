const {readFileSync} = require('node:fs');
const {stripTypeScriptTypes} = require('node:module');
const path = require('node:path');
const {runInNewContext} = require('node:vm');

function loadSearch(records) {
  const request = jest.fn(async () => ({body: JSON.stringify(records)}));
  const source = readFileSync(path.join(__dirname, '../thepiratebay.ts'), 'utf8');
  let search;
  runInNewContext(stripTypeScriptTypes(source), {
    URL,
    API_event(event, handler) {
      if (event === 'search') search = handler;
    },
    API_request: request,
  });
  return {search, request};
}

test('The Pirate Bay reads search records and creates a magnet link for a valid info hash', async () => {
  const hash = '0123456789abcdef0123456789abcdef01234567';
  const query = 'Ubuntu & Linux';
  const {search, request} = loadSearch([
    {
      id: '42',
      name: query,
      info_hash: hash,
      size: '4294967296',
      seeders: '12',
      leechers: '0',
      added: '1700000000',
    },
    {id: '10&redirect=1', name: 'Malformed entry'},
  ]);

  const result = await search({query});
  expect(new URL(request.mock.calls[0][0]).searchParams.get('q')).toBe(query);
  expect(result).toMatchObject({
    success: true,
    results: [
      {
        title: query,
        url: 'https://thepiratebay.org/description.php?id=42',
        downloadUrl: `magnet:?xt=urn:btih:${hash}&dn=Ubuntu%20%26%20Linux`,
        size: 4294967296,
        seeds: 12,
        peers: 0,
        date: 1700000000,
      },
    ],
    nextPageRequest: null,
  });
});

test('The Pirate Bay omits the API record used for an empty search', async () => {
  const {search} = loadSearch([{id: '0', name: 'Нет результатов'}]);

  await expect(search({query: 'example'})).resolves.toEqual({
    success: true,
    results: [],
    nextPageRequest: null,
  });
});
