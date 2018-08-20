import React from 'react';
import Main from "./pages/Main";
import Search from "./pages/Search";
import NotFound from "./pages/NotFound";
import {Redirect} from "react-router-dom";

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
      <Search {...props} query={query.query}/>
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