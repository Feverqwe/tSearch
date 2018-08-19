import React from 'react';
import Header from "../components/Header";
import Profiles from "../components/Profiles";
import ScrollTop from "../components/ScrollTop";

class Main extends React.Component {
  render() {
    return (
      <div>
        <Header {...this.props}/>
        <div className="content content-row">
          <div className="parameter_box">
            <Profiles/>
          </div>
          <div className="main">
            Main...
          </div>
        </div>
        <ScrollTop/>
      </div>
    );
  }
}

export default Main;