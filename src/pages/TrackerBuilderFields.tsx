import {useMemo} from 'react';

import {getResultRows} from '../components/CodeMakerFrame';
import SelectorField from '../components/SelectorField';
import BuilderHelp from '../components/TrackerFieldHelp';
import type {Selector, SelectorPreview} from '../components/selectorTypes';
import Button from '../components/ui/Button';
import Field from '../components/ui/Field';
import {type CodeDraft, defaultPipeline} from '../data/codeDraft';
import getNodePath from '../tools/getNodePath';
import {sizzleQuerySelector} from '../tools/sizzleQuery';

import {message} from './trackerBuilderLabels';

const fields = [
  ['title', 'kitTorrentTitle'],
  ['url', 'kitTorrentLink'],
  ['size', 'kitTorrentSize'],
  ['downloadUrl', 'kitTorrentDownloadLink'],
  ['seeds', 'kitSeedCount'],
  ['peers', 'kitPeerCount'],
  ['date', 'kitAddTime'],
  ['nextPageUrl', 'kitNextPageLink'],
] as const;

export function setTrackerSection(
  selectors: CodeDraft['selectors'],
  categoryTitle: Selector | undefined,
  resolve: SelectorPreview['resolve'],
): CodeDraft['selectors'] {
  const {categoryUrl, categoryTitle: previous} = selectors;
  const [step] = categoryUrl?.pipeline ?? [];
  const hasSeparateLink =
    categoryUrl &&
    (categoryUrl.selector !== previous?.selector ||
      categoryUrl.pipeline?.length !== 1 ||
      step?.name !== 'getProp' ||
      step.args?.length !== 1 ||
      step.args[0] !== 'href');
  if (hasSeparateLink || categoryTitle?.selector === previous?.selector) {
    return {...selectors, categoryTitle};
  }
  let link: Selector | undefined;
  if (categoryTitle?.selector && selectors.row.selector) {
    try {
      const node = resolve(categoryTitle.selector, resultLocation(selectors));
      if (isSectionLink(node)) {
        link = {selector: categoryTitle.selector, pipeline: defaultPipeline('categoryUrl')};
      }
    } catch {
      // The selector can be incomplete while it is being edited.
    }
  }
  return {...selectors, categoryTitle, categoryUrl: link};
}

function isSectionLink(node: Element | null): node is HTMLAnchorElement {
  return Boolean(
    node?.matches('a[href]') &&
    node.getAttribute('href')?.trim() &&
    /^https?:\/\//i.test((node as HTMLAnchorElement).href),
  );
}

export function resultLocation(selectors: CodeDraft['selectors']) {
  return {
    containerSelector: selectors.row.selector,
    skipFromStart: selectors.skipFromStart,
    skipFromEnd: selectors.skipFromEnd,
  };
}

const sectionCandidates =
  '.category, .forum, .f-name-col, a[href*="viewforum.php"], a[href*="forumdisplay.php"], a[href*="tracker.php?f="], a[href*="/category/"]';

function suggestTrackerSection(doc: Document, location: ReturnType<typeof resultLocation>) {
  try {
    const rows = getResultRows(doc, location).slice(0, 8);
    const [first] = rows;
    if (!first) return;
    const candidates = [
      ...new Set(
        [...first.querySelectorAll(sectionCandidates)]
          .map((node) => {
            const links = node.querySelectorAll('a[href]');
            return links.length === 1 ? links[0] : node;
          })
          .filter((node) => node.textContent?.trim()),
      ),
    ];
    if (candidates.length !== 1) return;
    const [node] = candidates;
    const selector = getNodePath(node, first);
    if (!selector) return;
    const matchesRows = rows.every((row) => {
      const match = sizzleQuerySelector(row, selector);
      const section = match?.closest(sectionCandidates);
      return match?.textContent?.trim() && section && row.contains(section);
    });
    const text = node.textContent?.trim();
    if (matchesRows && text) {
      return {selector, text};
    }
  } catch {
    // Suggestions are unavailable until the row selector is valid.
  }
}

