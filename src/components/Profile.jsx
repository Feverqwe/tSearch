import React from "react";
import {inject, observer} from "mobx-react";
import PropTypes from "prop-types";
import RootStore from "../stores/RootStore";
import ProfilesItemStore from "../stores/ProfilesItemStore";
import ProfileTracker from "./ProfileTracker";


@inject('rootStore')
@observer
class Profile extends React.Component {
  constructor(props) {
    super();

    if (!props.rootStore.profile || props.rootStore.profile.id !== props.profileItem.id) {
      props.rootStore.setProfile(props.profileItem);
    }
    this.profile = props.rootStore.profile;
  }

  render() {
    if (!this.profile) {
      return ('Prepare...');
    }

    const trackers = [];
    this.profile.trackers.forEach(profileItemTracker => {
      trackers.push(
        <ProfileTracker key={profileItemTracker.id} profileItemTracker={profileItemTracker} profile={this.profile}/>
      );
    });

    return (
      <div className="tracker__list">
        {trackers}
      </div>
    );
  }
}

Profile.propTypes = null && {
  profileItem: PropTypes.instanceOf(ProfilesItemStore),
  rootStore: PropTypes.instanceOf(RootStore)
};

export default Profile;