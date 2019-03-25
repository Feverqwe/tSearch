import {inject, observer} from "mobx-react";
import React from "react";
import PropTypes from "prop-types";
import getLogger from "../../tools/getLogger";
import {Link} from "react-router-dom";
import getTitle from "../../tools/getTitle";
import TackerStore from "./TackerStore";
import ProfileEditorTrackerItem from "./ProfileEditorTrackerItem";
import Dialog from "../Dialog";

const Sortable = require('sortablejs');

const logger = getLogger('ProfileEditorProfile');


@inject('rootStore')
@observer
class ProfileEditorProfile extends React.Component {
  static propTypes = {
    profileEditorStore: PropTypes.object.isRequired,
    profileEditorProfileStore: PropTypes.object.isRequired,
  };

  componentDidMount() {
    document.title = getTitle(`Edit profile "${this.profileEditorProfileStore.name}"`);
    if (window.ga) {
      window.ga('send', 'pageview', {page: location.href, title: document.title});
    }
  }

  state = {
    showOptions: false,
    showStore: false,
    sourcesDialog: false,
    repos: []
  };

  /**@return ProfileEditorStore*/
  get profileEditorStore() {
    return this.props.profileEditorStore;
  }

  /**@return ProfileEditorProfileStore*/
  get profileEditorProfileStore() {
    return this.props.profileEditorProfileStore;
  }

  /**@return OptionsStore*/
  get optionsStore() {
    return this.props.rootStore.options;
  }

  handleChangeName = () => {
    this.profileEditorProfileStore.setName(this.name.value);
  };

  name = null;
  refName = (element) => {
    this.name = element;
  };

  handleSearchChange = (e) => {
    const input = e.currentTarget;
    this.profileEditorProfileStore.setFilterText(input.value);
    this.profileEditorProfileStore.setCategory('all');
  };

  handleSave = (e) => {
    e.preventDefault();
    this.profileEditorStore.save();
  };

  handleShowOptions = (e) => {
    e.preventDefault();
    this.setState({
      showOptions: !this.state.showOptions
    });
  };

  handleCategoryClick = (type) => {
    if (this.state.showStore) {
      this.setState({
        showStore: false
      });
    }
    this.profileEditorProfileStore.setCategory(type);
  };

  handleStoreClick = () => {
    this.setState({
      showStore: true
    });
  };

  handleOpenSourcesDialog = (e) => {
    e.preventDefault();
    this.setState({
      sourcesDialog: true,
      repos: this.optionsStore.options.repositories.slice(0)
    });
  };

  onCloseSourcesDialog = () => {
    this.setState({
      sourcesDialog: false,
      repos: null
    });
  };

  handleSourcesSubmit = (e) => {
    e.preventDefault();

    this.optionsStore.options.setValue('repositories', this.state.repos);
    this.optionsStore.save();

    this.onCloseSourcesDialog();
  };

  handleSourcesCancel = (e) => {
    e.preventDefault();

    this.onCloseSourcesDialog();
  };

  repositoryInput = null;
  refRepositoryInput = (element) => {
    this.repositoryInput = element;
  };

  repositorySelect = null;
  refRepositorySelect = (element) => {
    this.repositorySelect = element;
  };

  handleSourceSelectChange = (e) => {
    this.repositoryInput.value = this.repositorySelect.value;
  };

  handlePutRepository = (e) => {
    e.preventDefault();
    const repos = this.state.repos.slice(0);
    const url = this.repositoryInput.value;
    if (repos.indexOf(url) === -1) {
      repos.push(url);
      this.setState({
        repos
      });
    }
  };

  handleDeleteRepository = (e) => {
    e.preventDefault();
    const repos = this.state.repos.slice(0);

    Array.from(this.repositorySelect.selectedOptions).forEach((option) => {
      const url = option.value;
      const pos = repos.indexOf(url);
      if (pos !== -1) {
        repos.splice(pos, 1);
      }
    });
    this.setState({
      repos
    });
  };

