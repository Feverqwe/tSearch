import React from "react";
import {inject, observer} from "mobx-react";
import PropTypes from "prop-types";
import ProfileTracker from "./ProfileTracker";
import {ResizableBox} from "react-resizable";


@inject('rootStore')
@observer
class Profile extends React.Component {
  static propTypes = {
    id: PropTypes.string,
    rootStore: PropTypes.object,
    profileStore: PropTypes.object,
  };

  constructor(props) {
    super(props);

    let trackerListHeight = this.optionsStore.options.trackerListHeight;
    if (trackerListHeight < 56) {
      trackerListHeight = 56;
    }
    this.state = {
      trackerListHeight: trackerListHeight,
    };

    if (this.trackersStore.state === 'idle') {
      this.trackersStore.fetchTrackers();
    }
  }

  /**@return RootStore*/
  get rootStore() {
    return this.props.rootStore;
  }

  /**@return OptionsStore*/
  get optionsStore() {
    return this.rootStore.options;
  }

  get trackersStore() {
    return this.rootStore.trackers;
  }

  get profileStore() {
    return this.props.profileStore;
  }

  handleResizeStop = (e, {size: {height}}) => {
    this.state.trackerListHeight = height;
    this.optionsStore.options.setValue('trackerListHeight', height);
    this.optionsStore.save();
  };

  render() {
    if (this.trackersStore.state !== 'done') {
      return (`Loading trackers: ${this.trackersStore.state}`);
    }

    const trackers = [];
    this.profileStore.trackers.forEach(profileTracker => {
      trackers.push(
        <ProfileTracker key={profileTracker.id} id={profileTracker.id} profileTrackerStore={profileTracker}/>
      );
    });

    return (
      <ResizableBox onResizeStop={this.handleResizeStop} width={Infinity} height={this.state.trackerListHeight} axis={'y'} minConstraints={[0, 56]}>
        <div className="tracker__list">
          {trackers}
        </div>
      </ResizableBox>
    );
  }
}

export default Profile;