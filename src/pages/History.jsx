import '../../src/assets/css/history.less';
import React from 'react';
import Header from "../components/Header";
import ScrollTop from "../components/ScrollTop";
import {inject, observer} from "mobx-react";
import PropTypes from "prop-types";
import highlight from "../tools/highlight";
import {Link} from "react-router-dom";
import getTitle from "../tools/getTitle";

const qs = require('querystring');

@inject('rootStore')
@observer
class History extends React.Component {
  static propTypes = {
    rootStore: PropTypes.object,
  };

  constructor(props) {
    super(props);

    if (this.props.rootStore.history.state === 'idle') {
      this.props.rootStore.history.fetchHistory();
    }
  }

  componentDidMount() {
    document.title = getTitle('History');
    if (window.ga) {
      window.ga('send', 'pageview', {page: location.href, title: document.title});
    }
  }

  /**@return HistoryStore*/
  get historyStore() {
    return this.props.rootStore.history;
  }

  render() {
    const historyStore = this.historyStore;
    if (historyStore.state !== 'done') {
      return (`Loading history: ${historyStore.state}`);
    }

    const queries = historyStore.getHistorySortByTime().map(query => {
      return (
        <HistoryQuery key={query.query} query={query}/>
      );
    });

    const body = (
      <div className="history">
        {queries}
      </div>
    );

    return (
      <div className="page-ctr">
        <Header/>
        <div className="content content-row">
          <div className="main history-ctr">
            {body}
          </div>
        </div>
        <ScrollTop/>
      </div>
    );
  }
}

@inject('rootStore')
@observer
class HistoryQuery extends React.Component {
  static propTypes = {
    rootStore: PropTypes.object,
    query: PropTypes.object.isRequired,
  };

  handleRemove = (e) => {
    e.preventDefault();
    const history = this.props.rootStore.history;
    const query = this.props.query;
    history.removeQuery(query.query);
    history.save();
  };

  render() {
    const query = this.props.query;

    const links = query.getClicksSortByTime().map(link => {
      return (
        <HistoryQueryLink key={link.url} query={query} link={link}/>
      );
    });

    const link = '/search?' + qs.stringify({
      query: query.query
    });

    return (
      <div className="history__item">
        <div className="item item-query">
          <a className="item__remove" data-action="remove-query" href="#remove"
             title={chrome.i18n.getMessage('remove')}
             onClick={this.handleRemove}
          />
          <Link className="item__link" to={link}>{query.query || '""'}</Link>
        </div>
        <div className="click_history item__click_history">
          {links}
        </div>
      </div>
    );
  }
}

@inject('rootStore')
@observer
class HistoryQueryLink extends React.Component {
  static propTypes = {
    rootStore: PropTypes.object,
    query: PropTypes.object.isRequired,
    link: PropTypes.object.isRequired,
  };

  handleRemove = (e) => {
    e.preventDefault();
    const history = this.props.rootStore.history;
    const query = this.props.query;
    const link = this.props.link;
    query.removeClick(link.url);
    history.save();
  };

  render() {
    const link = this.props.link;

    return (
      <div className="item item-click_history">
        <a className="item__remove" data-action="remove-click_history" href="#remove"
           title={chrome.i18n.getMessage('remove')}
           onClick={this.handleRemove}
        />
        <span className="item__date">
          {link.timeString}
        </span>
        {highlight.getReactComponent('a', {
            className: 'item__link',
            target: '_blank',
            href: link.url
          },
          link.title,
          link.titleHighlightMap
        )}
      </div>
    );
  }
}

export default History;