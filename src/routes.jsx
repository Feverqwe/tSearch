import React from 'react';
import Main from "./pages/Main";
import Search from "./pages/Search";
import NotFound from "./pages/NotFound";
import {Switch} from "react-router-dom";

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
    return (
      <Search {...props}/>
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