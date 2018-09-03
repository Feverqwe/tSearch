import {inject, observer} from "mobx-react";
import React from "react";
import PropTypes from "prop-types";
import RootStore from "../stores/RootStore";
import {EditProfileItemStore} from '../stores/ProfileEditorStore';
import getLogger from "../tools/getLogger";
import blankSvg from "../assets/img/blank.svg";

const Sortable = require('sortablejs');

const logger = getLogger('EditProfile');


@inject('rootStore')
@observer
class EditProfile extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      filter: 'selected',
      search: '',
      trackers: []
    };

    this.handleChangeName = this.handleChangeName.bind(this);
    this.handleSearchChange = this.handleSearchChange.bind(this);
    this.refName = this.refName.bind(this);
    this.refSearch = this.refSearch.bind(this);
    this.refTrackers = this.refTrackers.bind(this);
    this.handleFilterClick = this.handleFilterClick.bind(this);
    this.handleSave = this.handleSave.bind(this);

    this.profile = null;

    this.name = null;
    this.search = null;

    this.sortable = null;
  }
  componentDidMount() {
    this.profile = this.props.rootStore.profileEditor.getProfilePage(this.props.id);
    if (this.profile.trackerModuleMapState === 'idle') {
      this.profile.fetchTrackerModules().then(() => {
        this.syncTrackers(null, null);
      });
    } else {
      this.syncTrackers(null, null);
    }
  }
  componentWillUnmount() {
    if (this.props.rootStore.profileEditor) {
      this.props.rootStore.profileEditor.removeProfilePage(this.props.id);
    }
  }
  syncTrackers(filter, search) {
    if (filter === null) {
      filter = this.state.filter;
    }
    if (search === null) {
      search = this.state.search;
    }
    this.setState({
      filter: filter,
      search: search,
      trackers: this.profile.getTrackersWithFilter(filter, search).slice(0)
    });
  }
  handleChangeName() {
    this.profile.setName(this.name.value);
  }
  refName(element) {
    this.name = element;
  }
  handleSearchChange() {
    this.syncTrackers(null, this.search.value);
  }
  refSearch(element) {
    this.search = element;
  }
  refTrackers(node) {
    if (!node) {
      if (this.sortable) {
        this.sortable.destroy();
        this.sortable = null;
      }
    } else
    if (!this.sortable) {
      // fix sortable bug with checkbox
      node.getElementsByTagName = ((node, getElementsByTagName) => {
        return tagName => {
          if (tagName === 'input') {
            tagName = 'null-input';
          }
          return getElementsByTagName.call(node, tagName);
        }
      })(node, node.getElementsByTagName);

      const getPrevSelectedTracker = node => {
        node = node.previousElementSibling;
        while (node && !node.classList.contains('item__selected')) {
          node = node.previousElementSibling;
        }
        return node;
      };

      const getNextSelectedTracker = node => {
        node = node.nextElementSibling;
        while (node && !node.classList.contains('item__selected')) {
          node = node.nextElementSibling;
        }
        return node;
      };

      this.sortable = new Sortable(node, {
        group: 'trackers',
        handle: '.item__move',
        draggable: '.item',
        animation: 150,
        onStart: () => {
          node.classList.add('sorting');
        },
        onEnd: e => {
          node.classList.remove('sorting');

          const itemNode = e.item;
          const prevNode = getPrevSelectedTracker(itemNode);
          const nextNode = getNextSelectedTracker(itemNode);
          const id = itemNode.dataset.id;
          const prevId = prevNode && prevNode.dataset.id;
          const nextId = nextNode && nextNode.dataset.id;

          this.profile.moveTracker(id, prevId, nextId);
        }
      });
    }
  }
  handleFilterClick(e, type) {
    e.preventDefault();
    this.syncTrackers(type, null);
  }
  handleSave(e) {
    e.preventDefault();
    this.profile.save();
    this.syncTrackers(null, null);
    this.props.rootStore.profileEditor.save();
  }
  render() {
    if (!this.profile || this.profile.trackerModuleMapState !== 'done') {
      return ('Loading...');
    }

    const filterItems = ['all', 'withoutList', 'selected'].map(type => {
      const isActive = type === this.state.filter;
      return (
        <FilterButton key={`filter-${type}`} isActive={isActive} type={type} profile={this.profile} onClick={this.handleFilterClick}/>
      );
    });

    const trackers = this.state.trackers.map(tracker => {
      return (
        <TrackerItem key={`tracker-${tracker.id}`} id={tracker.id} tracker={tracker} profile={this.profile}/>
      );
    });

    return (
      <div className="manager">
        <div className="manager__body">
          <div className="manager__sub_header sub_header__profile">
            <div className="profile__input">
              <input ref={this.refName} className="input__input" type="text" defaultValue={this.profile.name} onChange={this.handleChangeName}/>
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
          <a href="#save" className="button manager__footer__btn" onClick={this.handleSave}>{chrome.i18n.getMessage('save')}</a>
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


@observer
class TrackerItem extends React.Component {
  constructor(props) {
    super(props);

    this.handleChecked = this.handleChecked.bind(this);
    this.refCheckbox = this.refCheckbox.bind(this);
    this.handleClick = this.handleClick.bind(this);

    this.checkbox = null;
  }

  handleChecked() {
    if (this.checkbox.checked) {
      this.props.profile.addSelectedTrackerId(this.props.id);
    } else {
      this.props.profile.removeSelectedTrackerId(this.props.id);
    }
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
    const tracker = this.props.tracker;

    const checked = this.props.profile.selectedTrackerIds.indexOf(this.props.id) !== -1;

    const classList = ['item'];
    if (checked) {
      classList.push('item__selected');
    }

    let updateBtn = null;
    let supportBtn = null;
    let homepageBtn = null;
    let author = null;

    const icon = tracker.getIconUrl() || blankSvg;
    const name = tracker.meta.name || tracker.id;
    const version = tracker.meta.version;
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

    const editUrl = 'editor.html#/tracker/' + tracker.id;

    return (
      <div className={classList.join(' ')} data-id={tracker.id}>
        <div className="item__move"/>
        <div className="item__checkbox">
          <input ref={this.refCheckbox} type="checkbox" defaultChecked={checked} onChange={this.handleChecked}/>
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
  id: PropTypes.string,
  profile: PropTypes.instanceOf(EditProfileItemStore),
};

export default EditProfile;