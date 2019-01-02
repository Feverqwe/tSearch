import React from 'react';
import Header from "../components/Header";

class NotFound extends React.Component {
  render() {
    return (
      <div className="page-ctr">
        <Header/>
        <div className="content content-row">
          <div className="main">
            Not found
          </div>
        </div>
      </div>
    );
  }
}

export default NotFound;