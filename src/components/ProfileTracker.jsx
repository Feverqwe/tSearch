import {inject, observer} from "mobx-react";
import React from "react";
import getTrackerIconClassName from "../tools/getTrackerIconClassName";
import blankSvg from "../assets/img/blank.svg";
import PropTypes from "prop-types";

@observer
class ProfileTracker extends React.Component {
  static propTypes = {
    profileTrackerStore: PropTypes.object.isRequired,
  };

  /**@return ProfileTrackerStore*/
  get profileTrackerStore() {
    return this.props.profileTrackerStore;
  }

  /**@return TrackerStore*/
  get trackerStore() {
    return this.profileTrackerStore.tracker;
  }

  render() {
    if (!this.trackerStore) {
      const name = this.profileTrackerStore.meta.name || 'Not found';
      return (
        <div className="tracker">
          <div className="tracker__icon tracker__icon-error"/>
          {name}
        </div>
      );
    }

    return (
      <Tracker id={this.trackerStore.id} profileTrackerStore={this.profileTrackerStore}
               trackerStore={this.trackerStore}/>
    );
  }
}

@inject('rootStore')
@observer
class Tracker extends React.Component {
  static propTypes = {
    rootStore: PropTypes.object,
    trackerStore: PropTypes.object.isRequired,
    profileTrackerStore: PropTypes.object.isRequired,
  };

  /**@return RootStore*/
  get rootStore() {
    return this.props.rootStore;
  }

  /**@return ProfileTrackerStore*/
  get profileTrackerStore() {
    return this.props.profileTrackerStore;
  }

  /**@return TrackerStore*/
  get trackerStore() {
    return this.props.trackerStore;
  }

  /**@return SearchStore*/
  get searchStore() {
    const searches = this.rootStore.searches;
    const len = searches.length;
    if (len) {
      return searches[len - 1];
    }
  }

  /**@return TrackerSearchStore*/
  get trackerSearchStore() {
    const searchStore = this.searchStore;
    if (searchStore) {
      return searchStore.trackerSearch.get(this.trackerStore.id);
    }
  }

  componentDidMount() {
    this.trackerStore.attach();
    this.trackerStore.setProfileOptions(this.profileTrackerStore.options);
  }

  componentWillUnmount() {
    this.trackerStore.deattach();
  }

  handleClick = (e) => {
    e.preventDefault();

    const wasSelected = this.rootStore.profiles.isSelectedTracker(this.trackerStore.id);
    this.rootStore.profiles.clearSelectedTrackers();
    if (!wasSelected) {
      this.rootStore.profiles.addSelectedTracker(this.trackerStore.id);
    }
  };

  render() {
    const tracker = this.trackerStore;

    const iconClassList = ['tracker__icon'];

    iconClassList.push(getTrackerIconClassName(tracker.id));

    const trackerSearchStore = this.trackerSearchStore;
    if (trackerSearchStore) {
      if (trackerSearchStore.state === 'pending') {
        iconClassList.push('tracker__icon-loading');
      } else
      if (!trackerSearchStore.authRequired && trackerSearchStore.state === 'error') {
        iconClassList.push('tracker__icon-error');
      }
    }

    let icon = null;
    if (tracker.meta.trackerURL) {
      iconClassList.push('tracker__link');
      icon = (
        <a className={iconClassList.join(' ')} target="_blank" href={tracker.meta.trackerURL}/>
      );
    } else {
      icon = (
        <div className={iconClassList.join(' ')}/>
      );
    }

    let searchState = null;
    if (trackerSearchStore) {
      if (trackerSearchStore.authRequired) {
        searchState = (
          <a className="tracker__login" target="_blank" href={trackerSearchStore.authRequired.url}
             title={chrome.i18n.getMessage('login')}/>
        );
      } else {
        const count = this.searchStore.getResultCountByTrackerId(tracker.id);
        const visibleCount = this.searchStore.getVisibleResultCountByTrackerId(tracker.id);

        let text = '';
        if (count === visibleCount) {
          text = count;
        } else {
          text = visibleCount + '/' + count;
        }
        searchState = (
          <div className="tracker__counter">{text}</div>
        )
      }
    }

    const iconUrl = tracker.getIconUrl() || blankSvg;

    const classList = ['tracker'];
    if (this.rootStore.profiles.isSelectedTracker(tracker.id)) {
      classList.push('tracker-selected');
    }

    return (
      <div className={classList.join(' ')}>
        {icon}
        <a className="tracker__name" href={'#' + tracker.id}
           onClick={this.handleClick}>{tracker.meta.name}</a>
        {searchState}
        <style>{`.${getTrackerIconClassName(tracker.id)}{background-image:url(${iconUrl})}`}</style>
      </div>
    );
  }
}

export default ProfileTracker;