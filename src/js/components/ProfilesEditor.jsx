import React from 'react';
import ReactDOM from 'react-dom';
import blankSvg from '../../img/blank.svg';
import {observer} from "mobx-react/index";
import _escapeRegExp from "lodash.escaperegexp";

const debug = require('debug')('ProfilesEditor');
const qs = require('querystring');
const Sortable = require('sortablejs');

@observer class ProfilesEditor extends React.Component {
  constructor() {
    super();

    this.state = {
      page: 'profiles', // profiles, edit
      profile: null
    };

    this.profilesEditor = null;

    this.handleClose = this.handleClose.bind(this);
    this.handleBodyClick = this.handleBodyClick.bind(this);
    this.handleEdit = this.handleEdit.bind(this);
    this.handleCreate = this.handleCreate.bind(this);
    this.handleSave = this.handleSave.bind(this);
  }
  componentWillMount() {
    this.props.store.createProfilesEditor();
    this.profilesEditor = this.props.store.profilesEditor;

    document.body.addEventListener('click', this.handleBodyClick);
  }
  componentWillUnmount() {
    this.props.store.destroyProfilesEditor();
    this.profilesEditor = null;

    document.body.removeEventListener('click', this.handleBodyClick);
  }
  handleBodyClick(e) {
    if (!this.refs.page.refs.body.contains(e.target)) {
      this.props.onClose();
    }
  }
  handleEdit(profile) {
    this.setState({
      page: 'edit',
      profile: profile
    });
  }
  handleCreate() {
    this.setState({
      page: 'edit',
      profile: this.profilesEditor.createProfile(),
    });
  }
  handleClose(e) {
    e.preventDefault();
    this.props.onClose();
  }
  handleSave(e) {
    e.preventDefault();
    this.profilesEditor.save();
    this.props.onClose();
  }
  render() {
    let body = null;
    switch (this.profilesEditor.state) {
      case 'loading': {
        body = (
          <div className="manager">
            <div className="manager__header">
              <div className="header__title">Loading...</div>
            </div>
          </div>
        );
        break;
      }
      case 'done': {
        switch (this.state.page) {
          case 'profiles': {
            body = (
              <ProfileChooser ref={'page'} {...this.props} profilesEditor={this.profilesEditor}
                              onClose={this.handleClose}
                              onEdit={this.handleEdit}
                              onCreate={this.handleCreate}
                              onSave={this.handleSave}
              />
            );
            break;
          }
          case 'edit': {
            body = (
              <ProfileEditor ref={'page'} {...this.props} profilesEditor={this.profilesEditor}
                             profile={this.state.profile}
                             onClose={this.handleClose}
                             onSave={this.handleSave}
              />
            );
            break;
          }
        }
      }
    }
    return ReactDOM.createPortal(body, document.body);
  }
}

@observer class ProfileChooser extends React.Component {
  constructor() {
    super();

    this.refProfiles = this.refProfiles.bind(this);
    this.handleCreate = this.handleCreate.bind(this);

    this.sortable = null;
  }
  refProfiles(node) {
    if (!node) {
      if (this.sortable) {
        this.sortable.destroy();
        this.sortable = null;
        // debug('destroy');
      }
    } else
    if (this.sortable) {
      // debug('update');
    } else {
      // debug('create');
      const self = this;
      this.sortable = new Sortable(node, {
        group: 'profiles',
        handle: '.item__move',
        draggable: '.item',
        animation: 150,
        onStart() {
          node.classList.add('sorting');
        },
        onEnd(e) {
          node.classList.remove('sorting');

          const itemNode = e.item;
          const prevNode = itemNode.previousElementSibling;
          const nextNode = itemNode.nextElementSibling;
          const index = parseInt(itemNode.dataset.index, 10);
          const prev = prevNode && parseInt(prevNode.dataset.index, 10);
          const next = nextNode && parseInt(nextNode.dataset.index, 10);

          self.props.profilesEditor.moveProfile(index, prev, next);
        }
      });
    }
  }
  handleCreate(e) {
    e.preventDefault();
    this.props.onCreate();
  }
  render() {
    const profiles = this.props.profilesEditor.profiles.map((/**ProfileM*/profile, index) => (
      <ProfileTemplateItem key={index} index={index} profile={profile} {...this.props} onEdit={this.props.onEdit}/>
    ));

    return (
      <div ref={'body'} className="manager">
        <div className="manager__header">
          <div className="header__title">{chrome.i18n.getMessage('manageProfiles')}</div>
          <a href="#close" className="header__close" onClick={this.props.onClose}>{chrome.i18n.getMessage('close')}</a>
        </div>
        <div className="manager__body">
          <div className="manager__sub_header manager__sub_header-profiles">
            <a className="manager__new_profile" href="#new_profile" onClick={this.handleCreate}>{chrome.i18n.getMessage('newProfile')}</a>
          </div>
          <div ref={this.refProfiles} className="manager__profiles">
            {profiles}
          </div>
        </div>
        <div className="manager__footer">
          <a className="button manager__footer__btn" href="#save" onClick={this.props.onSave}>{chrome.i18n.getMessage('save')}</a>
        </div>
      </div>
    );
  }
}