export default function ResultSelectors({
  selectors,
  preview,
  document,
  onChange,
}: {
  selectors: CodeDraft['selectors'];
  preview: SelectorPreview;
  document: Document | null;
  onChange: (selectors: CodeDraft['selectors']) => void;
}) {
  const location = resultLocation(selectors);
  const {containerSelector, skipFromStart, skipFromEnd} = location;
  const suggestSection = !selectors.categoryTitle && !selectors.categoryUrl;
  const suggestedSection = useMemo(
    () =>
      document && suggestSection
        ? suggestTrackerSection(document, {containerSelector, skipFromStart, skipFromEnd})
        : undefined,
    [document, suggestSection, containerSelector, skipFromStart, skipFromEnd],
  );

  function changeSection(value: Selector | undefined) {
    onChange(setTrackerSection(selectors, value, preview.resolve));
  }

  function change(id: (typeof fields)[number][0], value: Selector | undefined) {
    if (!value && (id === 'title' || id === 'url')) return;
    onChange({...selectors, [id]: value});
  }

  return (
    <div className="page selectors">
      <SelectorField
        id="row"
        title={message('kitRowSelector')}
        value={selectors.row}
        onChange={(row) => {
          if (row) onChange({...selectors, row});
        }}
        preview={preview}
        location={{}}
      />
      <div className="field skip-field">
        {(['skipFromStart', 'skipFromEnd'] as const).map((id) => {
          const label = id === 'skipFromStart' ? 'kitSkipFirstRows' : 'kitSkipLastRows';
          return (
            <Field
              key={id}
              label={message(label)}
              help={<BuilderHelp label={label} help={'maker_help_' + id} example="1" />}
            >
              {(props) => (
                <input
                  {...props}
                  data-id={id}
                  className="ts-control"
                  type="number"
                  value={selectors[id]}
                  onChange={(event) =>
                    onChange({
                      ...selectors,
                      [id]: Number.parseInt(event.currentTarget.value, 10) || 0,
                    })
                  }
                />
              )}
            </Field>
          );
        })}
      </div>
      {fields.map(([id, label]) => {
        const optional = id !== 'title' && id !== 'url';
        return (
          <SelectorField
            key={id}
            id={id}
            title={message(label)}
            pipeline
            optional={optional}
            preview={preview}
            location={id === 'nextPageUrl' ? {} : location}
            value={selectors[id]}
            defaultValue={optional ? {selector: '', pipeline: defaultPipeline(id)} : undefined}
            previewType={id === 'size' || id === 'date' ? id : undefined}
            onChange={(value) => change(id, value)}
          />
        );
      })}
      <SelectorField
        id="categoryTitle"
        title={message('kitCategoryName')}
        pipeline
        optional
        preview={preview}
        location={location}
        value={selectors.categoryTitle}
        defaultValue={{selector: '', pipeline: defaultPipeline('categoryTitle')}}
        onChange={changeSection}
      />
      {suggestedSection && (
        <div className="field">
          <Button
            onClick={() => {
              preview.select(null);
              preview.activate('categoryTitle');
              changeSection({
                selector: suggestedSection.selector,
                pipeline: defaultPipeline('categoryTitle'),
              });
            }}
          >
            {chrome.i18n.getMessage('kitSuggestedTrackerSection', [suggestedSection.text])}
          </Button>
        </div>
      )}
      <SelectorField
        id="categoryUrl"
        title={message('kitCategoryLink')}
        pipeline
        optional
        preview={preview}
        location={location}
        value={selectors.categoryUrl}
        defaultValue={{selector: '', pipeline: defaultPipeline('categoryUrl')}}
        onChange={(categoryUrl) => onChange({...selectors, categoryUrl})}
      />
    </div>
  );
}
