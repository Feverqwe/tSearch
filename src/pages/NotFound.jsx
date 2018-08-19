import React from 'react';
import Header from "../components/Header";
import Profiles from "../components/Profiles";
import Filters from "../components/Filters";
import ScrollTop from "../components/ScrollTop";

class NotFound extends React.Component {
  render() {
    return (
      <div>
        <Header {...this.props}/>
        <div className="content content-row">
          <div className="main">
            Not found
          </div>
        </div>
        <ScrollTop/>
      </div>
    );
  }
}

export default NotFound;