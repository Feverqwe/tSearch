import SearchForm from "./SearchForm/SearchForm";
import {Link} from "react-router-dom";
import React from "react";

const qs = require('querystring');

class Header extends React.Component {
  constructor() {
    super();

    this.handleSubmit = this.handleSubmit.bind(this);
  }
  handleSubmit(query) {
    const state = {
      query: query
    };
    const location = '/search?' + qs.stringify(state);
    this.props.history.push(location);
  }
  render() {
    return (
      <div className="body__head">
        <div className="search">
          <SearchForm onSubmit={this.handleSubmit}/>
        </div>
        <div className="menu">
          <Link to="/" className="menu__btn menu__btn-main" title={chrome.i18n.getMessage('main')}/>
          <Link to="/history" className="menu__btn menu__btn-history" title={chrome.i18n.getMessage('history')}/>
          <Link to="/options" className="menu__btn menu__btn-options" title={chrome.i18n.getMessage('options')}/>
        </div>
      </div>
    );
  }
}

export default Header;