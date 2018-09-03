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
    if (!this.props.rootStore.profile || this.props.rootStore.profile.id !== this.props.id) {
      this.props.rootStore.setProfile(this.props.id);
    }
  }

  render() {
    const profileStore = this.props.rootStore.profile;
    if (!profileStore) {
      return ('Prepare...');
    }

    const profile = profileStore.profile;
    if (!profile) {
      return ('Not found');
    }

    const trackers = [];
    profile.trackers.forEach(profileTracker => {
      let trackerSearchSession = null;
      if (this.props.searchStore) {
        trackerSearchSession = this.props.searchStore.trackerSessions.get(profileTracker.id);
      }
      trackers.push(
        <ProfileTracker key={profileTracker.id} id={profileTracker.id} profileTracker={profileTracker} profileStore={profileStore} trackerSearchSession={trackerSearchSession}/>
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
  id: PropTypes.string,
  rootStore: PropTypes.instanceOf(RootStore),
  searchStore: PropTypes.instanceOf(SearchStore),
};

export default Profile;