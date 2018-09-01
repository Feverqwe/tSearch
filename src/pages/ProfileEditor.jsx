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
        page = (
          <ProfileEditorPage {...this.props}/>
        );
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


@inject('rootStore')
@observer
class ProfileEditorPage extends React.Component {
  componentDidMount() {
    if (!this.props.rootStore.profileEditor) {
      this.props.rootStore.createProfileEditor();
    }
  }

  componentWillUnmount() {
    this.props.rootStore.destroyProfileEditor();
  }

  render() {
    if (!this.props.rootStore.profileEditor) {
      return ('Loading...');
    }

    if (this.props.id) {
      return (
        <EditProfile key={this.props.id} id={this.props.id}/>
      );
    } else {
      return (
        <EditProfiles history={this.props.history}/>
      );
    }
  }
}

ProfileEditorPage.propTypes = null && {
  rootStore: PropTypes.instanceOf(RootStore),
  id: PropTypes.string,
};

export default ProfileEditor;