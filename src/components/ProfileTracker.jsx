import {inject, observer} from "mobx-react";
import React from "react";
import getTrackerIconClassName from "../tools/getTrackerIconClassName";
import blankSvg from "../assets/img/blank.svg";
import PropTypes from "prop-types";
import RootStore from "../stores/RootStore";
import {ProfileItemTrackerStore} from "../stores/ProfileStore";
import ProfileStore from "../stores/ProfileStore";


@inject('rootStore')
@observer
class ProfileTracker extends React.Component {
  constructor(props) {
    super();

    this.handleClick = this.handleClick.bind(this);

    const id = props.profileItemTracker.id;
    let tracker = props.rootStore.trackers.get(id);
    if (!tracker) {
      tracker = props.rootStore.initTracker(id);
    }
    this.tracker = tracker;
  }

  componentDidMount() {
    this.tracker.attach();
  }

  componentWillUnmount() {
    this.tracker.deattach();
    this.tracker = null;
  }

  handleClick(e) {
    e.preventDefault();

    const selected = !this.props.profileItemTracker.selected;
    this.props.profile.setSelectedAll(false);
    this.props.profileItemTracker.setSelected(selected);
  }

  render() {
    switch (this.tracker && this.tracker.state) {
      case 'pending': {
        return (
          <div className="tracker">
            Loading...
          </div>
        );
      }
      case 'error': {
        return (
          <div className="tracker">
            Error
          </div>
        );
      }
      case 'done': {
        const iconClassList = ['tracker__icon'];

        iconClassList.push(getTrackerIconClassName(this.tracker.id));

        if (false && 'isSearch') {
          iconClassList.push('tracker__icon-loading');
        } else
        if (false && 'isError') {
          iconClassList.push('tracker__icon-error');
        }

        let icon = null;
        if (this.tracker.meta.trackerURL) {
          iconClassList.push('tracker__link');
          icon = (
            <a className={iconClassList.join(' ')} target="_blank" href={this.tracker.meta.trackerURL}/>
          );
        } else {
          icon = (
            <div className={iconClassList.join(' ')}/>
          );
        }

        let searchState = null;
        if (false && 'authRequired') {
          searchState = (
            <a className="tracker__login" target="_blank" href={trackerSearch.authRequired.url}
               title={chrome.i18n.getMessage('login')}/>
          );
        } else {
          let count = 0;
          let visibleCount = 0;
          if (false && 'have some searches') {
            count = store.searchFrag.getTrackerResultCount(trackerSearch);
            visibleCount = store.searchFrag.getTrackerVisibleResultCount(trackerSearch);
          }

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

        const iconUrl = this.tracker.getIconUrl() || blankSvg;

        const classList = ['tracker'];
        if (this.props.profileItemTracker.selected) {
          classList.push('tracker-selected');
        }

        return (
          <div className={classList.join(' ')}>
            {icon}
            <a className="tracker__name" href={'#' + this.tracker.id}
               onClick={this.handleClick}>{this.tracker.meta.name}</a>
            {searchState}
            <style>{`.${getTrackerIconClassName(this.tracker.id)}{background-image:url(${iconUrl})}`}</style>
          </div>
        );
      }
      default: {
        return (
          <div className="tracker">
            Idle
          </div>
        );
      }
    }
  }
}

ProfileTracker.propTypes = null && {
  rootStore: PropTypes.instanceOf(RootStore),
  profile: PropTypes.instanceOf(ProfileStore),
  profileItemTracker: PropTypes.instanceOf(ProfileItemTrackerStore),
};

export default ProfileTracker;