  handleSourcesRefresh = (e) => {
    e.preventDefault();

    this.profileEditorStore.trackerStore.fetch();
  };

  render() {
    const categories = ['all', 'withoutList', 'selected'].map(type => {
      const isActive = !this.state.showStore && type === this.profileEditorProfileStore.category;
      const count = this.profileEditorProfileStore.getTrackerCountByCategory(type);
      const title = chrome.i18n.getMessage('filter_' + type);
      return (
        <ProfileEditorFilterButton key={`category-${type}`} title={title} onClick={this.handleCategoryClick} count={count} isActive={isActive} type={type}/>
      );
    });

    categories.unshift(
      <ProfileEditorFilterButton key={`category-${'store'}`} title={chrome.i18n.getMessage('external_trackers')} onClick={this.handleStoreClick} isActive={this.state.showStore} type={'store'}/>
    );

    let sourcesDialog = null;
    let listControls = [];
    let trackerList = null;
    if (this.state.showStore) {
      trackerList = (
        <TackerStore profileEditorStore={this.props.profileEditorStore} showOptions={this.state.showOptions}/>
      );

      listControls.push(
        <button key={'sources'} onClick={this.handleOpenSourcesDialog} className="styled-button">{chrome.i18n.getMessage('sources')}</button>
      );
      listControls.push(
        <button key={'refresh'} onClick={this.handleSourcesRefresh} className="styled-button refresh-icon left-offset" title={chrome.i18n.getMessage('refresh')}/>
      );

      if (this.state.sourcesDialog) {
        const options = this.state.repos.map((url) => {
          return (
            <option key={url} value={url}>{url}</option>
          );
        });

        sourcesDialog = (
          <Dialog className="dialog-repositories" onClose={this.onCloseSourcesDialog}>
            <form onSubmit={this.handleSourcesSubmit}>
              <label className="dialog__label" htmlFor="selectRepoUrls">{chrome.i18n.getMessage('repositories')}</label>
              <div>
                <select ref={this.refRepositorySelect} onChange={this.handleSourceSelectChange} id="selectRepoUrls" multiple={true}>{options}</select>
              </div>
              <div>
                <button onClick={this.handleDeleteRepository} className="styled-button" type="button">{chrome.i18n.getMessage('delete')}</button>
              </div>
              <label className="dialog__label" htmlFor="repoUrl">{chrome.i18n.getMessage('add_repository')}</label>
              <div>
                <input ref={this.refRepositoryInput} className="input__input" id="repoUrl" type="text" placeholder="https://..."/>
              </div>
              <div>
                <button onClick={this.handlePutRepository} className="styled-button" type="button">{chrome.i18n.getMessage('add')}</button>
              </div>

              <div className="dialog__button_box">
                <input value={chrome.i18n.getMessage('save')} className="styled-button" type="submit"/>
                <input onClick={this.handleSourcesCancel} value={chrome.i18n.getMessage('cancel')}
                       className="styled-button" type="button"/>
              </div>
            </form>
          </Dialog>
        );
      }
    } else {
      trackerList = (
        <ProfileEditorTackerList key={this.profileEditorProfileStore.category} profileEditorProfileStore={this.profileEditorProfileStore} showOptions={this.state.showOptions}/>
      );

      const showOptionsClassList = ['styled-button view-icon'];
      if (this.state.showOptions) {
        showOptionsClassList.push('pressed');
      }
      listControls.push(
        <button key={'view'} onClick={this.handleShowOptions} className={showOptionsClassList.join(' ')} title={chrome.i18n.getMessage('advanced_options')}/>
      );
    }

    return (
      <div className="manager">
        <div className="manager__body">
          <div className="manager__sub_header sub_header__profile">
            <div className="profile__input">
              <input ref={this.refName} className="input__input" type="text" defaultValue={this.profileEditorProfileStore.name} onChange={this.handleChangeName}/>
            </div>
          </div>
          <div className="manager__sub_header sub_header__filter">
            <div className="filter__box">{categories}</div>
            <div className="filter__search">
              <input className="input__input filter__input" type="text"
                     placeholder={chrome.i18n.getMessage('quickSearch')}
                     onChange={this.handleSearchChange}
              />
            </div>
          </div>
          {trackerList}
        </div>
        <div className="manager__footer">
          {listControls}
          <div className="space"/>
          <Link to={'/codeMaker'} target="_blank" className="button manager__footer__btn">{chrome.i18n.getMessage('createCode')}</Link>
          <Link to={'/editor/tracker'} target="_blank" className="button manager__footer__btn">{chrome.i18n.getMessage('add')}</Link>
          <button className="styled-button" onClick={this.handleSave}>{chrome.i18n.getMessage('save')}</button>
        </div>
        {sourcesDialog}
      </div>
    );
  }
}

