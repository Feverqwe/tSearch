import React from 'react';
import Header from "../components/Header";
import Profiles from "../components/Profiles";
import ScrollTop from "../components/ScrollTop";
import Filters from "../components/Filters";
import Explorer from "../components/Explorer/Explorer";

class Main extends React.Component {
  render() {
    return (
      <div className="page-ctr">
        <Header {...this.props}/>
        <div className="content content-row">
          <div className="parameter_box">
            <Profiles/>
            <Filters/>
          </div>
          <div className="main">
            <Explorer/>
          </div>
        </div>
        <ScrollTop/>
      </div>
    );
  }
}

export default Main;