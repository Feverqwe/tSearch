import {observer} from "mobx-react/index";
import React from "react";
import {typeSortMap} from "../tools/sortResults";
import highlight from "../tools/highlight";
const debug = require('debug')('Table');

@observer class Table extends React.Component {
  constructor() {
    super();

    this.columns = ['date', 'quality', 'title', 'size', 'seed', 'peer'];
    // todo: hide columns
    /*if (storage.hidePeerRow) {
      this.columns.splice(this.columns.indexOf('peer'), 1);
    }
    if (storage.hideSeedRow) {
      this.columns.splice(this.columns.indexOf('seed'), 1);
    }*/
  }
  handleSortBy(by, e) {
    e.preventDefault();
    /**@type {SearchFragTableM}*/
    const table = this.props.table;

    if (e.ctrlKey) {
      table.subSortBy(by);
    } else {
      table.sortBy(by);
    }
  }
  getHeaderColumn(type) {
    /**@type {SearchFragTableM}*/
    const table = this.props.table;
    const name = chrome.i18n.getMessage('row_' + type);
    const nameShort = chrome.i18n.getMessage('row_' + type + '__short') || name;
    const sortBy = table.getSortBy(type);
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
      <a key={type} className={classList.join(' ')} href={'#cell-' + type} onClick={this.handleSortBy.bind(this, type)}>
        <span className="cell__title" title={name}>{nameShort}</span>
        <i className="cell__sort"/>
      </a>
    );
  }
  getHeaderColumns() {
    return this.columns.map(type => this.getHeaderColumn(type));
  }
  getRows(results) {
    return results.map(result => (
      <TableRow key={result.id} row={result} searchFrag={this.props.searchFrag} store={this.props.store} columns={this.columns}/>
    ));
  }
  render() {
    /**@type {SearchFragTableM}*/
    const table = this.props.table;

    let moreBtn = null;
    if (table.hasMoreBtn()) {
      moreBtn = (
        <a className="loadMore search__submit footer__loadMore" href="#more" onClick={table.handleMoreBtn}>{
          chrome.i18n.getMessage('loadMore')
        }</a>
      );
    }

    return (
      <div className="table table-results">
        <div className="table__head">
          <div className="row head__row">
            {this.getHeaderColumns()}
          </div>
          <div className="body table__body">
            {this.getRows(table.getSortedFilteredResults())}
          </div>
          <div className="footer table__footer">
            {moreBtn}
          </div>
        </div>
      </div>
    );
  }
}

@observer class TableRow extends React.Component {
  constructor() {
    super();

    this.handleClick = this.handleClick.bind(this);
  }
  handleClick() {
    /**@type {IndexM}*/
    const store = this.props.store;
    const /**SearchFragM*/searchFrag = this.props.searchFrag;
    const /**TrackerResultM*/row = this.props.row;
    store.history.onClick(searchFrag.query, row.title, row.url, row.trackerInfo.id);
  }
  render() {
    const /**TrackerResultM*/result = this.props.row;
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

            let titleIcon = (
              <div className={`tracker__icon ${result.trackerInfo.iconClassName}`}
                   title={result.trackerInfo.name}/>
            );

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

export default Table;