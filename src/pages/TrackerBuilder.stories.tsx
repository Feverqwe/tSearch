import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, fn, userEvent, waitFor} from 'storybook/test';
import {useRef} from 'react';
import VerticalSplit from '../components/ui/VerticalSplit';
import {useCodeMakerFrame} from '../components/CodeMakerFrame';
import TrackerBuilderPreview from './TrackerBuilderPreview';
import {createCodeDraft, serializeCodeDraft} from '../data/codeDraft';
import TrackerBuilderResult from './TrackerBuilderResult';
import {BuilderCode} from './TrackerBuilderFiles';
import '../assets/css/magic.less';

const code = createCodeDraft();
code.description.name = 'Open Media Lab';
code.description.icon = '#417bbc';
code.search.url = 'https://tracker.example/search?q=%search%';
code.selectors.row.selector = 'article';
code.selectors.title.selector = 'h2';
code.selectors.url.selector = 'a.title';
code.selectors.seeds = {selector: '.seeds', pipeline: [{name: 'getText'}, {name: 'toInt'}]};

const sampleResponse = {
  url: 'https://tracker.example/search?q=films',
  body: '<article><h2>Open archives</h2><a href="/item/archives">Details</a></article>',
  headers: {},
  statusCode: 200,
  statusText: 'OK',
};

const meta = {
  title: 'Editors/Tracker builder',
  decorators: [
    (Story) => (
      <div className="page-ctr--code-maker" style={{width: 'min(1060px, 94vw)', height: 'auto'}}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const ResultWithIssues: Story = {
  globals: {theme: 'dark'},
  render: () => (
    <TrackerBuilderResult
      code={code}
      report={{
        applied: {
          ...code,
          selectors: {...code.selectors, title: {...code.selectors.title, selector: '.release'}},
        },
        prediction: {
          status: 'results',
          rowCount: 2,
          searchSource: 'url',
          definition: {
            version: 3,
            type: 'kit',
            search: code.search,
            auth: undefined,

            description: {
              name: code.description.name,
              url: 'https://tracker.example',
              description: 'Open collections',
            },
            selectors: {
              row: code.selectors.row,
              skipFromStart: 0,
              skipFromEnd: 0,
              title: {selector: '.release', pipeline: [{name: 'getText'}]},
              url: {selector: 'a.title', pipeline: [{name: 'getProp', args: ['href']}]},
            },
          },
          formats: {},
          nextPageUrl: null,
          observedNextPageUrl: undefined,
        },
      }}
      check={{
        response: sampleResponse,
        emptySource: false,
        requestVerified: true,
        issues: [
          {field: 'title', row: 2, reason: 'no_match'},
          {field: 'seeds', row: 1, reason: 'pipeline', step: 1, detail: '2. toInt'},
        ],
        key: '',
        results: [
          {
            title: 'Open archives',
            url: 'https://tracker.example/open-archives',
            date: -1,
            size: 1759218604,
          },
        ],
        nextPageUrl: null,
        passed: false,
      }}
      stale={false}
      canExport={false}
      phrase="films"
      setPhrase={fn()}
      pageNumber={1}
      onCheck={fn()}
      onBack={fn()}
      onCode={fn()}
      onFix={fn()}
    />
  ),
  play: async ({canvas}) => {
    await expect(canvas.getByRole('heading', {name: 'Required fields to check'})).toBeVisible();
    await expect(canvas.getByText('Row 2 · No matching nodes')).toBeVisible();
    const optional = canvas.getByText('Optional field issues', {exact: false});
    const report = canvas.getByRole('complementary', {name: 'Automatic detection report'});
    await expect(optional).toBeVisible();
    await expect(optional.getBoundingClientRect().top).toBeGreaterThanOrEqual(
      report.getBoundingClientRect().bottom,
    );
    const issue = canvas.getByText(/Transformation failed/);
    await expect(issue).not.toBeVisible();
    await userEvent.click(optional);
    await expect(issue).toBeVisible();
    await userEvent.click(optional);
    await expect(canvas.getByText(/Seed count.*Kept from draft/i)).toBeVisible();
    await expect(canvas.getByRole('button', {name: 'Continue to code'})).toBeDisabled();
  },
};

export const CurrentExport: Story = {
  render: () => (
    <BuilderCode
      code={code}
      canExport
      onEdit={fn()}
      onExport={fn()}
      onImport={fn()}
      exported={{text: serializeCodeDraft(code), name: 'open-media.json'}}
    />
  ),
  play: async ({canvas}) => {
    await expect(canvas.getByRole('textbox', {name: 'Tracker JSON'})).toHaveAttribute('readonly');
    await expect(canvas.getByRole('button', {name: 'Download JSON'})).toBeVisible();
  },
};

export const StaleExport: Story = {
  globals: {theme: 'dark'},
  render: () => (
    <BuilderCode
      code={code}
      canExport
      onEdit={fn()}
      onExport={fn()}
      onImport={fn()}
      exported={{
        text: serializeCodeDraft({
          ...code,
          description: {...code.description, name: 'Older title'},
        }),
        name: 'open-media.json',
      }}
    />
  ),
  play: async ({canvas}) => {
    await expect(canvas.getByText('Code is out of date.')).toBeVisible();
    await expect(canvas.queryByRole('textbox', {name: 'Tracker JSON'})).not.toBeInTheDocument();
    await expect(canvas.getByRole('button', {name: 'Generate JSON'})).toBeEnabled();
  },
};

function PreviewDock({position}: {position: 'right' | 'bottom'}) {
  const {iframe} = useCodeMakerFrame(
    sampleResponse,
    position,
    null,
    () => {},
    () => {},
  );
  const menu = useRef<HTMLButtonElement>(null);
  return (
    <div style={{height: 350, display: 'flex'}}>
      <VerticalSplit
        top={<p style={{padding: 12}}>Open Media Lab · Select a field to inspect</p>}
        bottom={
          <TrackerBuilderPreview
            iframe={iframe}
            loaded
            position={position}
            menuButtonRef={menu}
            onPosition={fn()}
            onClose={fn()}
            onCancel={fn()}
            path=""
          />
        }
        initialTopPercent={52}
        orientation={position === 'right' ? 'horizontal' : 'vertical'}
        separatorLabel="Resize form and tracker preview"
        onResize={fn()}
      />
    </div>
  );
}

export const PreviewRight: Story = {
  render: () => <PreviewDock position="right" />,
  play: async ({canvas, canvasElement}) => {
    await expect(canvas.getByRole('separator')).toHaveAttribute('aria-orientation', 'vertical');
    const frame = canvasElement.querySelector<HTMLIFrameElement>('iframe[title="Page preview"]');
    await waitFor(() =>
      expect(frame?.contentDocument?.body.textContent).toContain('Open archives'),
    );
  },
};

export const PreviewBelow: Story = {
  globals: {theme: 'dark'},
  render: () => <PreviewDock position="bottom" />,
  play: async ({canvas, canvasElement}) => {
    await expect(canvas.getByRole('separator')).toHaveAttribute('aria-orientation', 'horizontal');
    const frame = canvasElement.querySelector<HTMLIFrameElement>('iframe[title="Page preview"]');
    await waitFor(() =>
      expect(frame?.contentDocument?.documentElement.style.colorScheme).toBe('dark'),
    );
  },
};
