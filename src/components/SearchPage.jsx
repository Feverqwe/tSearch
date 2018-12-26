import React from "react";
import PropTypes from "prop-types";
import {inject, observer} from "mobx-react";
import {typeSortMap} from "../tools/sortResults";
import highlight from "../tools/highlight";
import getTrackerIconClassName from "../tools/getTrackerIconClassName";


@inject('rootStore')
@observer
class SearchPage extends React.Component {
  static propTypes = {
    rootStore: PropTypes.object,
    searchStore: PropTypes.object,
    searchPageStore: PropTypes.object,
  };

  render() {
    const results = this.props.searchPageStore.sortedAndFilteredResults;
    if (!results.length) {
      return null;
    }

    const columns = ['date', 'quality', 'title', 'size', 'seeds', 'peers'];
    if (this.props.rootStore.options.options.hidePeerRow) {
      columns.splice(columns.indexOf('peers'), 1);
    }
    if (this.props.rootStore.options.options.hideSeedRow) {
      columns.splice(columns.indexOf('seeds'), 1);
    }

    const headers = columns.map(column => {
      return (
        <SearchPageColumn key={`column-${column}`} {...this.props} type={column}/>
      )
    });

    const body = results.map(result => {
      return (
        <SearchPageRow key={`result-${result.url}`} {...this.props} columns={columns} result={result}/>
      )
    });

    return (
      <div className="table table-results">
        <div className="table__head">
          <div className="row head__row">
            {headers}
          </div>
          <div className="body table__body">
            {body}
          </div>
        </div>
      </div>
    );
  }
}


@observer
class SearchPageColumn extends React.Component {
  static propTypes = {
    searchStore: PropTypes.object,
    searchPageStore: PropTypes.object,
    type: PropTypes.string,
  };

  handleClick = (e) => {
    e.preventDefault();
    if (e.ctrlKey) {
      this.props.searchPageStore.appendSortBy(this.props.type);
    } else {
      this.props.searchPageStore.sortBy(this.props.type);
    }
  };

  render() {
    const type = this.props.type;
    const name = chrome.i18n.getMessage('row_' + type);
    const nameShort = chrome.i18n.getMessage('row_' + type + '__short') || name;
    const sortBy = this.props.searchPageStore.getSortBy(type);
    const sortReverse = typeSortMap[type] && typeSortMap[type].reverse;

    const classList = ['cell', 'row__cell', 'cell-' + type];
    if (sortBy) {
      let direction = sortBy.direction;
      if (sortReverse) {
        direction = direction === 0 ? 1 : 0;
      }
      if (direction === 0) {
        classList.push('cell-sort-down');
      } else {
        classList.push('cell-sort-up');
      }
    }
    return (
      <a className={classList.join(' ')} href={'#sort-by_' + type} onClick={this.handleClick}>
        <span className="cell__title" title={name}>{nameShort}</span>
        <i className="cell__sort"/>
      </a>
    );
  }
}

@inject('rootStore')
@observer
class SearchPageRow extends React.Component {
  static propTypes = {
    rootStore: PropTypes.object,
    searchStore: PropTypes.object,
    searchPageStore: PropTypes.object,
    row: PropTypes.object,
    columns: PropTypes.arrayOf(PropTypes.string)
  };

  handleClick = () => {
    const rootStore = this.props.rootStore;
    const searchStore = this.props.searchStore;
    const result = this.props.result;
    rootStore.history.addClick(searchStore.query, result.title, result.url, result.trackerId);
  };

  render() {
    const result = this.props.result;
    const tracker = this.props.rootStore.trackers.trackers.get(result.trackerId);
    const cells = this.props.columns.map(type => {
      switch (type) {
        case 'date': {
          return (
            <div key={type} className={`cell row__cell cell-${type}`}
                 title={result.dateTitle}>{result.dateText}</div>
          );
        }
        case 'quality': {
          const qualityValue = result.quality;
          const percent = result.quality / 500 * 100;
          return (
            <div key={type} className={`cell row__cell cell-${type}`}>
              <div className="quality_box" title={qualityValue}>
                <div className="quality_progress" style={{width: percent + '%'}}/>
                <span className="quality_value">{qualityValue}</span>
              </div>
            </div>
          );
        }
        case 'title': {
          let category = null;
          if (result.categoryTitle) {
            if (result.categoryUrl) {
              category = (
                <a className="category" target="_blank" href={result.categoryUrl}>{result.categoryTitle}</a>
              );
            } else {
              category = (
                <span className="category">{result.categoryTitle}</span>
              );
            }
          }

          let titleIcon = null;
          if (tracker) {
            titleIcon = (
              <div className={`tracker__icon ${getTrackerIconClassName(tracker.id)}`}
                   title={tracker.name}/>
            );
          }

          if (category) {
            category = (
              <div className="cell__category">
                {category}
                {titleIcon}
              </div>
            );
            titleIcon = null;
          }

          return (
            <div key={type} className={`cell row__cell cell-${type}`}>
              <div className="cell__title" onMouseUp={this.handleClick}>
                {highlight.getReactComponent('a', {
                  className: 'title',
                  target: '_blank',
                  href: result.url
                }, result.title, result.titleHighlightMap)}
                {titleIcon}
              </div>
              {category}
            </div>
          );
        }
        case 'size': {
          let downloadLink = null;
          if (result.downloadUrl) {
            downloadLink = (
              <a className="cell__download" target="_blank" href={result.downloadUrl}>{
                result.sizeText + String.fromCharCode(160) + String.fromCharCode(8595)
              }</a>
            );
          } else {
            downloadLink = result.sizeText;
          }
          return (
            <div key={type} className={`cell row__cell cell-${type}`}>
              {downloadLink}
            </div>
          );
        }
        case 'seeds': {
          return (
            <div key={type} className={`cell row__cell cell-${type}`}>
              {result.seeds}
            </div>
          );
        }
        case 'peers': {
          return (
            <div key={type} className={`cell row__cell cell-${type}`}>
              {result.peers}
            </div>
          );
        }
        default: {
          return null;
        }
      }
    });
    return (
      <div className="row body__row">{cells}</div>
    );
  }
}

export default SearchPage;