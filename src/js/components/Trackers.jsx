import React from "react";
import {observer} from "mobx-react/index";
import blankSvg from '../../img/blank.svg';
import getTrackerIconClassName from "../tools/getTrackerIconClassName";


@observer class Trackers extends React.Component {
  render() {
    /**@type {IndexM}*/
    const store = this.props.store;
    const trackers = [];
    store.profile.trackers.forEach(profileTracker => {
      trackers.push(
        <ProfileTracker key={profileTracker.id} profileTracker={profileTracker} store={store}/>
      );
    });
    return (
      <div className="tracker__list">
        {trackers}
      </div>
    );
  }
}

@observer class ProfileTracker extends React.Component {
  constructor() {
    super();

    this.handleClick = this.handleClick.bind(this);
  }
  handleClick(e) {
    e.preventDefault();

    /**@type {IndexM}*/
    const store = this.props.store;
    /**@type {ProfileTrackerM}*/
    const profileTracker = this.props.profileTracker;
    store.profile.selectTracker(profileTracker.id);
  }
  render() {
    /**@type {IndexM}*/
    const store = this.props.store;
    /**@type {ProfileTrackerM}*/
    const profileTracker = this.props.profileTracker;
    const tracker = profileTracker.trackerModule;

    let icon = null;
    const iconClassList = [];

    const trackerSearch = store.searchFrag && store.searchFrag.getSearchTrackerByTracker(tracker);
    if (trackerSearch) {
      if (trackerSearch.readyState === 'loading') {
        iconClassList.push('tracker__icon-loading');
      } else if (trackerSearch.readyState === 'error') {
        iconClassList.push('tracker__icon-error');
      }
    }

    if (tracker.meta.trackerURL) {
      const classList = iconClassList.concat(['tracker__icon', getTrackerIconClassName(tracker.id), 'tracker__link']);
      icon = (
        <a className={classList.join(' ')} target="_blank" href={tracker.meta.trackerURL}/>
      );
    } else {
      const classList = iconClassList.concat(['tracker__icon', getTrackerIconClassName(tracker.id)]);
      icon = (
        <div className={classList.join(' ')}/>
      );
    }

    let extraInfo = null;
    if (trackerSearch && trackerSearch.authRequired) {
      extraInfo = (
        <a className="tracker__login" target="_blank" href={trackerSearch.authRequired.url}
           title={chrome.i18n.getMessage('login')}/>
      );
    } else {
      let count = 0;
      let visibleCount = 0;
      if (trackerSearch) {
        count = store.searchFrag.getTrackerResultCount(trackerSearch);
        visibleCount = store.searchFrag.getTrackerVisibleResultCount(trackerSearch);
      }

      let text = '';
      if (count === visibleCount) {
        text = count;
      } else {
        text = visibleCount + '/' + count;
      }
      extraInfo = (
        <div className="tracker__counter">{text}</div>
      )
    }

    let iconUrl = null;
    if (tracker.isLoaded()) {
      iconUrl = JSON.stringify(tracker.getIconUrl());
    }
    if (!iconUrl) {
      iconUrl = blankSvg;
    }

    const classList = ['tracker'];
    if (profileTracker.selected) {
      classList.push('tracker-selected');
    }
    return (
      <div className={classList.join(' ')}>
        {icon}
        <a className="tracker__name" href={'#' + tracker.id}
           onClick={this.handleClick}>{tracker.meta.name}</a>
        {extraInfo}
        <style>{`.${getTrackerIconClassName(tracker.id)}{background-image:url(${iconUrl})}`}</style>
      </div>
    );
  }
}

export default Trackers;