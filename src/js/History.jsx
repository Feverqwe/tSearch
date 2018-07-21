import React from 'react';
import ReactDOM from "react-dom";
import historyModel from "./models/historyModel";
import '../css/history.less';
import {observer} from 'mobx-react';
import highlight from "./tools/highlight";
import {unixTimeToString} from "./tools/unixTimeTo";

const qs = require('querystring');

@observer class HistoryPage extends React.Component {
  render() {
    let content = null;
    switch (this.props.store.state) {
      case 'loading': {
        content = ('Loading...');
        break;
      }
      case 'done': {
        content = (
          <History {...this.props}/>
        );
        break;
      }
    }

    return (
      <div>
        <div key="head" className="body__head">
          <div className="search">
            <h1 className="title">{chrome.i18n.getMessage('history')}</h1>
          </div>
          <div className="menu">
            <a href="index.html" className="menu__btn menu__btn-main" title={chrome.i18n.getMessage('main')}/>
          </div>
        </div>
        <div className="main">
          {content}
        </div>
      </div>
    );
  }
}

@observer class History extends React.Component {
  render() {
    const /**HistoryM*/store = this.props.store;

    const queries = store.getHistorySortByTime().map(query => {
      return (
        <HistoryQuery key={query.query} {...this.props} query={query}/>
      );
    });
    return (
      <div className="history">
        {queries}
      </div>
    );
  }
}

@observer class HistoryQuery extends React.Component {
  constructor() {
    super();

    this.handleRemove = this.handleRemove.bind(this);
  }
  handleRemove(e) {
    e.preventDefault();
    const /**HistoryM*/store = this.props.store;
    const /**QueryM*/query = this.props.query;
    store.removeQuery(query.query);
    store.save();
  }
  render() {
    const /**QueryM*/query = this.props.query;

    const links = query.getClicksSortByTime().map(link => {
      return (
        <HistoryQueryLink key={link.url} {...this.props} link={link}/>
      );
    });

    const link = 'index.html#/search?' + qs.stringify({
      query: query.query
    });

    return (
      <div className="history__item">
        <div className="item item-query">
          <a className="item__remove" data-action="remove-query" href="#remove"
             title={chrome.i18n.getMessage('remove')}
             onClick={this.handleRemove}
          />
          <a className="item__link" href={link}>{query.query}</a>
        </div>
        <div className="click_history item__click_history">
          {links}
        </div>
      </div>
    );
  }
}

@observer class HistoryQueryLink extends React.Component {
  constructor() {
    super();

    this.handleRemove = this.handleRemove.bind(this);
  }
  handleRemove(e) {
    e.preventDefault();
    const /**HistoryM*/store = this.props.store;
    const /**QueryM*/query = this.props.query;
    const /**ClickM*/link = this.props.link;
    query.removeClick(link.url);
    store.save();
  }
  render() {
    const /**QueryM*/query = this.props.query;
    const /**ClickM*/link = this.props.link;

    return (
      <div className="item item-click_history">
        <a className="item__remove" data-action="remove-click_history" href="#remove"
           title={chrome.i18n.getMessage('remove')}
           onClick={this.handleRemove}
        />
        <span className="item__date">
          {unixTimeToString(link.time)}
        </span>
        {highlight.getReactComponent('a', {
          className: 'item__link',
          target: '_blank',
          href: link.url
        }, link.title, link.getTitleHighlightMap(query.getQueryHighlightMap()))}
      </div>
    );
  }
}

window.app = ReactDOM.render(<HistoryPage store={historyModel}/>, document.getElementById('root'));