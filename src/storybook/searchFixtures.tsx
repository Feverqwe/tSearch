import {useState, type ComponentProps} from 'react';
import {useNavigate} from 'react-router-dom';

import FiltersPanel from '../components/FiltersPanel';
import HeaderView from '../components/HeaderView';
import ProfileSelector from '../components/ProfileSelector';
import SearchInput from '../components/SearchForm/SearchInput';
import TrackerList from '../components/TrackerList';
import TrackerRow from '../components/TrackerRow';
import highlight from '../tools/highlight';
import type {ResultRow} from '../components/SearchResultRow';

export const columns = ['date', 'quality', 'title', 'size', 'seeds', 'peers'];

const media = [
  {title: 'Big Buck Bunny (2008) 1080p', sizeText: '692 MB', seeds: 42, peers: 9, quality: 310},
  {title: 'Sintel (2010) 2160p', sizeText: '2.1 GB', seeds: 110, peers: 12, quality: 480},
  {
    title: 'Tears of Steel (2012) — open production files and film master',
    sizeText: '8.3 GB',
    seeds: 17,
    peers: 3,
    quality: 145,
  },
];

export const results: ResultRow[] = media.map((item, index) => ({
  ...item,
  trackerId: 'open-films',
  url: `https://example.invalid/item/${index}`,
  downloadUrl: index === 1 ? undefined : `https://example.invalid/download/${index}`,
  dateText: `${index + 10} Nov`,
  dateTitle: `${index + 10} Nov 2026`,
  categoryTitle: index === 2 ? undefined : 'Short films',
  categoryUrl: index === 2 ? undefined : 'https://example.invalid/films',
  titleMatches: highlight.getMatches(item.title, highlight.getMap('Bunny')),
}));

export const trackerNames = {'open-films': 'Open Films'};

export const trackers: Omit<ComponentProps<typeof TrackerRow>, 'onSelect'>[] = [
  {id: 'open-films', name: 'Open Films', count: '3'},
  {id: 'archive', name: 'Archive', count: '2/8'},
  {id: 'community', name: 'Community', login: {url: 'https://example.invalid/login'}},
  {
    id: 'mirror',
    name: 'Open Production Archive and Independent Animation Mirror',
    status: 'loading',
  },
  {id: 'legacy', name: 'Legacy', status: 'error'},
  {id: 'removed', name: 'Removed tracker', status: 'missing'},
];

const profiles = [
  {id: 'all', name: 'All trackers'},
  {id: 'films', name: 'Open films'},
];

export function ProfileFixture() {
  const [profile, setProfile] = useState('all');
  const [selected, setSelected] = useState<string>();
  const [height, setHeight] = useState(149);
  const visibleTrackers = profile === 'films' ? trackers.slice(0, 1) : trackers;
  return (
    <div className="parameter_box__left">
      <ProfileSelector
        profiles={profiles}
        value={profile}
        onSelect={(id) => {
          setProfile(id);
          setSelected(undefined);
        }}
      />
      <div className="parameter parameter-tracker">
        <TrackerList height={height} onResize={setHeight}>
          {visibleTrackers.map((tracker) => (
            <TrackerRow
              key={tracker.id}
              {...tracker}
              selected={selected === tracker.id}
              onSelect={() => {
                setSelected(selected === tracker.id ? undefined : tracker.id);
              }}
            />
          ))}
        </TrackerList>
      </div>
    </div>
  );
}

export function FiltersFixture({
  text,
  onTextChange,
  showPeers = true,
}: {
  text: string;
  onTextChange: (text: string) => void;
  showPeers?: boolean;
}) {
  const [size, setSize] = useState([0, 0]);
  const [seeds, setSeeds] = useState([0, 0]);
  const [peers, setPeers] = useState([0, 0]);
  const [time, setTime] = useState({min: 0, max: 0, preset: 0});

  return (
    <FiltersPanel
      text={text}
      onTextChange={onTextChange}
      size={{min: size[0], max: size[1], onChange: (min, max) => setSize([min, max])}}
      seed={{min: seeds[0], max: seeds[1], onChange: (min, max) => setSeeds([min, max])}}
      peer={
        showPeers
          ? {min: peers[0], max: peers[1], onChange: (min, max) => setPeers([min, max])}
          : undefined
      }
      time={{...time, onChange: (min, max, preset) => setTime({min, max, preset})}}
    />
  );
}

export function HeaderFixture({
  initialQuery = '',
  pending,
}: {
  initialQuery?: string;
  pending?: boolean;
}) {
  const [query, setQuery] = useState(initialQuery);
  const navigate = useNavigate();
  const suggestions = ['Big Buck Bunny', 'Sintel', 'Tears of Steel'].filter((title) =>
    title.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <HeaderView
      search={
        <SearchInput
          query={query}
          pendingQuery={pending ? initialQuery : undefined}
          suggestions={suggestions}
          onChange={setQuery}
          onSubmit={(query) => void navigate('/search?' + new URLSearchParams({query}))}
          onRequestSuggestions={() => {}}
          onClearSuggestions={() => {}}
        />
      }
    />
  );
}
