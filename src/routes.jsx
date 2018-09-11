import React from 'react';
import Main from "./pages/Main";
import Search from "./pages/Search";
import NotFound from "./pages/NotFound";
import {Redirect} from "react-router-dom";
import History from "./pages/History";
import Options from "./pages/Options";
import ProfileEditor from "./pages/ProfileEditor";
import ComponentLoader from "./components/ComponentLoader";

const qs = require('querystring');
const uuid = require('uuid/v4');

const routes = [{
  path: '/',
  exact: true,
  render: props => {
    return (
      <Main {...props}/>
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
      <ProfileEditor {...props} id={id}/>
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
  path: '/options/:section?',
  render: props => {
    const section = props.match.params.section;
    if (!section) {
      return (
        <Redirect to={'/options/main'}/>
      );
    }
    return (
      <Options {...props} section={section}/>
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
      <ComponentLoader {...props} page={'editor'} type={type} id={id}/>
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