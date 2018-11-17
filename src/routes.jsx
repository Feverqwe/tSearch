import React from 'react';
import NotFound from "./pages/NotFound";
import {Redirect} from "react-router-dom";
import ComponentLoader from "./components/ComponentLoader";

const qs = require('querystring');
const uuid = require('uuid/v4');

const routes = [{
  path: '/',
  exact: true,
  render: props => {
    return (
      <ComponentLoader {...props} load-page={'main'}/>
    );
  },
}, {
  path: '/profileEditor/:id?',
  render: props => {
    const id = props.match.params.id;
    if (id === 'new') {
      return (
        <Redirect to={`/profileEditor/${uuid()}`}/>
      );
    }
    return (
      <ComponentLoader {...props} load-page={'profile-editor'} id={id}/>
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
      <ComponentLoader key={query.query} {...props} load-page={'search'} query={query.query}/>
    );
  },
}, {
  path: '/history',
  render: props => {
    return (
      <ComponentLoader {...props} load-page={'history'}/>
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
      <ComponentLoader {...props} load-page={'options'} page={page}/>
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
      <ComponentLoader {...props} load-page={'editor'} type={type} id={id}/>
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
      <ComponentLoader {...props} load-page={'codeMaker'} page={page}/>
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