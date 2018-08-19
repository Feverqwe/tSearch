import React from "react";
import {inject, observer} from "mobx-react";
import PropTypes from "prop-types";
import RootStore from "../stores/RootStore";
import ProfilesItemStore from "../stores/ProfilesItemStore";
import ProfileTracker from "./ProfileTracker";


@inject('rootStore')
@observer
class Profile extends React.Component {
  componentDidMount() {
    if (!this.props.rootStore.profile || this.props.rootStore.profile.id !== this.props.profileItem.id) {
      this.props.rootStore.setProfile(this.props.profileItem);
    }
  }

  render() {
    const trackers = [];
    this.props.profileItem.trackers.forEach(profileTracker => {
      trackers.push(
        <ProfileTracker key={profileTracker.id} profileItemTracker={profileTracker}/>
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