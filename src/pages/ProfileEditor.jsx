import React from 'react';
import Header from "../components/Header";
import Profiles from "../components/Profiles";
import ScrollTop from "../components/ScrollTop";
import Filters from "../components/Filters";
import {inject, observer} from "mobx-react";
import PropTypes from "prop-types";
import EditProfiles from "../components/EditProfiles";
import EditProfile from "../components/EditProfile";
import getLogger from "../tools/getLogger";
import getTitle from "../tools/getTitle";

const logger = getLogger('ProfileEditor');


@inject('rootStore')
@observer
class ProfileEditor extends React.Component {
  static propTypes = {
    rootStore: PropTypes.object,
    id: PropTypes.string,
  };

  constructor(props) {
    super(props);

    if (this.props.rootStore.profiles.state === 'idle') {
      this.props.rootStore.profiles.fetchProfiles();
    }
    if (this.props.rootStore.trackers.state === 'idle') {
      this.props.rootStore.trackers.fetchTrackers();
    }
  }

  componentDidMount() {
    document.title = getTitle('Profile editor');
  }

  render() {
    const rootStore = this.props.rootStore;
    const profilesStore = rootStore.profiles;
    const trackersStore = rootStore.trackers;

    if (profilesStore.state !== 'done') {
      return (`Loading profile: ${profilesStore.state}`);
    }
    if (trackersStore.state !== 'done') {
      return (`Loading trackers: ${trackersStore.state}`);
    }

    return (
      <div className="page-ctr">
        <Header {...this.props}/>
        <div className="content content-row">
          <div className="parameter_box">
            <Profiles/>
            <Filters/>
          </div>
          <div className="main">
            <ProfileEditorPage {...this.props}/>
          </div>
        </div>
        <ScrollTop/>
      </div>
    );
  }
}


@inject('rootStore')
@observer
class ProfileEditorPage extends React.Component {
  static propTypes = {
    rootStore: PropTypes.object,
    id: PropTypes.string,
  };

  constructor(props) {
    super(props);

    if (!this.props.rootStore.profileEditor) {
      this.props.rootStore.createProfileEditor();
    }
  }

  componentWillUnmount() {
    this.props.rootStore.destroyProfileEditor();
  }

  render() {
    if (this.props.id) {
      return (
        <EditProfile key={this.props.id} id={this.props.id}/>
      );
    } else {
      return (
        <EditProfiles/>
      );
    }
  }
}

export default ProfileEditor;