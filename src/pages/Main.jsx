import React from 'react';
import SearchForm from "../components/SearchForm/SearchForm";
import {Link} from "react-router-dom";
import '../../src/assets/css/index.less';
import ScrollTop from "../components/ScrollTop";
import Filters from "../components/Filters";


class Main extends React.Component {
  constructor() {
    super();

    this.handleSubmit = this.handleSubmit.bind(this);
  }
  handleSubmit(query) {
    const state = {
      query: query
    };
    const location = 'search?' + qs.stringify(state);
    this.props.history.push(location);
  }
  render() {
    return (
      <div>
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
        <div className="content content-row">
          <div className="parameter_box">
            <div className="parameter_box__left">
              <div className="parameter parameter-profile">
                <div className="profile_box">
                  {/*<ProfileSelect store={this.props.store}/>*/}
                </div>
              </div>
              <div className="parameter parameter-tracker">
                {/*<Trackers store={this.props.store}/>*/}
              </div>
            </div>
            <Filters/>
          </div>
          <div className="main">
            Main...
          </div>
        </div>
        <ScrollTop/>
      </div>
    );
  }
}

export default Main;