@observer
class ProfileEditorTackerList extends React.Component {
  static propTypes = {
    profileEditorProfileStore: PropTypes.object.isRequired,
    showOptions: PropTypes.bool.isRequired,
  };

  state = {
    trackerIds: []
  };

  /**@return ProfileEditorProfileStore*/
  get profileEditorProfileStore() {
    return this.props.profileEditorProfileStore;
  }

  sortable = null;
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

          this.profileEditorProfileStore.moveTracker(id, prevId, nextId);
        }
      });
    }
  };

  render() {
    const trackerIds = this.state.trackerIds;
    const removedIds = trackerIds.slice(0);

    const checkedTrackerIds = this.profileEditorProfileStore.selectedTrackerIds;

    const checkedTrackers = [];
    const uncheckedTrackers = [];

    const appendTracker = (trackerStore) => {
      const checked = checkedTrackerIds.indexOf(trackerStore.id) !== -1;
      const item = (
        <ProfileEditorTrackerItem key={`tracker-${trackerStore.id}`}
                                  profileEditorProfileStore={this.profileEditorProfileStore}
                                  trackerStore={trackerStore} showOptions={this.props.showOptions} checked={checked}/>
      );
      if (checked) {
        checkedTrackers.push(item);
      } else {
        uncheckedTrackers.push(item);
      }
    };

    this.profileEditorProfileStore.categoryTrackers.forEach((trackerStore) => {
      const id = trackerStore.id;
      const pos = removedIds.indexOf(id);
      if (pos !== -1) {
        removedIds.splice(pos, 1);
      }
      if (trackerIds.indexOf(id) === -1) {
        trackerIds.push(id);
      }
      appendTracker(trackerStore);
    });

    if (!this.profileEditorProfileStore.filterText) {
      removedIds.forEach((id) => {
        const trackerStore = this.profileEditorProfileStore.getTrackerById(id);
        if (trackerStore) {
          appendTracker(trackerStore);
        }
      });
    }

    return (
      <div ref={this.refTrackers} className="manager__trackers">
        {checkedTrackers.concat(uncheckedTrackers)}
      </div>
    );
  }
}

@observer
class ProfileEditorFilterButton extends React.Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    isActive: PropTypes.bool.isRequired,
    count: PropTypes.number,
    onClick: PropTypes.func.isRequired,
  };

  handleClick = (e) => {
    e.preventDefault();
    this.props.onClick(this.props.type);
  };

  render() {
    const type = this.props.type;

    const classList = ['filter__item'];
    if (this.props.isActive) {
      classList.push('item__selected');
    }

    let count = null;
    if (typeof this.props.count === 'number') {
      count = (
        <span className="item__count">{this.props.count}</span>
      );
    }

    return (
      <a className={classList.join(' ')} onClick={this.handleClick} href={'#'}>
        {this.props.title}
        {' '}
        {count}
      </a>
    );
  }
}

export default ProfileEditorProfile;