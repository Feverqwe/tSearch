import type {TitlePresentation} from '../tools/titlePresentation';

import SearchResultRow, {type ResultRow} from './SearchResultRow';

type SortDirection = 'up' | 'down';
type SortIndicator = {direction: SortDirection; priority: number};

interface SearchResultsTableProps {
  columns: readonly string[];
  results: readonly ResultRow[];
  trackerNames: Readonly<Record<string, string | undefined>>;
  trackerIcons?: Readonly<Record<string, string | undefined>>;
  sortDirections: Readonly<Record<string, SortIndicator | undefined>>;
  presentation?: TitlePresentation;
  onSort: (column: string, append: boolean) => void;
  onOpenResult: (result: ResultRow) => void;
}

export default function SearchResultsTable({
  columns,
  results,
  trackerNames,
  trackerIcons,
  sortDirections,
  presentation,
  onSort,
  onOpenResult,
}: SearchResultsTableProps) {
  return (
    <div className="table table-results">
      <table className="results-table">
        <thead className="table__head">
          <tr className="row head__row">
            {columns.map((column) => {
              const name = chrome.i18n.getMessage('row_' + column);
              const nameShort = chrome.i18n.getMessage('row_' + column + '__short') || name;
              const sort = sortDirections[column];
              const ariaSort =
                sort?.priority === 1
                  ? sort.direction === 'up'
                    ? 'ascending'
                    : 'descending'
                  : undefined;
              return (
                <th key={column} scope="col" className={`cell cell-${column}`} aria-sort={ariaSort}>
                  <button
                    className="sort-button"
                    type="button"
                    aria-label={name}
                    title={name}
                    onClick={(event) => onSort(column, event.ctrlKey || event.metaKey)}
                    onKeyDown={(event) => {
                      if (
                        (event.ctrlKey || event.metaKey) &&
                        (event.key === 'Enter' || event.key === ' ')
                      ) {
                        event.preventDefault();
                        if (!event.repeat) onSort(column, true);
                      }
                    }}
                  >
                    <span className="sort-label-full">{name}</span>
                    <span className="sort-label-short">{nameShort}</span>
                    {sort && (
                      <small className="sort-order">
                        {sort.direction === 'up' ? '↑' : '↓'}
                        {sort.priority}
                      </small>
                    )}
                  </button>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="body table__body">
          {results.map((result) => (
            <SearchResultRow
              key={`result-${result.url}`}
              columns={columns}
              result={result}
              presentation={presentation}
              trackerName={trackerNames[result.trackerId]}
              trackerIcon={trackerIcons?.[result.trackerId]}
              onOpen={() => onOpenResult(result)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
