import React from "react";
import {inject, observer} from "mobx-react";
import PropTypes from "prop-types";
import RootStore from "../stores/RootStore";
import ProfilesItemStore from "../stores/ProfilesItemStore";
import ProfileTracker from "./ProfileTracker";
import SearchStore from "../stores/SearchStore";


@inject('rootStore')
@observer
class Profile extends React.Component {
  componentDidMount() {
    if (!this.props.rootStore.profile || this.props.rootStore.profile.id !== this.props.profileItem.id) {
      this.props.rootStore.setProfile(this.props.profileItem);
    }
  }

  render() {
    const profile = this.props.rootStore.profile;
    if (!profile) {
      return ('Prepare...');
    }

    const trackers = [];
    profile.trackers.forEach(profileTracker => {
      let trackerSearchSession = null;
      if (this.props.searchStore) {
        trackerSearchSession = this.props.searchStore.trackerSessions.get(profileTracker.id);
      }
      trackers.push(
        <ProfileTracker key={profileTracker.id} id={profileTracker.id} profileTracker={profileTracker} profile={profile} trackerSearchSession={trackerSearchSession}/>
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
  rootStore: PropTypes.instanceOf(RootStore),
  searchStore: PropTypes.instanceOf(SearchStore),
};

export default Profile;