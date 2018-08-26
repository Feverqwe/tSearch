import React from 'react';
import Main from "./pages/Main";
import Search from "./pages/Search";
import NotFound from "./pages/NotFound";
import {Redirect} from "react-router-dom";
import History from "./pages/History";
import Options from "./pages/Options";

const qs = require('querystring');

const routes = [{
  path: '/',
  exact: true,
  render: props => {
    return (
      <Main {...props}/>
    );
  },
}, {
  path: '/search',
  render: props => {
    const query = qs.parse(props.location.search.substr(1));
    if (query.query === undefined) {
      return (
        <Redirect to={'/'}/>
      );
    }
    return (
      <Search key={query.query} {...props} query={query.query}/>
    );
  },
}, {
  path: '/history',
  render: props => {
    return (
      <History {...props}/>
    );
  },
}, {
  path: '/options',
  render: props => {
    const query = qs.parse(props.location.search.substr(1));
    if (query.section === undefined) {
      return (
        <Redirect to={'/options?section=main'}/>
      );
    }
    return (
      <Options {...props} section={query.section}/>
    );
  },
}, {
  path: null,
  render: props => {
    return (
      <NotFound {...props}/>
    );
  },
}];

export default routes;