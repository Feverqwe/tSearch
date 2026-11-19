// ==UserScript==
// @name Рутор
// @description Открытый торрент трекер.
// @icon data:image/webp;base64,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
// @downloadURL https://github.com/Feverqwe/tSearch/raw/master/src/trackers/rutor.js
// @trackerURL https://rutor.info
// @version 1.0.6
// @connect *://rutor.info
// @require exKit
// ==/UserScript==

const code: PackagedTracker = {
  version: 3,
  type: 'kit',
  description: {
    icon: 'data:image/webp;base64,UklGRvAOAABXRUJQVlA4TOQOAAAvL8ALEGJQ0LYNk/CH3V0GETEBvKo2luEQR8zoeLmWm23bYil/tDXt4qE7qxkeaUbm7tqCE7kz0bq7jvucM4JD9CFjePqeHqgAYorg2om3JrqgDRo46WZoP3tdcG1rO+Z8FzJ3MW2cdLZtW92oi9NOncpOyqli27b5Gwd2bdvGnv3Htm2bH37bvrFt22ogb0kDtp0aWAGf0sOVc9u2sT3fxWfbtu3W/jpbsTpbnfMz0qrK+MrYTpXexr3PWQzcNlKUZd69G/gDJWnbzs/O877v9/s3jm3btm3btm3btm3bttr2H919TpfN3zZ6C1lUdpClaZRpz1LZQUYZZycZnsosRcvatmWtkxHsyezOoB1Cp9FTPXPd7lHiAvEE+4O7O1EcIj9O4bfPHu+2bZu2bWtbKqit1sbe0Js7lm3btm3fDPf+ta92Q7FtbdnirnNwi1SaD4JGJFuzRiWSHDKZ5DIEFu1vZOd93mcHPoSBWNbAQ15HxK/TBBAHhoB6Y/wCQcMC7eKCo20iy4t3tZ/5LuDcEDFvCI5li0fSf7b9t7Xpskjf12BgsIGgzf8XlbETtP8ZBi4gsUxAvQEIqghiYP++dFvS+nuLRnpVoxPsZgS9zfN0ikIXQ4r1jiA52pFNvP4em4GG/7OzkpP7fgk6S5da6RXMnDwvZHK/NwcX0pFQehExgyr7W/uXHqJUajBOAur1GAe5qA7X/nsQpL3LbTbypjeGA54yK3oz2xfAC2H9D3qetD7qD0SwuIWJ3spjeseDl/LUbBoDioB+HTgkFsRfqi2NXP+GhzipFp7Y8rlyt1aWBl5AmZ06cXSUYNFU3UpONrY04xyeyLkZ26cfeWpjs4tqcAHY/2nJCBjkHrdbHZm8kgjFbkoYsdjfOSloUliBdhqQVZAzwKHBHrAGzYTxiZU7uzF8kPNGgf9O2RS/HI3ICin3L8DVZiYdXfp1AG8GLHfviltNjo9sTMC+0OzCIIGDgtyiaXExo/agjuGjfBaDl6htKV0fndOIIXhc4PWwb+ofs48JqvC9mIJzEAOYStUJP3YLFw5/lPF0OmktlbAh2JloPsUJwZcBlwNJo1git7J5vyD8wlH9xvKbxxQwBxlXsOpu54RTeInIFyVv9Y6bjidDTZpOAhb8xWO8+S++liMAV4PqjyWPPs7yWgQOIJFEZSKkgDSQAQrArcJ1gDBaRyd29Fth+MkH8oqOrkl652DpjrKlCX1YoHg94XPPk2LXy2+awGfwzzV1hpz7yMALzXJznjgZFz74CXZjiDqVEPCiQjoZLs9GyKNaxVy+HHJWlLQcgqh6FL2cPCkAD3LFnXoGGlhA/n21q3rmg2MouGMSQv9X4c2Lu/YKEFCbXdBx+xdgSqpR24j9aCIgT4S/+RlNY2uEbUXeihbPIGNsw5heHX2hJ36k4yaO7ETlA7/dmOGJVoTWjOBX9aXkMznzIuYTu6pyoLAbYVX0DDVqlVAx8fAOXkhq8sfWG8lWJhDyQszi5Dp0eN92uFFFJFQI+thfW+RZV7AYjjrOB5RSuf3YM1qZMPJUhZMmnChMqGxqHGWPOqkaaUH6DQTd2FLFGWd+orSrMdJMSnOp/wvvuBOtUSiaCIULwcj56dHr896fR9LCjOF168/uMP2u0xQkUYhppFuOd5foPXCcUSHDcSCHbCkcGu3MWNjpcGUFJ1pyYb2FVz3ZBuKBtBORFaaBDAPbhDo9uwhgGXu+q3bo+AgGv8E+rD9gbKDmQq8ZizIS0TJOH/l4kn927dwQCctCpxq/4spwZXnUESViKE/la1Y3RfgS8Hki7kBioKzIEcHh4SYYRx4GXFByNVQQy53vLOQV6FxpCcd1w1MDYtRMoIbhnYIPK3xFa1K+hV0ojxPJ4dBh3lQwBVdqs2jikYIgEffiVuz7Q1nd4lek8Jbz9HedpXIue5DzT4O3jo9rLDnlE1o6QB4LZleJmPgzBAlnFEE4omAKC+vNKbbEAdQzMk5YE0QNa47GqF6JHPgoCdHx3sawBXJmyOdwDrVn8J8o9QpGraKDEm6c8sK8ZikE5v7fbF99/CSUx0hCFbtDOf4JVmuOTgN2C445reT4RjWplrz5JlZEsUzE4Op6NWckoyRRi8RmVqemXUGIE2JEE0wEFJRouo9ipPPce/UmuQ8Aq2K/gEPwoaD3qoelEoU5EyGcG5ev1XUpeeGBe8HPV9yfdoGqpoOyKfxG0QrEDvILZAK5UoamQhmdKkkwbpKMWy3PjAwvxMjMJAK3SiVJNBZz5AI1QVQJBzNAEwUe8Zgf6Gj56pviFuAYEhDwGD4R/BqHrlbh6GokSi+ij98yAZ2F2Lbx78D94p0Nx4nwwJZdz3v4AnEYCoAKCd8F0hbcz6EoxrcWU3InNA94S7BidLkRiFm4IYw4mdDvSBtMwSKB4ko/mJeYRCAx0lbFbWAPEnQUDGBBcZNx0C58YSVQX+17+9x+eFMdtKZdTD199Gxaeo8q1t8OZB5kizgCFCKqJPwIGkTqMeISEAbCgnKBVS1ABJM7DSfMPvGMPUYzuy2rKjSjRrRSv5N85DM7AnfSqrQObEOCGQ4GWEcP54E3Rh8J+fbmZr2/vnMe5akwwCvzcHr7i4X7lZs8JuQdo1Nky+A0kYhAxqGSoydBQ8jU0FRJT2ktw49KFCczoy4xs3dkj8lLHY4YbRgsst8BfTdqeGBPK++ZeDq7KLQMmMGBgLwBmbDh5sgJMe1QuHj2eCPLHEMIiTsBhVZzr/bekO57f6kH79DWjoEKzEKLZCQB3OVITmgAzJRGDAYCA7DhFHPCDSkZQ06s7Q48MHitwEdM9kwm5ZLqPJ05ceMuSjvqF/wedAbxATaV3azuzTafCOGFG234/Y2rNIKYqDZf2H3j8DMbfUIsG+9XvAX2ByoBuozoPqO1YdMEaqjdC2ays3x1xUOjRKCJhMcucxo7HjcWnNnr8OelF/+3nFFwIfDBosN5hHn8o9zAIVq4D+z5zpF52NXv1uebp9fTNrskNiqHu//4Y+5d/xb2IJ+RVan9DKyKU4FWiFBFUTnaod9jbr/ygQ9ixOymclSt4dAX4JFCRk1cprjY2lqZecOXKhMSXx0hqJ152lm/Be8acWSUV6QvyrRcUHFD5+zeUyXbXDedFpH0LCt1kMiWdfFrHh880dfRyQYsgYpEKqvQMVnT6tX0LBEH33QXiEwUcu50MHFUyC8LTQaNDd2oFiF48V4Yz4XoIow5XzKpswgsOXZE7FYswdqM6+OON6i6Hc/WDvFDJhBGUFVEtNkx2XHeJYZAWDn32LHaFCqQ03IOOfS9y/mTho5MIBudum5E4ELnpRgcvKKr7bPazLFbq/bs+S7WCOINpAgTx0QYn432VLAICVc4Hv1cRyo4saNAUIZ+EmVmduJVbHbBxhneqwNzHdZPRhAM0pOeVTiN6ELBhT63hW/Y6ZjceizslW/T/iQZ6z7wpnfR0dKR6CjoEDqcLiIdnShcvFM7kWjpLAjBjXoFKn9ryRz21JRYKwS9cHieOoigJAYTr3aNNmeKm3Bl2/wkHrlIjHVsoocFDMg2gjDTMbgqj/JuALuwPlDYQWUps/a28V49MuEoDrtw7LzY1YXOWQ+plGcee1uLVFykaMIi7tZaOkq33jbnHmpRsIxDY8Ng6EcmfDLAXNCx9q5zbvKsjtskw+NcpTHAWgoSuz8ejXaFlw1MQqyKI+BSgKiDDVkcqrqU6eortPTkSh1neBFYMzBnMq1if/suSfweidrIh72hhnlWdDHjwkfJIIxiVerzuFWMNR0TODonbgxUbinJCOmnlfzFSkfv7WhVbCmDL0IzG/E5uRJSh1VLqYpA1kASOADOAKsQmxF3JOGI/C7jDg60XhaDR0WTxYvBN8bbB8FioCPF1dpZSRkOYroLNg4GVMZSEfZ6ur/qqCWwqj5pB4dvd5U+OfwN2QCdgbKGKkKaoHsBWXFDaQVjyAvJQzJQMcEp/CplwB9kWM7tr70uEj+6XPrI1otasJrTMeSMvbEyJ9pi2wAHLI4MrjvJaOmo4sJ1i38B/lb8QdCuoAuDlKOC4pKga4GGQUPRHf7jW9CNwLXApUBZoGAonaPzjPXbpN6XR1X5/uiI68j0EPOrOGvyd3pjAjGIt32bgcbkVjnjyddfHSkD2A0qzAf8QsiqwqmC3yBlkFVIK2QFSgZlRQX8QHlwXlFO/YaUopjioGOrUZsOP6PZ69bn5o1CBjEeyDfL8R3HKB+CQSxFgiqYab1Pb7nXRZKMuU7x1uhvaFuOjxRLigNCwkJFhIoKSTqJG4mIvySsJORUKFDBQAKBBIxyCrEow66T/8y61P3C1EUi1lh+dC98xSpYKkyiiT+g3rYVjQOd1nHr/mbab8AbgUVgHX+mp3/HIXACHANH+PfnH7+nYwtYAN4J/InMfx18VN+VJArh/B7Dfn74y+rZLcP4mcDXtD7VeuwLWb6TReJv3KjXTqneSq2xudXQ0mpy1GrrmHRxnXR2nXV2X3Xy3KCL+ybdfTfrE75N/8gd+oXv0C90p36hOwx03Wuc+z7TQo8Zf/GAZb4nBbFHxCOrzu03dP720Qc8/197shfNmIC++5l++xnuYpvugUwyEnkodj6qnYtuZ5OnAJ9SAsoJqCSA4cu3+3Dch+c+IkZH76MhQI4LI/cQyj04MWUPeUS8Oz/bLDMihOcwPVRiU7ioi/sV+3zCxQF/88C5wHm4OR8X5wPnAe8AnwPexc3ngf/hIgjyuMiYi5t4uMsnF2/JEUAeb1zLn0APJU8YAQrZ1dvIlCBzD8pTiUlks2tZ48KIoajlRisyIkb+GAafeHoeJfQ+Seh7ltP7KqPvTUH/u5m2Oz1t9zY6bgg9V9V0XNTQflVDy0kdjXsNNB+20HTSSONhr7Sd9vr2876gfrU9qF1vd9dXxmVje9OHZamzqSCoQoqw31+zdYtffm5Tp+TE8trik1VFhSeX1zInlzdJj61sFW1d0yhbX1Zp2JiXKtyYn6teX5hq3Lo00Txbk1U3WJVfPzw/sWZ4ajAZnhFGhmdEkeGZkeOt5fELtRU50/WLoqfrq2KH6sqzJhrWtkwU4+MRAA==',
    name: 'Рутор',
    description: 'Открытый торрент трекер.',
    downloadUrl: 'https://github.com/Feverqwe/tSearch/raw/master/src/trackers/rutor.js',
    version: '1.0.6',
  },
  search: {
    url: 'https://rutor.info/search/0/0/100/0/%search%',
    method: 'GET',
  },
  selectors: {
    row: {selector: '#index > table > tbody > tr'},
    skipFromStart: 1,
    title: {
      selector: 'td:eq(1)>a:eq(-1)',
      pipeline: [{name: 'getText'}],
    },
    url: {
      selector: 'td:eq(1)>a:eq(-1)',
      pipeline: [{name: 'getProp', args: ['href']}],
    },
    size: {
      selector: 'td:eq(-2)',
      pipeline: [{name: 'getText'}, {name: 'parseSize'}],
    },
    downloadUrl: {
      selector:
        'td:eq(1) > a[href^="magnet:"], td:eq(1):not(:has(> a[href^="magnet:"])) > a.downgif[href]',
      pipeline: [{name: 'getProp', args: ['href']}],
    },
    seeds: {
      selector: 'td:eq(-1)>span.green',
      pipeline: [{name: 'getText'}, {name: 'toInt'}],
    },
    peers: {
      selector: 'td:eq(-1)>span.red',
      pipeline: [{name: 'getText'}, {name: 'toInt'}],
    },
    date: {
      selector: 'td:eq(0)',
      pipeline: [
        {name: 'getText'},
        {name: 'legacyReplaceMonth'},
        {name: 'legacyParseDate', args: ['1']},
      ],
    },
    nextPageUrl: {selector: '#index > table ~ b'},
  },
};

code.hooks = {};
code.hooks.onBeforeRequest = (session, options) => {
  if (session.event === 'search' && !(session.request as {query?: string}).query) {
    options.url = 'https://rutor.info/browse/';
  }
};
code.hooks.transform = {};
code.hooks.transform.nextPageUrl = (session, result, container) => {
  let url = null;
  let currentPage: number | null = null;
  result instanceof Node &&
    Array.from(result.childNodes).some((node) => {
      let index = null;
      const m = /\s*(\d+)\s*$/.exec(node.textContent ?? '');
      if (m) {
        index = parseInt(m[1], 10);
      }
      if (index !== null && node.nodeType === 3) {
        currentPage = index;
      }
      if (currentPage !== null && index === currentPage + 1 && node instanceof HTMLAnchorElement) {
        url = node.href;
        return true;
      }
    });
  return url;
};

API_exKit(code);
