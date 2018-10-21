import React from 'react';
import Header from "../components/Header";
import Profiles from "../components/Profiles";
import Filters from "../components/Filters";
import ScrollTop from "../components/ScrollTop";
import PropTypes from "prop-types";
import RootStore from "../stores/RootStore";
import {inject, observer} from "mobx-react";
import SearchPage from "../components/SearchPage";


@inject('rootStore')
@observer
class Search extends React.Component {
  static propTypes = null && {
    rootStore: PropTypes.instanceOf(RootStore),
    query: PropTypes.string,
  };

  constructor(props) {
    super(props);

    if (this.props.rootStore.options.state === 'idle') {
      this.props.rootStore.options.fetchOptions();
    }
    if (this.props.rootStore.history.state === 'idle') {
      this.props.rootStore.history.fetchHistory();
    }
    if (this.props.rootStore.profiles.state === 'idle') {
      this.props.rootStore.profiles.fetchProfiles();
    }
    if (this.props.rootStore.trackers.state === 'idle') {
      this.props.rootStore.trackers.fetchTrackers();
    }

    this.props.rootStore.searchForm.setQuery(this.props.query);
  }

  get searchStore() {
    return this.props.rootStore.searches.get(this.props.query);
  }

  render() {
    let searchSession = null;
    if (
      this.props.rootStore.options.state === 'done' &&
      this.props.rootStore.history.state === 'done' &&
      this.props.rootStore.profiles.state === 'done' &&
      this.props.rootStore.trackers.state === 'done' &&
      this.props.rootStore.profiles.profile
    ) {
      searchSession = (
        <SearchSession key={`query-${this.props.query}`} query={this.props.query}/>
      )
    }

    return (
      <div className="page-ctr">
        <Header {...this.props} searchStore={this.searchStore}/>
        <div className="content content-row">
          <div className="parameter_box">
            <Profiles searchStore={this.searchStore}/>
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
  static propTypes = null && {
    rootStore: PropTypes.instanceOf(RootStore),
    query: PropTypes.string,
  };

  componentDidMount() {
    this.props.rootStore.createSearch(this.props.query);
    this.searchStore.fetchResults();
    this.props.rootStore.history.addQuery(this.searchStore.query);
  }

  componentWillUnmount() {
    this.props.rootStore.destroySearch(this.props.query);
  }

  get searchStore() {
    return this.props.rootStore.searches.get(this.props.query);
  }

  handleSearchNext = (e) => {
    e.preventDefault();
    this.searchStore.fetchNextResults();
  };

  render() {
    if (!this.searchStore) {
      return ('Loading...');
    }

    const pages = this.searchStore.resultPages.map((searchPageStore, index) => {
      if (searchPageStore.results.length) {
        return (
          <SearchPage key={`page-${index}`} searchStore={this.searchStore} searchPageStore={searchPageStore}/>
        );
      } else {
        return null;
      }
    });

    let nextQuery = this.searchStore.getNextQuery();
    let moreBtn = null;
    if (nextQuery) {
      const classList = ['loadMore search__submit footer__loadMore'];
      if (nextQuery.state === 'pending') {
        classList.push('loadMore-loading');
      }
      moreBtn = (
        <div key={'more'} className="footer table__footer">
          <a className={classList.join(' ')} href="#search-next" onClick={this.handleSearchNext}>{
            chrome.i18n.getMessage('loadMore')
          }</a>
        </div>
      );
    }

    return [
      pages,
      moreBtn
    ];
  }
}

export default Search;