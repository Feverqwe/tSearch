import React from 'react';
import Header from "../components/Header";

class Editor extends React.Component {
  render() {
    return (
      <div className="page-ctr">
        <Header {...this.props}/>
        <div className="content content-row">
          <div className="main">
            Editor...
          </div>
        </div>
      </div>
    );
  }
}

export default Editor;