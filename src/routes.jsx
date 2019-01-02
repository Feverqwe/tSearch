import React from 'react';
import NotFound from "./pages/NotFound";
import {Redirect} from "react-router-dom";
import ComponentLoader from "./components/ComponentLoader";
import Search from "./pages/Search";

const qs = require('querystring');
const uuid = require('uuid/v4');

const routes = [{
  path: '/',
  exact: true,
  render: props => {
    return (
      <ComponentLoader load-page={'main'}/>
    );
  },
}, {
  path: '/profileEditor/:id?',
  render: props => {
    const id = props.match.params.id;
    return (
      <ComponentLoader load-page={'profile-editor'} id={id}/>
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
      <Search key={`unic-${Date.now()}`} query={query.query}/>
    );
  },
}, {
  path: '/history',
  render: props => {
    return (
      <ComponentLoader load-page={'history'}/>
    );
  },
}, {
  path: '/options/:page?',
  render: props => {
    const page = props.match.params.page;
    if (!page) {
      return (
        <Redirect to={'/options/main'}/>
      );
    }
    return (
      <ComponentLoader load-page={'options'} page={page}/>
    );
  },
}, {
  path: '/editor/:type/:id?',
  render: props => {
    const type = props.match.params.type;
    const id = props.match.params.id;
    if (!id) {
      return (
        <Redirect to={`/editor/${type}/${uuid()}`}/>
      );
    }
    return (
      <ComponentLoader load-page={'editor'} type={type} id={id}/>
    );
  },
}, {
  path: '/codeMaker/:page?',
  render: props => {
    const page = props.match.params.page;
    if (!page) {
      return (
        <Redirect to={'/codeMaker/search'}/>
      );
    }
    return (
      <ComponentLoader load-page={'codeMaker'} page={page}/>
    );
  },
}, {
  path: null,
  render: props => {
    return (
      <NotFound/>
    );
  },
}];

export default routes;