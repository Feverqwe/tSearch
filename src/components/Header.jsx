import SearchForm from "./SearchForm/SearchForm";
import {Link, withRouter} from "react-router-dom";
import React from "react";
import PropTypes from "prop-types";
import {inject, observer} from "mobx-react";

const qs = require('querystring');

@withRouter
@inject('rootStore')
@observer
class Header extends React.Component {
  static propTypes = {
    rootStore: PropTypes.object,
    history: PropTypes.object,
  };

  handleSubmit = (query) => {
    const location = '/search?' + qs.stringify({
      query: query
    });
    this.props.history.push(location);
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