@observer class ProfileTemplateItem extends React.Component {
  constructor() {
    super();

    this.handleRemove = this.handleRemove.bind(this);
    this.handleEdit = this.handleEdit.bind(this);
    this.handleNameClick = this.handleNameClick.bind(this);
  }
  handleEdit(e) {
    e.preventDefault();
    this.props.onEdit(this.props.profile);
  }
  handleRemove(e) {
    e.preventDefault();
    const /**@type IndexM*/store = this.props.store;
    const /**@type ProfileM*/profile = this.props.profile;
    store.profilesEditor.removeProfile(profile);
  }
  handleNameClick(e) {
    if (
      e.target === this.refs.item ||
      e.target.classList.contains('item__name')
    ) {
      this.handleEdit(e);
    }
  }
  render() {
    const /**@type ProfileM*/profile = this.props.profile;

    return (
      <div key={profile.name} ref={'item'} data-index={this.props.index} className="item" onClick={this.handleNameClick}>
        <div className="item__move"/>
        <div className="item__name">{profile.name}</div>
        <a className="item__cell item__button button-edit"
           onClick={this.handleEdit}
           href="#edit" title={chrome.i18n.getMessage('edit')}/>
        <a className="item__cell item__button button-remove"
           onClick={this.handleRemove}
           href="#remove" title={chrome.i18n.getMessage('remove')}/>
      </div>
    );
  }
}

@observer class ProfileEditor extends React.Component {
  constructor() {
    super();

    this.state = {
      filter: 'selected',
      searchRe: null,
    };

    this.refTrackers = this.refTrackers.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
    this.handleChangeName = this.handleChangeName.bind(this);
    this.handleSearchChange = this.handleSearchChange.bind(this);
  }
  refTrackers(node) {
    if (!node) {
      if (this.sortable) {
        this.sortable.destroy();
        this.sortable = null;
        // debug('destroy');
      }
    } else
    if (this.sortable) {
      // debug('update');
    } else {
      // debug('create');
      const self = this;

      // fix sortable bug with checkbox
      node.getElementsByTagName = ((node, getElementsByTagName) => {
        return tagName => {
          if (tagName === 'input') {
            tagName = 'null-input';
          }
          return getElementsByTagName.call(node, tagName);
        }
      })(node, node.getElementsByTagName);

      this.sortable = new Sortable(node, {
        group: 'trackers',
        handle: '.item__move',
        draggable: '.item',
        animation: 150,
        onStart() {
          node.classList.add('sorting');
        },
        onEnd(e) {
          node.classList.remove('sorting');

          const itemNode = e.item;
          const prevNode = itemNode.previousElementSibling;
          const nextNode = itemNode.nextElementSibling;
          const current = itemNode.dataset.id;
          const prev = prevNode && prevNode.dataset.id;
          const next = nextNode && nextNode.dataset.id;

          /**@type ProfilesEditorProfileM*/
          const store = self.props.profile;
          store.moveTracker(current, prev, next);
        }
      });
    }
  }
  handleFilter(type, e) {
    e.preventDefault();
    this.setState({
      filter: type
    });
  }
  handleSelect(checked, tracker) {
    /**@type ProfilesEditorProfileM*/
    const profile = this.props.profile;
    if (checked) {
      profile.addTracker(tracker);
    } else {
      profile.removeTracker(tracker.id);
    }
  }
  handleChangeName() {
    this.props.profile.changeName(this.refs.name.value);
  }
  handleSearchChange() {
    const text = this.refs.search.value;
    let re = null;
    if (text) {
      re = new RegExp(_escapeRegExp(text), 'i');
    }
    this.setState({
      searchRe: re
    });
  }
  render() {
    /**@type IndexM*/
    const store = this.props.store;
    /**@type ProfilesEditorProfileM*/
    const profile = this.props.profile;

    const filterItems = ['all', 'withoutList', 'selected'].map(type => {
      const classList = ['filter__item'];
      if (type === this.state.filter) {
        classList.push('item__selected');
      }
      const count = profile.getTrackersByFilter(type).length;
      return (
        <a key={type} className={classList.join(' ')} onClick={this.handleFilter.bind(this, type)} href={'#'}>
          {chrome.i18n.getMessage('filter_' + type)}
          {' '}
          <span className="item__count">{count}</span>
        </a>
      );
    });

    const enabledTrackerIds = profile.getTrackerIds();
    const trackers = profile.getTrackersByFilter(this.state.filter).filter(tracker => {
      if (this.state.searchRe) {
        return this.state.searchRe.test([
          tracker.id,
          tracker.meta.name,
          tracker.meta.author,
          tracker.meta.description,
          tracker.meta.homepageURL,
          tracker.meta.trackerURL,
          tracker.meta.updateURL,
          tracker.meta.downloadURL,
          tracker.meta.supportURL,
        ].join(' '));
      }
      return true;
    }).map(tracker => {
      const isEnabled = enabledTrackerIds.indexOf(tracker.id) !== -1;
      return (
        <TrackerTemplateItem key={tracker.id} {...this.props} tracker={tracker} checked={isEnabled} onSelect={this.handleSelect}/>
      );
    });

    const newUrl = 'editor.html#/tracker';

    return (
      <div ref={'body'} className="manager">
        <div className="manager__header">
          <div className="header__title">{chrome.i18n.getMessage('manageProfile')}</div>
          <a href="#close" className="header__close" onClick={this.props.onClose}>{chrome.i18n.getMessage('close')}</a>
        </div>
        <div className="manager__body">
          <div className="manager__sub_header sub_header__profile">
            <div className="profile__input">
              <input ref={'name'} className="input__input" type="text" defaultValue={profile.name} onChange={this.handleChangeName}/>
            </div>
          </div>
          <div className="manager__sub_header sub_header__filter">
            <div className="filter__box">{filterItems}</div>
            <div className="filter__search">
              <input ref={'search'} className="input__input filter__input" type="text"
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
          <a href={newUrl} target="_blank" className="button manager__footer__btn">{chrome.i18n.getMessage('add')}</a>
          <a href="#createCode" className="button manager__footer__btn">{chrome.i18n.getMessage('createCode')}</a>
        </div>
      </div>
    );
  }
}

