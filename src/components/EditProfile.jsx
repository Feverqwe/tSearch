import {inject, observer} from "mobx-react";
import React from "react";
import PropTypes from "prop-types";
import getLogger from "../tools/getLogger";
import blankSvg from "../assets/img/blank.svg";
import {Link} from "react-router-dom";

const Sortable = require('sortablejs');

const logger = getLogger('EditProfile');


@inject('rootStore')
@observer
class EditProfile extends React.Component {
  static propTypes = {
    rootStore: PropTypes.object,
    id: PropTypes.string,
  };

  constructor(props) {
    super(props);

    this.state = {
      filter: 'selected',
      search: '',
      trackers: []
    };

    this.name = null;
    this.search = null;

    this.sortable = null;
  }

  componentDidMount() {
    this.profileEditorStore.createProfilePage(this.props.id);
    this.syncTrackers(null, null);
  }

  componentWillUnmount() {
    if (this.profileEditorStore) {
      this.profileEditorStore.removeProfilePage(this.props.id);
    }
  }

  get profileEditorStore() {
    return this.props.rootStore.profileEditor;
  }

  get profileStore() {
    return this.profileEditorStore.profilePages.get(this.props.id);
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
      trackerIds: this.profileStore.getTrackerIdsWithFilter(filter, search).slice(0)
    });
  }

  handleChangeName = () => {
    this.profileStore.setName(this.name.value);
  };

  refName = (element) => {
    this.name = element;
  };

  handleSearchChange = () => {
    this.syncTrackers(null, this.search.value);
  };

  refSearch = (element) => {
    this.search = element;
  };

  refTrackers = (node) => {
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

          this.profileStore.moveTracker(id, prevId, nextId);
        }
      });
    }
  };

  handleFilterClick = (e, type) => {
    e.preventDefault();
    this.syncTrackers(type, null);
  };

  handleSave = (e) => {
    e.preventDefault();
    this.profileStore.save();
    this.syncTrackers(null, null);
    this.profileEditorStore.save();
  };

  render() {
    if (!this.profileStore) {
      return ('Loading...');
    }

    const filterItems = ['all', 'withoutList', 'selected'].map(type => {
      const isActive = type === this.state.filter;
      return (
        <FilterButton key={`filter-${type}`} isActive={isActive} type={type} profile={this.profileStore} onClick={this.handleFilterClick}/>
      );
    });

    const trackers = this.state.trackerIds.reduce((result, id) => {
      const editorTracker = this.profileStore.editorTrackers.get(id);
      if (editorTracker) {
        result.push(
          <TrackerItem key={`tracker-${editorTracker.id}`} id={editorTracker.id} editorTracker={editorTracker} profile={this.profileStore}/>
        );
      }
      return result;
    }, []);

    return (
      <div className="manager">
        <div className="manager__body">
          <div className="manager__sub_header sub_header__profile">
            <div className="profile__input">
              <input ref={this.refName} className="input__input" type="text" defaultValue={this.profileStore.name} onChange={this.handleChangeName}/>
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
          <Link to={'/editor/tracker'} target="_blank" className="button manager__footer__btn">{chrome.i18n.getMessage('add')}</Link>
          <Link to={'/codeMaker'} target="_blank" className="button manager__footer__btn">{chrome.i18n.getMessage('createCode')}</Link>
        </div>
      </div>
    );
  }
}


@observer
class FilterButton extends React.Component {
  static propTypes = {
    type: PropTypes.string,
    isActive: PropTypes.bool,
    profile: PropTypes.object,
    onClick: PropTypes.func,
  };

  get profileStore() {
    return this.props.profile;
  }

  handleClick = (e) => {
    this.props.onClick(e, this.props.type);
  };

  render() {
    const type = this.props.type;

    const classList = ['filter__item'];
    if (this.props.isActive) {
      classList.push('item__selected');
    }

    const count = this.profileStore.getTrackersByFilter(type).length;

    return (
      <a key={type} className={classList.join(' ')} onClick={this.handleClick} href={'#'}>
        {chrome.i18n.getMessage('filter_' + type)}
        {' '}
        <span className="item__count">{count}</span>
      </a>
    );
  }
}


@inject('rootStore')
@observer
class TrackerItem extends React.Component {
  static propTypes = {
    rootStore: PropTypes.object,
    id: PropTypes.string,
    profile: PropTypes.object,
    editorTracker: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);

    this.checkbox = null;
  }

  get profileStore() {
    return this.props.profile;
  }

  get editorTracker() {
    return this.props.editorTracker;
  }

  handleChecked = () => {
    if (this.checkbox.checked) {
      this.profileStore.addSelectedTrackerId(this.props.id);
    } else {
      this.profileStore.removeSelectedTrackerId(this.props.id);
    }
  };

  handleClick = (e) => {
    e.preventDefault();
    this.checkbox.checked = !this.checkbox.checked;
    this.handleChecked();
  };

  handleRemove = (e) => {
    e.preventDefault();
    const trackers = this.props.rootStore.trackers;
    trackers.deleteTracker(this.props.id);
    trackers.saveTrackers();
  };

  refCheckbox = (element) => {
    this.checkbox = element;
  };

  handleUpdate = (e) => {
    e.preventDefault();
    if (!this.editorTracker.isEditorProfileTrackerStore) {
      this.editorTracker.update();
    }
  };

  render() {
    const editorTracker = this.editorTracker;

    const checked = this.profileStore.selectedTrackerIds.indexOf(this.props.id) !== -1;

    const classList = ['item'];
    if (checked) {
      classList.push('item__selected');
    }

    let updateBtn = null;
    let supportBtn = null;
    let homepageBtn = null;
    let deleteBtn = null;
    let author = null;

    const icon = editorTracker.getIconUrl() || blankSvg;
    const name = editorTracker.meta.name || editorTracker.id;

    let version = editorTracker.meta.version;
    if (editorTracker.updateState === 'pending') {
      version = '...';
    }

    if (editorTracker.meta.supportURL) {
      supportBtn = (
        <a className="item__cell item__button button-support" target="_blank" href={editorTracker.meta.supportURL}/>
      );
    }

    if (editorTracker.meta.downloadURL) {
      updateBtn = (
        <a onClick={this.handleUpdate} className="item__cell item__button button-update" href="#update" title={chrome.i18n.getMessage('update')}/>
      );
    }

    if (editorTracker.meta.homepageURL) {
      homepageBtn = (
        <a className="item__cell item__button button-home" target="_blank" href={editorTracker.meta.homepageURL}/>
      );
    }

    if (editorTracker.meta.author) {
      author = (
        <div className="item__cell item__author">{editorTracker.meta.author}</div>
      );
    }

    if (!editorTracker.isEditorProfileTrackerStore) {
      deleteBtn = (
        <a onClick={this.handleRemove} className="item__cell item__button button-remove" href="#remove" title={chrome.i18n.getMessage('remove')}/>
      );
    }

    const editUrl = `/editor/tracker/${editorTracker.id}`;

    return (
      <div className={classList.join(' ')} data-id={editorTracker.id}>
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
        <Link className="item__cell item__button button-edit" to={editUrl} target="_blank" title={chrome.i18n.getMessage('edit')}/>
        {deleteBtn}
      </div>
    );
  }
}

export default EditProfile;