import type SearchResult from '../stores/ResultPageItemStore';
import type {TitlePresentation} from '../tools/titlePresentation';

import QualityMeter from './QualityMeter';
import ResultTitle from './ResultTitle';
import Tooltip from './ui/Tooltip';

import blankSvg from '../assets/img/blank.svg';

export type ResultRow = Pick<
  SearchResult,
  | 'trackerId'
  | 'dateTitle'
  | 'dateText'
  | 'quality'
  | 'categoryTitle'
  | 'categoryUrl'
  | 'url'
  | 'title'
  | 'titleMatches'
  | 'downloadUrl'
  | 'sizeText'
  | 'seeds'
  | 'peers'
>;

interface ResultRowProps {
  result: ResultRow;
  trackerName?: string;
  trackerIcon?: string;
  columns: readonly string[];
  onOpen: () => void;
  presentation?: TitlePresentation;
}

export default function SearchResultRow({
  result,
  trackerName,
  trackerIcon,
  columns,
  onOpen,
  presentation,
}: ResultRowProps) {
  const cells = columns.map((type) => {
    switch (type) {
      case 'date': {
        return (
          <td key={type} className={`cell row__cell cell-${type}`} title={result.dateTitle}>
            {result.dateText}
          </td>
        );
      }
      case 'quality': {
        return (
          <td key={type} className={`cell row__cell cell-${type}`}>
            <QualityMeter value={result.quality} />
          </td>
        );
      }
      case 'title': {
        let category = null;
        if (result.categoryTitle) {
          if (result.categoryUrl) {
            category = (
              <a className="category" target="_blank" href={result.categoryUrl}>
                {result.categoryTitle}
              </a>
            );
          } else {
            category = <span className="category">{result.categoryTitle}</span>;
          }
        }

        const name = trackerName || result.trackerId;
        const source = (
          <Tooltip text={name}>
            {(props) => (
              <img
                {...props}
                className="result-tracker-icon"
                src={trackerIcon || blankSvg}
                alt={name}
              />
            )}
          </Tooltip>
        );

        return (
          <td key={type} className={`cell row__cell cell-${type}`}>
            <div className="cell__title">
              <a
                className="title"
                target="_blank"
                href={result.url}
                onClick={onOpen}
                onAuxClick={(event) => {
                  if (event.button === 1) onOpen();
                }}
              >
                <ResultTitle
                  title={result.title}
                  matches={result.titleMatches}
                  presentation={presentation}
                />
              </a>
              {!category && source}
            </div>
            {category && (
              <div className="cell__category">
                {category}
                {source}
              </div>
            )}
          </td>
        );
      }
      case 'size': {
        let downloadLink = null;
        if (result.downloadUrl) {
          downloadLink = (
            <a
              className="cell__download"
              target="_blank"
              href={result.downloadUrl}
              aria-label={chrome.i18n.getMessage('download_torrent', [result.sizeText])}
            >
              {result.sizeText + String.fromCharCode(160) + String.fromCharCode(8595)}
            </a>
          );
        } else {
          downloadLink = result.sizeText;
        }
        return (
          <td key={type} className={`cell row__cell cell-${type}`}>
            {downloadLink}
          </td>
        );
      }
      case 'seeds': {
        return (
          <td key={type} className={`cell row__cell cell-${type}`}>
            {result.seeds}
          </td>
        );
      }
      case 'peers': {
        return (
          <td key={type} className={`cell row__cell cell-${type}`}>
            {result.peers}
          </td>
        );
      }
      default: {
        return null;
      }
    }
  });
  return <tr className="row body__row">{cells}</tr>;
}
