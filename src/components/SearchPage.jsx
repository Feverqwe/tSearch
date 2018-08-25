import React from "react";
import PropTypes from "prop-types";
import RootStore from "../stores/RootStore";
import SearchStore from "../stores/SearchStore";
import {inject, observer} from "mobx-react";
import {typeSortMap} from "../tools/sortResults";
import SearchPageStore from "../stores/SearchPageStore";
import highlight from "../tools/highlight";
import ResultPageItemStore from "../stores/ResultPageItemStore";
import getTrackerIconClassName from "../tools/getTrackerIconClassName";


@inject('rootStore')
@observer
class SearchPage extends React.Component {
  constructor(props) {
    super(props);

    this.columns = ['date', 'quality', 'title', 'size', 'seed', 'peer'];
  }
  render() {
    const headers = this.columns.map(column => {
      return (
        <SearchPageColumn key={`column-${column}`} {...this.props} type={column}/>
      )
    });

    let moreBtn = null;

    const body = this.props.searchPage.getSortedAndFilteredResults().map(result => {
      return (
        <SearchPageRow key={`result-${result.id}`} {...this.props} columns={this.columns} result={result}/>
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
          <div className="footer table__footer">
            {moreBtn}
          </div>
        </div>
      </div>
    );
  }
}

SearchPage.propTypes = null && {
  rootStore: PropTypes.instanceOf(RootStore),
  searchStore: PropTypes.instanceOf(SearchStore),
  searchPage: PropTypes.instanceOf(SearchPageStore),
};

@observer
class SearchPageColumn extends React.Component {
  constructor(props) {
    super(props);

    this.handleClick = this.handleClick.bind(this);
  }
  handleClick(e) {
    e.preventDefault();
    if (e.ctrlKey) {
      this.props.searchPage.appendSortBy(this.props.type);
    } else {
      this.props.searchPage.sortBy(this.props.type);
    }
  }
  render() {
    const type = this.props.type;
    const name = chrome.i18n.getMessage('row_' + type);
    const nameShort = chrome.i18n.getMessage('row_' + type + '__short') || name;
    const sortBy = this.props.searchPage.getSortBy(type);
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

SearchPageColumn.propTypes = null && {
  searchStore: PropTypes.instanceOf(SearchStore),
  searchPage: PropTypes.instanceOf(SearchPageStore),
  type: PropTypes.string,
};

@inject('rootStore')
@observer
class SearchPageRow extends React.Component {
  constructor(props) {
    super(props);

    this.handleClick = this.handleClick.bind(this);
  }
  handleClick() {
    const rootStore = this.props.rootStore;
    const searchStore = this.props.searchStore;
    const result = this.props.result;
    rootStore.history.onClick(searchStore.query, result.title, result.url, result.trackerId);
  }
  render() {
    const result = this.props.result;
    return (
      <div className="row body__row">{this.props.columns.map(type => {
        switch (type) {
          case 'date': {
            return (
              <div key="date" className={`cell row__cell cell-${type}`}
                   title={result.dateTitle}>{result.dateText}</div>
            );
          }
          case 'quality': {
            const qualityValue = result.quality;
            const percent = result.quality / 500 * 100;
            return (
              <div key="quality" className={`cell row__cell cell-${type}`}>
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
            if (result.tracker) {
              titleIcon = (
                <div className={`tracker__icon ${getTrackerIconClassName(result.trackerId)}`}
                     title={result.tracker.name}/>
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
              <div key="title" className={`cell row__cell cell-${type}`} onClick={this.handleClick}>
                <div className="cell__title">
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
              <div key="size" className={`cell row__cell cell-${type}`}>
                {downloadLink}
              </div>
            );
          }
          case 'seed': {
            return (
              <div key="seed" className={`cell row__cell cell-${type}`}>
                {result.seed}
              </div>
            );
          }
          case 'peer': {
            return (
              <div key="peer" className={`cell row__cell cell-${type}`}>
                {result.peer}
              </div>
            );
          }
          default: {
            return null;
          }
        }
      })}</div>
    );
  }
}

SearchPageRow.propTypes = null && {
  rootStore: PropTypes.instanceOf(RootStore),
  searchStore: PropTypes.instanceOf(SearchStore),
  searchPage: PropTypes.instanceOf(SearchPageStore),
  row: PropTypes.instanceOf(ResultPageItemStore),
  columns: PropTypes.arrayOf(PropTypes.string)
};

export default SearchPage;