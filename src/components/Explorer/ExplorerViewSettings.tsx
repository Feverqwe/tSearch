import IconButton from '../ui/IconButton';

interface ExplorerViewSettingsProps {
  id: string;
  hidden?: boolean;
  zoom: number;
  rows: number;
  refreshing?: boolean;
  onZoom: (zoom: number) => void;
  onResetZoom: () => void;
  onRows: (rows: number) => void;
  onRefresh?: () => void;
  onMoveEarlier?: () => void;
  onMoveLater?: () => void;
}

const message = (key: string) => chrome.i18n.getMessage(key);

export default function ExplorerViewSettings({
  id,
  hidden,
  zoom,
  rows,
  refreshing,
  onZoom,
  onResetZoom,
  onRows,
  onRefresh,
  onMoveEarlier,
  onMoveLater,
}: ExplorerViewSettingsProps) {
  return (
    <div id={id} hidden={hidden} className="section__setup">
      <div className="section__zoom">
        <label>
          {message('explorer_poster_size')}
          <input
            onChange={(event) => onZoom(Number(event.currentTarget.value))}
            value={zoom}
            type="range"
            min={20}
            max={150}
            aria-valuetext={`${zoom}%`}
          />
        </label>
        <output aria-hidden="true">{zoom}%</output>
        <IconButton
          label={message('explorer_poster_size_reset')}
          icon="reset"
          variant="quiet"
          onClick={onResetZoom}
        />
      </div>
      <label>
        {message('explorer_rows')}
        <select
          value={rows}
          className="ts-control"
          onChange={(event) => onRows(Number(event.currentTarget.value))}
        >
          {[1, 2, 3, 4, 5, 6].map((count) => (
            <option key={count} value={count}>
              {count}
            </option>
          ))}
        </select>
      </label>
      <IconButton
        label={message('explorer_refresh')}
        icon="refresh"
        busy={refreshing}
        disabled={!onRefresh}
        onClick={onRefresh}
      />
      <IconButton
        label={message('explorer_move_earlier')}
        icon="up"
        variant="quiet"
        disabled={!onMoveEarlier}
        onClick={onMoveEarlier}
      />
      <IconButton
        label={message('explorer_move_later')}
        icon="down"
        variant="quiet"
        disabled={!onMoveLater}
        onClick={onMoveLater}
      />
    </div>
  );
}
