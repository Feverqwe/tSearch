import React from "react";
import {observer, inject} from "mobx-react/index";
import PropTypes from "prop-types";
import RootStore from "../stores/RootStore";
import Profile from "./Profile";

@inject('rootStore')
@observer
class Profiles extends React.Component {
  constructor() {
    super();

    this.handleSelect = this.handleSelect.bind(this);
  }

  componentDidMount() {
    if (this.props.rootStore.profiles.state === 'idle') {
      this.props.rootStore.profiles.fetchProfiles();
    }
  }

  handleSelect() {
    const rootStore = this.props.rootStore;
    const value = this.refs.select.value;
    const profile = rootStore.profiles.getProfileById(value);
    rootStore.setProfile(profile);
  }

  render() {
    const rootStore = this.props.rootStore;
    const profilesStore = rootStore.profiles;
    const profileStore = rootStore.profile;

    switch (profilesStore.state) {
      case 'pending': {
        return ('Loading...');
      }
      case 'error': {
        return ('Error');
      }
      case 'done': {
        const options = [];
        let foundActive = false;
        profilesStore.profiles.forEach(profile => {
          if (!foundActive && profile.name === profileStore.name) {
            foundActive = true;
          }
          options.push(
            <option key={profile.name} value={profile.name}>{profile.name}</option>
          );
        });
        if (!foundActive) {
          options.push(
            <option key={profileStore.name} value={profileStore.name}>{profileStore.name}</option>
          );
        }

        let profile = null;
        if (profilesStore.state === 'done') {
          profile = (
            <Profile/>
          );
        }

        return (
          <div className="parameter_box__left">
            <div className="parameter parameter-profile">
              <div className="profile_box">
                <select key={'select'} ref="select" className="profile__select" defaultValue={profileStore.name} onChange={this.handleSelect}>
                  {options}
                </select>
                <a key={'manageBtn'}
                   onClick={this.handleEdit}
                   href="#manageProfiles" title={chrome.i18n.getMessage('manageProfiles')}
                   className="button-manage-profile"/>
              </div>
            </div>
            <div className="parameter parameter-tracker">
              {profile}
            </div>
          </div>
        );
      }
    }
  }
}

Profiles.propTypes = null && {
  rootStore: PropTypes.instanceOf(RootStore)
};

export default Profiles;