import SearchForm from "./SearchForm/SearchForm";
import {Link} from "react-router-dom";
import React from "react";
import PropTypes from "prop-types";
import SearchStore from "../stores/SearchStore";
import {inject, observer} from "mobx-react";
import RootStore from "../stores/RootStore";

const qs = require('querystring');

@inject('rootStore')
@observer
class Header extends React.Component {
  static propTypes = null && {
    rootStore: PropTypes.instanceOf(RootStore),
    resetSearch: PropTypes.func,
    searchStore: PropTypes.instanceOf(SearchStore),
  };

  handleSubmit = (query) => {
    if (this.props.searchStore && this.props.searchStore.query === query) {
      this.props.resetSearch();
    } else {
      const location = '/search?' + qs.stringify({
        query: query
      });
      this.props.history.push(location);
    }
  };

  handleClick = () => {
    this.props.rootStore.searchForm.setQuery('');
  };

  render() {
    return (
      <div className="body__head">
        <div className="search">
          <SearchForm onSubmit={this.handleSubmit}/>
        </div>
        <div className="menu">
          <Link to="/" onClick={this.handleClick} className="menu__btn menu__btn-main" title={chrome.i18n.getMessage('main')}/>
          <Link to="/history" onClick={this.handleClick} className="menu__btn menu__btn-history" title={chrome.i18n.getMessage('history')}/>
          <Link to="/options" onClick={this.handleClick} className="menu__btn menu__btn-options" title={chrome.i18n.getMessage('options')}/>
        </div>
      </div>
    );
  }
}

export default Header;