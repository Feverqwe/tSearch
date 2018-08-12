import React from 'react';
import Main from "./pages/Main";

const routes = [{
  path: '/',
  exact: true,
  render: props => {
    return (
      <Main {...props}/>
    );
  },
}];

export default routes;