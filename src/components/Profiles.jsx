import React from "react";
import {inject, observer} from "mobx-react/index";
import PropTypes from "prop-types";
import RootStore from "../stores/RootStore";
import Profile from "./Profile";
import SearchStore from "../stores/SearchStore";
import {Link} from "react-router-dom";

@inject('rootStore')
@observer
class Profiles extends React.Component {
  static propTypes = null && {
    rootStore: PropTypes.instanceOf(RootStore),
    searchStore: PropTypes.instanceOf(SearchStore),
  };

  constructor(props) {
    super(props);

    this.select = null;

    if (this.props.rootStore.profiles.state === 'idle') {
      this.props.rootStore.profiles.fetchProfiles();
    }
    if (this.props.rootStore.trackers.state === 'idle') {
      this.props.rootStore.trackers.fetchTrackers();
    }
  }

  handleSelect = () => {
    const rootStore = this.props.rootStore;
    const id = this.select.value;
    rootStore.profiles.setProfileId(id);
    rootStore.profiles.saveProfile();
  };

  refSelect = (element) => {
    this.select = element;
  };

  render() {
    const rootStore = this.props.rootStore;
    const profilesStore = rootStore.profiles;
    const trackersStore = rootStore.trackers;

    if (profilesStore.state !== 'done') {
      return (`Loading profiles: ${profilesStore.state}`);
    }
    if (trackersStore.state !== 'done') {
      return (`Loading trackers: ${trackersStore.state}`);
    }

    const options = [];

    const profileStore = profilesStore.profile;
    profilesStore.profiles.forEach(profile => {
      options.push(
        <option key={profile.id} value={profile.id}>{profile.name}</option>
      );
    });

    return (
      <div className="parameter_box__left">
        <div className="parameter parameter-profile">
          <div className="profile_box">
            <select ref={this.refSelect} className="profile__select" value={profileStore.id} onChange={this.handleSelect}>
              {options}
            </select>
            <Link to="/profileEditor" title={chrome.i18n.getMessage('manageProfiles')}
                  className="button-manage-profile"/>
          </div>
        </div>
        <div className="parameter parameter-tracker">
          <Profile key={profileStore.id} profileStore={profileStore} searchStore={this.props.searchStore}/>
        </div>
      </div>
    );
  }
}

export default Profiles;