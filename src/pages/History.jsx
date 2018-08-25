import React from 'react';
import Header from "../components/Header";
import ScrollTop from "../components/ScrollTop";
import {inject, observer} from "mobx-react";
import PropTypes from "prop-types";
import RootStore from "../stores/RootStore";
import highlight from "../tools/highlight";
import '../../src/assets/css/history.less';
import {HistoryClickStore, HistoryQueryStore} from '../stores/HistoryStore';

const qs = require('querystring');

@inject('rootStore')
@observer
class History extends React.Component {
  componentDidMount() {
    if (this.props.rootStore.history.state === 'idle') {
      this.props.rootStore.history.fetchHistory();
    }
  }
  render() {
    const history = this.props.rootStore.history;
    let body = null;
    switch (history.state) {
      case 'pending': {
        body = ('Loading...');
        break;
      }
      case 'error': {
        body = ('Error');
        break;
      }
      case 'done': {
        const queries = history.getHistorySortByTime().map(query => {
          return (
            <HistoryQuery key={query.query} query={query} {...this.props}/>
          );
        });

        body = (
          <div className="history">
            {queries}
          </div>
        );
        break;
      }
      case 'idle': {
        body = ('Idle');
        break;
      }
    }

    return (
      <div>
        <Header {...this.props}/>
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

History.propTypes = null && {
  rootStore: PropTypes.instanceOf(RootStore)
};

@inject('rootStore')
@observer
class HistoryQuery extends React.Component {
  constructor(props) {
    super(props);

    this.handleRemove = this.handleRemove.bind(this);
  }
  handleRemove(e) {
    e.preventDefault();
    const history = this.props.rootStore.history;
    const query = this.props.query;
    history.removeQuery(query.query);
    history.save();
  }
  render() {
    const query = this.props.query;

    const links = query.getClicksSortByTime().map(link => {
      return (
        <HistoryQueryLink key={link.url} link={link} {...this.props}/>
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

HistoryQuery.propTypes = null && {
  rootStore: PropTypes.instanceOf(RootStore),
  query: PropTypes.instanceOf(HistoryQueryStore),
};

@inject('rootStore')
@observer
class HistoryQueryLink extends React.Component {
  constructor(props) {
    super(props);

    this.handleRemove = this.handleRemove.bind(this);
  }
  handleRemove(e) {
    e.preventDefault();
    const history = this.props.rootStore.history;
    const query = this.props.query;
    const link = this.props.link;
    query.removeClick(link.url);
    history.save();
  }
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

HistoryQueryLink.propTypes = null && {
  rootStore: PropTypes.instanceOf(RootStore),
  query: PropTypes.instanceOf(HistoryQueryStore),
  link: PropTypes.instanceOf(HistoryClickStore),
};

export default History;