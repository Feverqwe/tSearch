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
  constructor(props) {
    super(props);

    this.state = {
      searchStore: props.searchStore
    };

    if (!props.rootStore.profile || props.rootStore.profile.id !== props.profileItem.id) {
      props.rootStore.setProfile(props.profileItem);
    }
    this.profile = props.rootStore.profile;
  }

  static getDerivedStateFromProps(props, state) {
    if (props.searchStore !== state.searchStore) {
      return {
        searchStore: props.searchStore
      };
    }
    return null;
  }

  render() {
    if (!this.profile) {
      return ('Prepare...');
    }

    const trackers = [];
    this.profile.trackers.forEach(profileItemTracker => {
      let trackerSearchSession = null;
      if (this.props.searchStore) {
        trackerSearchSession = this.props.searchStore.trackerSessions.get(profileItemTracker.id);
      }
      trackers.push(
        <ProfileTracker key={profileItemTracker.id} profileItemTracker={profileItemTracker} profile={this.profile} trackerSearchSession={trackerSearchSession}/>
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