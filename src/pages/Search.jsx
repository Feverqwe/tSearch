import React from 'react';
import Header from "../components/Header";
import Profiles from "../components/Profiles";
import Filters from "../components/Filters";
import ScrollTop from "../components/ScrollTop";
import PropTypes from "prop-types";
import RootStore from "../stores/RootStore";
import {inject, observer} from "mobx-react";
import SearchPage from "../components/SearchPage";
import getTitle from "../tools/getTitle";


@inject('rootStore')
@observer
class Search extends React.Component {
  static propTypes = {
    rootStore: PropTypes.object,
    query: PropTypes.string.isRequired,
  };

  constructor(props) {
    super(props);

    if (this.rootStore.options.state === 'idle') {
      this.rootStore.options.fetchOptions();
    }
    if (this.rootStore.history.state === 'idle') {
      this.rootStore.history.fetchHistory();
    }
    if (this.rootStore.profiles.state === 'idle') {
      this.rootStore.profiles.fetchProfiles();
    }
    if (this.rootStore.trackers.state === 'idle') {
      this.rootStore.trackers.fetchTrackers();
    }

    this.rootStore.searchForm.setQuery(this.props.query);
  }

  componentDidMount() {
    document.title = getTitle(JSON.stringify(this.props.query));
    if (window.ga) {
      window.ga('send', 'pageview', {page: location.href, title: document.title});
    }
  }

  /**@return RootStore*/
  get rootStore() {
    return this.props.rootStore;
  }

  render() {
    let searchSession = null;
    if (
      this.rootStore.options.state === 'done' &&
      this.rootStore.history.state === 'done' &&
      this.rootStore.profiles.state === 'done' &&
      this.rootStore.trackers.state === 'done' &&
      this.rootStore.profiles.profile
    ) {
      searchSession = (
        <SearchSession query={this.props.query}/>
      )
    }

    return (
      <div className="page-ctr">
        <Header/>
        <div className="content content-row">
          <div className="parameter_box">
            <Profiles/>
            <Filters/>
          </div>
          <div className="main">
            {searchSession}
          </div>
        </div>
        <ScrollTop/>
      </div>
    );
  }
}

@inject('rootStore')
@observer
class SearchSession extends React.Component {
  static propTypes = {
    rootStore: PropTypes.object,
    query: PropTypes.string.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      searchId: this.rootStore.createSearch(this.props.query),
    };
  }

  /**@return RootStore*/
  get rootStore() {
    return this.props.rootStore;
  }

  /**@return SearchStore*/
  get searchStore() {
    return this.rootStore.getSearch(this.state.searchId);
  }

  componentDidMount() {
    this.searchStore.search();

    this.rootStore.history.addQuery(this.searchStore.query);

    if (this.rootStore.options.options.requestQueryDescription) {
      if (!this.searchStore.queryDescription) {
        this.searchStore.requestQueryDescription();
      }
    }

    if (window.ga) {
      if (this.searchStore.query) {
        window.ga('send', 'event', 'Search', 'keyword', this.searchStore.query);
      }
    }
  }

  componentWillUnmount() {
    this.rootStore.destroySearch(this.state.searchId);
  }

  handleSearchNext = (e) => {
    e.preventDefault();
    if (this.searchStore.state === 'pending') return;

    this.searchStore.searchNext();
  };

  render() {
    let queryDescription = null;
    if (this.searchStore.queryDescription) {
      queryDescription = (
        <QueryDescription queryDescription={this.searchStore.queryDescription}/>
      );
    }

    const pages = this.searchStore.pages.map((searchPageStore, index) => {
      return (
        <SearchPage key={`page-${index}`} searchStore={this.searchStore} searchPageStore={searchPageStore}/>
      );
    });

    let moreBtn = null;
    if (this.searchStore.hasNextQuery) {
      const classList = ['loadMore search__submit footer__loadMore'];
      if (this.searchStore.state === 'pending') {
        classList.push('loadMore-loading');
      }
      moreBtn = (
        <div className="footer table__footer">
          <a className={classList.join(' ')} href="#search-next" onClick={this.handleSearchNext}>{
            chrome.i18n.getMessage('loadMore')
          }</a>
        </div>
      );
    }

    return (
      <>
        {queryDescription}
        {pages}
        {moreBtn}
      </>
    )
  }
}

class QueryDescription extends React.Component {
  static propTypes = {
    queryDescription: PropTypes.object.isRequired,
  };

  state = {
    imageIndex: 0
  };

  /**@return QueryDescriptionStore*/
  get queryDescription() {
    return this.props.queryDescription;
  }

  handleImageError = () => {
    this.setState({
      imageIndex: this.state.imageIndex + 1
    });
  };

  render() {
    let type = null;
    if (this.queryDescription.type) {
      type = (
        <div className="type">{this.queryDescription.type}</div>
      );
    }

    let image = null;
    const imageUrl = this.queryDescription.images[this.state.imageIndex];
    if (imageUrl) {
      image = (
        <div className="poster">
          <img onError={this.handleImageError} src={imageUrl} alt=""/>
        </div>
      );
    }

    const listItems = this.queryDescription.list.map(({key, value}, index) => {
      return (
        <div key={index} className="item">
          <span className="key">{key}</span>
          {' '}
          <span>{value}</span>
        </div>
      );
    });

    let list = null;
    if (listItems.length) {
      list = (
        <div className="table">
          {listItems}
        </div>
      );
    }

    const {wikiUrl, wikiUrlText} = this.queryDescription;
    let wikiLink = null;
    if (wikiUrl &&wikiUrlText) {
      wikiLink = (
        <a href={wikiUrl} target="_blank">{wikiUrlText}</a>
      );
    }

    return (
      <div className="query-description">
        {image}
        <h1 className="title">{this.queryDescription.title}</h1>
        {type}
        <div className="desc">{this.queryDescription.description} {wikiLink}</div>
        {list}
      </div>
    );
  }
}

export default Search;