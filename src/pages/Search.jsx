import React from 'react';
import Header from "../components/Header";
import Profiles from "../components/Profiles";
import Filters from "../components/Filters";
import ScrollTop from "../components/ScrollTop";
import PropTypes from "prop-types";
import RootStore from "../stores/RootStore";
import {inject, observer} from "mobx-react";
import SearchStore from "../stores/SearchStore";

@inject('rootStore')
@observer
class Search extends React.Component {
  constructor(props) {
    super(props);

    /**@type SearchStore*/
    this.search = props.rootStore.createSearch(props.query);
  }
  componentWillUnmount() {
    this.props.rootStore.destroySearch(this.search);
    this.search = null;
  }
  render() {
    let searchQuery = null;
    if (
      this.props.rootStore.profile &&
      this.props.rootStore.profile.trackersIsReady
    ) {
      searchQuery = (
        <SearchQuery search={this.search}/>
      );
    }

    return (
      <div>
        <Header {...this.props}/>
        <div className="content content-row">
          <div className="parameter_box">
            <Profiles/>
            <Filters/>
          </div>
          <div className="main">
            {searchQuery}
            Search...
          </div>
        </div>
        <ScrollTop/>
      </div>
    );
  }
}

Search.propTypes = null && {
  rootStore: PropTypes.instanceOf(RootStore)
};

@inject('rootStore')
@observer
class SearchQuery extends React.Component {
  componentDidMount() {
    this.props.search.fetchResults();
  }
  render() {
    return (null);
  }
}

SearchQuery.propTypes = null && {
  rootStore: PropTypes.instanceOf(RootStore),
  search: PropTypes.instanceOf(SearchStore),
};

export default Search;