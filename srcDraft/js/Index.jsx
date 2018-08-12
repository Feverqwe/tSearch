import Filters from "./components/Filters";
import React from 'react';
import ReactDOM from 'react-dom';
import '../../src/assets/css/index.less';
import SearchForm from '../../src/components/SearchForm/SearchForm';
import indexModel from './models/index';
import {observer} from 'mobx-react';
import ProfileSelect from './components/ProfileSelect';
import ScrollTop from './components/ScrollTop';
import Trackers from './components/Trackers';
import {HashRouter, Route, Link, withRouter} from 'react-router-dom';
import SearchFrag from './components/SearchFrag';
import Explore from "./components/Explore/Explore";
import getLogger from "../../src/tools/getLogger";

const qs = require('querystring');

const debug = getLogger('Index');

@observer class Index extends React.Component {
  constructor() {
    super();

    this.RouterRender = withRouter(observer(this.RouterRender.bind(this)));
  }
  RouterRender(props) {
    switch (this.props.store.state) {
      case 'loading': {
        return ('Loading...');
      }
      case 'error': {
        return ('Error');
      }
      case 'ready': {
        return (
          <Main {...this.props} {...props}/>
        );
      }
    }
    return null;
  }
  render() {
    return (
      <HashRouter>
        <this.RouterRender/>
      </HashRouter>
    );
  }
}

@observer class Main extends React.Component {
  constructor() {
    super();

    this.routeExploreRender = this.routeExploreRender.bind(this);
    this.routeSearchRender = this.routeSearchRender.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  routeExploreRender(props) {
    return (
      <Explore {...this.props} {...props}/>
    );
  }
  routeSearchRender(props) {
    return (
      <SearchFrag {...this.props} {...props}/>
    );
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
            <a href="history.html" className="menu__btn menu__btn-history" title={chrome.i18n.getMessage('history')}/>
            <a href="options.html" className="menu__btn menu__btn-options" title={chrome.i18n.getMessage('options')}/>
          </div>
        </div>
        <div className="content content-row">
          <div className="parameter_box">
            <div className="parameter_box__left">
              <div className="parameter parameter-profile">
                <div className="profile_box">
                  <ProfileSelect store={this.props.store}/>
                </div>
              </div>
              <div className="parameter parameter-tracker">
                <Trackers store={this.props.store}/>
              </div>
            </div>
            <Filters store={this.props.store}/>
          </div>
          <div className="main">
            <Route exact path="/" render={this.routeExploreRender}/>
            <Route path="/search" render={this.routeSearchRender}/>
          </div>
        </div>
        <ScrollTop/>
      </div>
    );
  }
}

window.app = ReactDOM.render(<Index store={indexModel.create()}/>, document.getElementById('root'));