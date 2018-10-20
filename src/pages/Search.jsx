import React from 'react';
import Header from "../components/Header";
import Profiles from "../components/Profiles";
import Filters from "../components/Filters";
import ScrollTop from "../components/ScrollTop";
import PropTypes from "prop-types";
import RootStore from "../stores/RootStore";
import {inject, observer} from "mobx-react";
import SearchStore from "../stores/SearchStore";
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

    this.state = {
      session: Math.random(),
      searchStore: null
    };

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

  resetSearch = () => {
    this.setState({
      session: Math.random(),
      searchStore: null
    });
  };

  handleCreateSearchStore = (searchStore) => {
    this.setState({
      searchStore: searchStore
    });
  };

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
        <SearchSession key={`${this.props.rootStore.profiles.profile.id}_${this.state.session}`} query={this.props.query} onCreateSearchStore={this.handleCreateSearchStore}/>
      )
    }

    return (
      <div className="page-ctr">
        <Header {...this.props} searchStore={this.state.searchStore} resetSearch={this.resetSearch}/>
        <div className="content content-row">
          <div className="parameter_box">
            <Profiles searchStore={this.state.searchStore}/>
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
    onCreateSearchStore: PropTypes.func,
  };

  componentDidMount() {
    this.searchStoreId = this.props.rootStore.createSearch(this.props.query);
    this.props.onCreateSearchStore(this.searchStore);
    this.searchStore.fetchResults();
    this.props.rootStore.history.addQuery(this.searchStore.query);
    this.forceUpdate();
  }

  componentWillUnmount() {
    this.props.rootStore.destroySearch(this.searchStoreId);
  }

  get searchStore() {
    return this.props.rootStore.searches.get(this.searchStoreId);
  }

  handleSearchNext = (e) => {
    e.preventDefault();
    this.searchStore.fetchResults();
  };

  render() {
    if (!this.searchStore) {
      return ('Loading...');
    }

    const pages = this.searchStore.resultPages.map((searchPageStore, index) => {
      return (
        <SearchPage key={`search-page-${index}`} searchStore={this.searchStore} searchPageStore={searchPageStore}/>
      );
    });

    let moreBtn = null;
    if (this.searchStore.hasNextQuery()) {
      moreBtn = (
        <div key={'more'} className="footer table__footer">
          <a className="loadMore search__submit footer__loadMore" href="#search-next" onClick={this.handleSearchNext}>{
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