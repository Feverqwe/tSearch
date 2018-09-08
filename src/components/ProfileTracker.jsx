import {inject, observer} from "mobx-react";
import React from "react";
import getTrackerIconClassName from "../tools/getTrackerIconClassName";
import blankSvg from "../assets/img/blank.svg";
import PropTypes from "prop-types";
import RootStore from "../stores/RootStore";
import {ProfileTrackerStore} from "../stores/ProfileStore";
import {TrackerSessionStore} from '../stores/SearchStore';

@inject('rootStore')
@observer
class ProfileTracker extends React.Component {
  constructor(props) {
    super(props);

    this.handleClick = this.handleClick.bind(this);
  }

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

  handleClick(e) {
    e.preventDefault();

    const wasSelected = this.props.rootStore.profiles.isSelectedTracker(this.props.id);
    this.props.rootStore.profiles.clearSelectedTrackers();
    if (!wasSelected) {
      this.props.rootStore.profiles.addSelectedTracker(this.props.id);
    }
  }

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

    const searchSession = this.props.trackerSearchSession;
    if (searchSession) {
      if (searchSession.state === 'pending') {
        iconClassList.push('tracker__icon-loading');
      } else
      if (searchSession.state === 'error') {
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
    if (searchSession) {
      if (searchSession.authRequired) {
        searchState = (
          <a className="tracker__login" target="_blank" href={searchSession.authRequired.url}
             title={chrome.i18n.getMessage('login')}/>
        );
      } else {
        const count = searchSession.search.getResultCountByTrackerId(tracker.id);
        const visibleCount = searchSession.search.getVisibleResultCountByTrackerId(tracker.id);

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

ProfileTracker.propTypes = null && {
  rootStore: PropTypes.instanceOf(RootStore),
  id: PropTypes.string,
  profileTrackerStore: PropTypes.instanceOf(ProfileTrackerStore),
  trackerSearchSession: PropTypes.instanceOf(TrackerSessionStore),
};

export default ProfileTracker;