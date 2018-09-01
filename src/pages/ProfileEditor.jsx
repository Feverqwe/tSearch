import React from 'react';
import Header from "../components/Header";
import Profiles from "../components/Profiles";
import ScrollTop from "../components/ScrollTop";
import Filters from "../components/Filters";
import {inject, observer} from "mobx-react";
import PropTypes from "prop-types";
import RootStore from "../stores/RootStore";
import EditProfiles from "../components/EditProfiles";
import EditProfile from "../components/EditProfile";


@inject('rootStore')
@observer
class ProfileEditor extends React.Component {
  componentDidMount() {
    if (this.props.rootStore.profiles.state === 'idle') {
      this.props.rootStore.profiles.fetchProfiles();
    }
  }

  render() {
    const rootStore = this.props.rootStore;
    const profilesStore = rootStore.profiles;

    let page = null;
    switch (profilesStore.state) {
      case 'pending': {
        page = ('Loading...');
        break;
      }
      case 'error': {
        page = ('Error');
        break;
      }
      case 'done': {
        if (this.props.id) {
          page = (
            <EditProfile history={this.props.history} id={this.props.id}/>
          );
        } else {
          page = (
            <EditProfiles history={this.props.history}/>
          );
        }
        break;
      }
      default: {
        page = ('Idle');
      }
    }

    return (
      <div>
        <Header {...this.props}/>
        <div className="content content-row">
          <div className="parameter_box">
            <Profiles/>
            <Filters/>
          </div>
          <div className="main">
            {page}
          </div>
        </div>
        <ScrollTop/>
      </div>
    );
  }
}

ProfileEditor.propTypes = null && {
  rootStore: PropTypes.instanceOf(RootStore),
  id: PropTypes.string,
};

export default ProfileEditor;