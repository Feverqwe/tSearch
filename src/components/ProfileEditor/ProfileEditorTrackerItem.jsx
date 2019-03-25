import {inject, observer} from "mobx-react";
import React from "react";
import PropTypes from "prop-types";
import blankSvg from "../../assets/img/blank.svg";
import {Link} from "react-router-dom";
import getLogger from "../../tools/getLogger";

const logger = getLogger('ProfileEditorTrackerItem');


@inject('rootStore')
@observer
class ProfileEditorTrackerItem extends React.Component {
  static propTypes = {
    rootStore: PropTypes.object,
    profileEditorProfileStore: PropTypes.object.isRequired,
    trackerStore: PropTypes.object.isRequired,
    showOptions: PropTypes.bool.isRequired,
    checked: PropTypes.bool.isRequired,
  };

  /**@return RootStore*/
  get rootStore() {
    return this.props.rootStore;
  }

  /**@return TrackersStore*/
  get trackersStore() {
    return this.rootStore.trackers;
  }

  /**@return ProfileEditorProfileStore*/
  get profileEditorProfileStore() {
    return this.props.profileEditorProfileStore;
  }

  /**@return {ProfileEditorProfileTrackerStore|TrackerStore}*/
  get trackerStore() {
    return this.props.trackerStore;
  }

  /**@return ProfileEditorProfileTrackerStore*/
  get profileTrackerStore() {
    return this.props.profileEditorProfileStore.getProfileTracker(this.trackerStore.id);
  }

  handleChecked = () => {
    if (this.checkbox.checked) {
      this.profileEditorProfileStore.addTracker(this.trackerStore.id);
    } else {
      this.profileEditorProfileStore.removeTracker(this.trackerStore.id);
    }
  };

  handleClick = (e) => {
    e.preventDefault();
    this.checkbox.checked = !this.checkbox.checked;
    this.handleChecked();
  };

  handleRemove = (e) => {
    e.preventDefault();
    this.trackersStore.deleteTracker(this.trackerStore.id);
    this.trackersStore.saveTrackers();
  };

  checkbox = null;
  refCheckbox = (element) => {
    this.checkbox = element;
  };

  handleUpdate = (e) => {
    e.preventDefault();
    this.trackerStore.update();
  };

  stopPropagation = (e) => {
    e.stopPropagation();
  };

  handleProxyChange = (e) => {
    this.profileTrackerStore.options.setEnableProxy(this.enableProxy.checked);
  };

  enableProxy = null;
  refEnableProxy = (element) => {
    this.enableProxy = element;
  };

  render() {
    const tracker = this.trackerStore;
    const checked = this.props.checked;

    const classList = ['item'];
    if (checked) {
      classList.push('item__selected');
    }

    let updateBtn = null;
    let supportBtn = null;
    let homepageBtn = null;
    let deleteBtn = null;
    let author = null;

    let icon = tracker.getIconUrl() || blankSvg;

    const name = tracker.meta.name || tracker.id;

    let version = tracker.meta.version;
    if (tracker.updateState === 'pending') {
      version = '...';
    }

    if (tracker.meta.supportURL) {
      supportBtn = (
        <a href={tracker.meta.supportURL} className="item__button button-support" target="_blank"/>
      );
    }

    if (tracker.meta.updateURL || tracker.meta.downloadURL) {
      updateBtn = (
        <a onClick={this.handleUpdate} className="item__button button-update" href="#update"
           title={chrome.i18n.getMessage('update')}/>
      );
    }

    if (tracker.meta.homepageURL) {
      homepageBtn = (
        <a href={tracker.meta.homepageURL} className="item__button button-home" target="_blank"/>
      );
    }

    if (tracker.meta.author) {
      author = (
        <div className="item__cell item__author">{tracker.meta.author}</div>
      );
    }

    if (!tracker.isEditorProfileTrackerStore) {
      deleteBtn = (
        <a onClick={this.handleRemove} className="item__button button-remove" href="#remove"
           title={chrome.i18n.getMessage('delete')}/>
      );
    }

    const optionList = [];
    if (this.props.showOptions) {
      if (checked && this.profileTrackerStore) {
        optionList.push(
          <div key={'enableProxy'} className="option__item">
            <label>
              <input ref={this.refEnableProxy} defaultChecked={this.profileTrackerStore.options.enableProxy} onChange={this.handleProxyChange} type="checkbox"/>
              <span>{chrome.i18n.getMessage('enableProxy')}</span>
            </label>
          </div>
        );
      }
    }

    let options = null;
    if (optionList.length) {
      options = (
        <div onClick={this.stopPropagation} className="options">
          {optionList}
        </div>
      );
    }

    return (
      <div className={classList.join(' ')} data-id={tracker.id}>
        <div className="item__cell item__move"/>
        <div className="item__cell item__checkbox">
          <input ref={this.refCheckbox} onChange={this.handleChecked} type="checkbox" defaultChecked={checked}/>
        </div>
        <div className="item__cell item__icon">
          <img src={icon} alt=""/>
        </div>
        <div onClick={this.handleClick} className="item__cell item__name">{name}</div>
        <div onClick={this.handleClick} className="item__cell item__desc">
          <div className="desc">{tracker.meta.description || null}</div>
          {options}
        </div>
        <div className="item__cell item__version">{version}</div>
        {author}
        <div className="item__cell item__actions">
          {updateBtn}
          {supportBtn}
          {homepageBtn}
          <Link to={`/editor/tracker/${tracker.id}`} className="item__cell item__button button-edit" target="_blank"
                title={chrome.i18n.getMessage('edit')}/>
          {deleteBtn}
        </div>
      </div>
    );
  }
}

export default ProfileEditorTrackerItem;