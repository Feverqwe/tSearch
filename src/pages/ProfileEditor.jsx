import React from 'react';
import Header from "../components/Header";
import Profiles from "../components/Profiles";
import ScrollTop from "../components/ScrollTop";
import Filters from "../components/Filters";
import {inject, observer} from "mobx-react";
import PropTypes from "prop-types";
import ProfileEditorProfiles from "../components/ProfileEditorProfiles";
import ProfileEditorProfile from "../components/ProfileEditorProfile";
import getLogger from "../tools/getLogger";
import getTitle from "../tools/getTitle";
import {Redirect} from "react-router-dom";

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

  /**@return RootStore*/
  get rootStore() {
    return this.props.rootStore;
  }

  /**@return ProfilesStore*/
  get profilesStore() {
    return this.rootStore.profiles;
  }

  /**@return TrackersStore*/
  get trackersStore() {
    return this.rootStore.trackers;
  }

  render() {
    const profilesStore = this.profilesStore;
    const trackersStore = this.trackersStore;

    if (profilesStore.state !== 'done') {
      return (`Loading profiles: ${profilesStore.state}`);
    }
    if (trackersStore.state !== 'done') {
      return (`Loading trackers: ${trackersStore.state}`);
    }

    return (
      <div className="page-ctr profile-editor">
        <Header/>
        <div className="content content-row">
          <div className="parameter_box">
            <Profiles/>
            <Filters/>
          </div>
          <div className="main">
            <ProfileEditorPage id={this.props.id}/>
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

    if (!this.profileEditorStore) {
      this.rootStore.createProfileEditor();
    }
  }

  /**@return RootStore*/
  get rootStore() {
    return this.props.rootStore;
  }

  /**@return ProfileEditorStore*/
  get profileEditorStore() {
    return this.rootStore.profileEditor;
  }

  componentWillUnmount() {
    this.rootStore.destroyProfileEditor();
  }

  render() {
    const profile = this.profileEditorStore.getProfileById(this.props.id);

    if (profile) {
      return (
        <ProfileEditorProfile profileEditorStore={this.profileEditorStore} profileEditorProfileStore={profile}/>
      );
    } else
    if (this.props.id) {
      return (
        <Redirect to={`/profileEditor`}/>
      );
    } else {
      return (
        <ProfileEditorProfiles profileEditorStore={this.profileEditorStore}/>
      );
    }
  }
}

export default ProfileEditor;