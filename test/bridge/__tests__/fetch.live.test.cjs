const {connectLiveBridge} = require('../live.cjs');

const url = process.env.TSEARCH_BRIDGE_URL;
const liveTest = url ? test : test.skip;

liveTest(
  'fetches a live website in the selected browser context',
  async () => {
    const {fetch} = connectLiveBridge();
    const response = await fetch(url, {requestContext: process.env.TSEARCH_BRIDGE_CONTEXT});
    const final = new URL(response.url);
    // Don't log search data, response contents or session identifiers.
    console.log(`HTTP ${response.status} from ${final.origin}`);
    expect(response.ok).toBe(true);
  },
  30_000,
);
