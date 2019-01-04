import {inject, observer} from "mobx-react";
import React from "react";
import getTrackerIconClassName from "../tools/getTrackerIconClassName";
import blankSvg from "../assets/img/blank.svg";
import PropTypes from "prop-types";

@inject('rootStore')
@observer
class ProfileTracker extends React.Component {
  static propTypes = {
    rootStore: PropTypes.object,
    id: PropTypes.string,
    profileTrackerStore: PropTypes.object,
  };

  componentDidMount() {
    if (this.props.profileTrackerStore.tracker) {
      this.props.profileTrackerStore.tracker.attach();
    }
  }

  componentWillUnmount() {
    if (this.props.profileTrackerStore.tracker) {
      this.props.profileTrackerStore.tracker.deattach();
    }
  }

  get searchStore() {
    const searches = this.props.rootStore.searches;
    const len = searches.length;
    if (len) {
      return searches[len - 1];
    }
  }

  get trackerSearchStore() {
    const searchStore = this.searchStore;
    if (searchStore) {
      return searchStore.trackerSearch.get(this.props.id);
    }
  }

  handleClick = (e) => {
    e.preventDefault();

    const wasSelected = this.props.rootStore.profiles.isSelectedTracker(this.props.id);
    this.props.rootStore.profiles.clearSelectedTrackers();
    if (!wasSelected) {
      this.props.rootStore.profiles.addSelectedTracker(this.props.id);
    }
  };

  render() {
    const tracker = this.props.profileTrackerStore.tracker;
    if (!tracker) {
      return (
        <div className="tracker">
          Not found
        </div>
      );
    }

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
    if (this.props.rootStore.profiles.isSelectedTracker(this.props.id)) {
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