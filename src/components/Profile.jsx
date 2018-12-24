import React from "react";
import {inject, observer} from "mobx-react";
import PropTypes from "prop-types";
import ProfileTracker from "./ProfileTracker";


@inject('rootStore')
@observer
class Profile extends React.Component {
  static propTypes = {
    id: PropTypes.string,
    rootStore: PropTypes.object,
    profileStore: PropTypes.object,
    searchStore: PropTypes.object,
  };

  constructor(props) {
    super(props);

    if (this.trackersStore.state === 'idle') {
      this.trackersStore.fetchTrackers();
    }
  }

  get trackersStore() {
    return this.props.rootStore.trackers;
  }

  get profileStore() {
    return this.props.profileStore;
  }

  get searchStore() {
    return this.props.searchStore;
  }

  render() {
    if (this.trackersStore.state !== 'done') {
      return (`Loading trackers: ${this.trackersStore.state}`);
    }

    const trackers = [];
    this.profileStore.trackers.forEach(profileTracker => {
      let trackerSearchSession = null;
      if (this.searchStore) {
        trackerSearchSession = this.searchStore.trackerSessions.get(profileTracker.id);
      }
      trackers.push(
        <ProfileTracker key={profileTracker.id} id={profileTracker.id} profileTrackerStore={profileTracker} trackerSearchSession={trackerSearchSession}/>
      );
    });

    return (
      <div className="tracker__list">
        {trackers}
      </div>
    );
  }
}

export default Profile;