@observer class TrackerTemplateItem extends React.Component {
  constructor() {
    super();

    this.handleChange = this.handleChange.bind(this);
    this.handleToggle = this.handleToggle.bind(this);
    this.handleRemove = this.handleRemove.bind(this);
  }
  handleChange(e) {
    e.stopPropagation();

    this.props.onSelect(this.refs.checkbox.checked, this.props.tracker);
  }
  handleToggle(e) {
    if (
      e.target === this.refs.item ||
      e.target.classList.contains('item__name')
    ) {
      e.preventDefault();
      this.refs.checkbox.checked = !this.refs.checkbox.checked;
      this.handleChange(e);
    }
  }
  handleRemove(e) {
    e.preventDefault();
    /**@type TrackerM*/
    const tracker = this.props.tracker;
    tracker.remove();
  }
  render() {
    /**@type TrackerM*/
    const tracker = this.props.tracker;

    const classList = ['item'];
    if (this.props.checked) {
      classList.push('item__selected');
    }

    const icon = tracker.isLoaded() && tracker.getIconUrl() || blankSvg;
    const name = tracker.meta.name;
    const version = tracker.meta.version || '';

    let updateBtn = null;
    if (tracker.meta.updateURL || tracker.meta.downloadURL) {
      updateBtn = (
        <a className="item__cell item__button button-update" href="#update" title={chrome.i18n.getMessage('update')}/>
      );
    }

    let supportBtn = null;
    let homepageBtn = null;
    let author = null;
    if (tracker.meta.supportURL) {
      supportBtn = (
        <a className="item__cell item__button button-support" target="_blank" href={tracker.meta.supportURL}/>
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
      <div ref={'item'} className={classList.join(' ')} data-id={tracker.id} onClick={this.handleToggle}>
        <div className="item__move"/>
        <div className="item__checkbox">
          <input ref={'checkbox'} type="checkbox" defaultChecked={this.props.checked} onChange={this.handleChange}/>
        </div>
        <img className="item__icon" src={icon}/>
        <div className="item__name">{name}</div>
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

export default ProfilesEditor;