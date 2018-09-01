import {inject, observer} from "mobx-react";
import React from "react";
import PropTypes from "prop-types";
import RootStore from "../stores/RootStore";
import {EditProfileItemStore} from '../stores/ProfileEditorStore';
import getLogger from "../tools/getLogger";
import blankSvg from "../assets/img/blank.svg";

const logger = getLogger('EditProfile');


@inject('rootStore')
@observer
class EditProfile extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      filter: 'selected',
      search: ''
    };

    this.handleChangeName = this.handleChangeName.bind(this);
    this.handleSearchChange = this.handleSearchChange.bind(this);
    this.refName = this.refName.bind(this);
    this.refSearch = this.refSearch.bind(this);
    this.refTrackers = this.refTrackers.bind(this);
    this.handleFilterClick = this.handleFilterClick.bind(this);

    this.name = null;
    this.search = null;
    this.trackers = null;
  }
  componentDidMount() {
    this.props.rootStore.profileEditor.setProfileById(this.props.id);
  }
  handleChangeName() {
    const profile = this.props.rootStore.profileEditor.profile;
    profile.setName(this.name.value);
  }
  refName(element) {
    this.name = element;
  }
  handleSearchChange() {
    this.setState({
      search: this.search.value
    });
  }
  refSearch(element) {
    this.search = element;
  }
  refTrackers(element) {
    this.trackers = element;
  }
  handleFilterClick(e, type) {
    e.preventDefault();
    this.setState({
      filter: type
    });
  }
  render() {
    const profile = this.props.rootStore.profileEditor.profile;

    if (!profile) {
      return ('Loading...');
    }

    const filterItems = ['all', 'withoutList', 'selected'].map(type => {
      const isActive = type === this.state.filter;
      return (
        <FilterButton key={`filter-${type}`} isActive={isActive} type={type} profile={profile} onClick={this.handleFilterClick}/>
      );
    });

    const trackers = profile.trackers.map(tracker => {
      const checked = true;
      return (
        <TrackerItem key={`tracker-${tracker.id}`} id={tracker.id} profileItemTracker={tracker} checked={checked}/>
      );
    });

    return (
      <div className="manager">
        <div className="manager__body">
          <div className="manager__sub_header sub_header__profile">
            <div className="profile__input">
              <input ref={this.refName} className="input__input" type="text" defaultValue={profile.name} onChange={this.handleChangeName}/>
            </div>
          </div>
          <div className="manager__sub_header sub_header__filter">
            <div className="filter__box">{filterItems}</div>
            <div className="filter__search">
              <input ref={this.refSearch} className="input__input filter__input" type="text"
                     placeholder={chrome.i18n.getMessage('quickSearch')}
                     onChange={this.handleSearchChange}
              />
            </div>
          </div>
          <div ref={this.refTrackers} className="manager__trackers">
            {trackers}
          </div>
        </div>
        <div className="manager__footer">
          <a href="#save" className="button manager__footer__btn" onClick={this.props.onSave}>{chrome.i18n.getMessage('save')}</a>
          <a href={null} target="_blank" className="button manager__footer__btn">{chrome.i18n.getMessage('add')}</a>
          <a href="#createCode" className="button manager__footer__btn">{chrome.i18n.getMessage('createCode')}</a>
        </div>
      </div>
    );
  }
}

EditProfile.propTypes = null && {
  rootStore: PropTypes.instanceOf(RootStore),
  id: PropTypes.string,
};


@observer
class FilterButton extends React.Component {
  constructor(props) {
    super(props);

    this.handleClick = this.handleClick.bind(this);
  }
  handleClick(e) {
    this.props.onClick(e, this.props.type);
  }
  render() {
    const type = this.props.type;

    const classList = ['filter__item'];
    if (this.props.isActive) {
      classList.push('item__selected');
    }

    const count = this.props.profile.getTrackersByFilter(type).length;

    return (
      <a key={type} className={classList.join(' ')} onClick={this.handleClick} href={'#'}>
        {chrome.i18n.getMessage('filter_' + type)}
        {' '}
        <span className="item__count">{count}</span>
      </a>
    );
  }
}

FilterButton.propTypes = null && {
  type: PropTypes.string,
  isActive: PropTypes.bool,
  profile: PropTypes.instanceOf(EditProfileItemStore),
  onClick: PropTypes.func,
};


@inject('rootStore')
@observer
class TrackerItem extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      checked: props.checked,
    };

    this.handleChecked = this.handleChecked.bind(this);
    this.refCheckbox = this.refCheckbox.bind(this);
    this.handleClick = this.handleClick.bind(this);

    let tracker = props.rootStore.trackers.get(props.id);
    if (!tracker) {
      tracker = props.rootStore.initTracker(props.id);
    }
    this.tracker = tracker;

    this.checkbox = null;
  }

  componentDidMount() {
    this.tracker.attach();
  }

  componentWillUnmount() {
    this.tracker.deattach();
    this.tracker = null;
  }

  handleChecked() {
    this.setState({
      checked: this.checkbox.checked
    })
  }

  handleClick(e) {
    e.preventDefault();
    this.checkbox.checked = !this.checkbox.checked;
    this.handleChecked();
  }

  refCheckbox(element) {
    this.checkbox = element;
  }

  render() {
    const tracker = this.tracker;

    const classList = ['item'];
    if (this.state.checked) {
      classList.push('item__selected');
    }

    let icon = blankSvg;
    let name = null;
    let version = null;
    let updateBtn = null;
    let supportBtn = null;
    let homepageBtn = null;
    let author = null;

    if (tracker.state === 'done') {
      icon = tracker.getIconUrl();
      name = tracker.meta.name;
      version = tracker.meta.version || '';
      if (tracker.meta.supportURL) {
        supportBtn = (
          <a className="item__cell item__button button-support" target="_blank" href={tracker.meta.supportURL}/>
        );
      }
      if (tracker.meta.updateURL || tracker.meta.downloadURL) {
        updateBtn = (
          <a className="item__cell item__button button-update" href="#update" title={chrome.i18n.getMessage('update')}/>
        );
      }
      if (tracker.meta.homepageURL) {
        homepageBtn = (
          <a className="item__cell item__button button-home" target="_blank" href={tracker.meta.homepageURL}/>
        );
      }
      if (tracker.meta.author) {
        author = (
          <div className="item__cell item__author">{tracker.meta.author}</div>
        );
      }
    }

    const editUrl = 'editor.html#/tracker/' + tracker.id;

    return (
      <div className={classList.join(' ')} data-id={tracker.id}>
        <div className="item__move"/>
        <div className="item__checkbox">
          <input ref={this.refCheckbox} type="checkbox" defaultChecked={this.state.checked} onChange={this.handleChecked}/>
        </div>
        <img className="item__icon" src={icon}/>
        <div className="item__name" onClick={this.handleClick}>{name}</div>
        <div className="item__cell item__version">{version}</div>
        {updateBtn}
        {supportBtn}
        {homepageBtn}
        {author}
        <a className="item__cell item__button button-edit" href={editUrl} target="_blank" title={chrome.i18n.getMessage('edit')}/>
        <a onClick={this.handleRemove} className="item__cell item__button button-remove" href="#remove" title={chrome.i18n.getMessage('remove')}/>
      </div>
    );
  }
}

TrackerItem.propTypes = null && {
  rootStore: PropTypes.instanceOf(RootStore),
  id: PropTypes.string,
};

export default EditProfile;