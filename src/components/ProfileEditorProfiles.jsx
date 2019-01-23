import {observer} from "mobx-react";
import React from "react";
import PropTypes from "prop-types";
import {Link, withRouter} from "react-router-dom";
import getLogger from "../tools/getLogger";
import getTitle from "../tools/getTitle";

const uuid = require('uuid/v4');
const Sortable = require('sortablejs');

const logger = getLogger('ProfileEditorProfiles');


@withRouter
@observer
class ProfileEditorProfiles extends React.Component {
  static propTypes = {
    profileEditorStore: PropTypes.object.isRequired,
    history: PropTypes.object,
  };

  componentDidMount() {
    document.title = getTitle('Edit profiles');
    if (window.ga) {
      window.ga('send', 'pageview', {page: location.href, title: document.title});
    }
  }

  /**@return ProfileEditorStore*/
  get profileEditorStore() {
    return this.props.profileEditorStore;
  }

  sortable = null;
  refProfiles = (node) => {
    if (!node) {
      if (this.sortable) {
        this.sortable.destroy();
        this.sortable = null;
      }
    } else
    if (!this.sortable) {
      this.sortable = new Sortable(node, {
        group: 'profiles',
        handle: '.item__move',
        draggable: '.item',
        animation: 150,
        onStart: () => {
          node.classList.add('sorting');
        },
        onEnd: e => {
          node.classList.remove('sorting');

          const itemNode = e.item;
          const prevNode = itemNode.previousElementSibling;
          const nextNode = itemNode.nextElementSibling;
          const id = itemNode.dataset.id;
          const prevId = prevNode && prevNode.dataset.id;
          const nextId = nextNode && nextNode.dataset.id;

          this.profileEditorStore.moveProfile(id, prevId, nextId);
        }
      });
    }
  };

  handleSave = (e) => {
    e.preventDefault();
    this.profileEditorStore.save();
  };

  handleCreate = (e) => {
    e.preventDefault();
    const id = uuid();
    this.profileEditorStore.createProfile(id);
    this.props.history.push(`/profileEditor/${id}`);
  };

  render() {
    const profiles = this.profileEditorStore.profiles.map((profileEditorProfileStore) => {
      return (
        <ProfileEditorProfileItem key={profileEditorProfileStore.id} profileEditorStore={this.profileEditorStore} profileEditorProfileStore={profileEditorProfileStore}/>
      );
    });

    return (
      <div className="manager">
        <div className="manager__body">
          <div className="manager__sub_header manager__sub_header-profiles">
            <a className="manager__new_profile" href={"#create"} onClick={this.handleCreate}>{chrome.i18n.getMessage('newProfile')}</a>
          </div>
          <div ref={this.refProfiles} className="manager__profiles">
            {profiles}
          </div>
        </div>
        <div className="manager__footer">
          <div className="space"/>
          <a className="button manager__footer__btn" href="#save" onClick={this.handleSave}>{chrome.i18n.getMessage('save')}</a>
        </div>
      </div>
    );
  }
}

@withRouter
@observer
class ProfileEditorProfileItem extends React.Component {
  static propTypes = {
    profileEditorStore: PropTypes.object.isRequired,
    profileEditorProfileStore: PropTypes.object.isRequired,
    history: PropTypes.object,
  };

  /**@return ProfileEditorStore*/
  get profileEditorStore() {
    return this.props.profileEditorStore;
  }

  /**@return ProfileEditorProfileStore*/
  get profileEditorProfileStore() {
    return this.props.profileEditorProfileStore;
  }

  handleRemove = (e) => {
    e.preventDefault();
    this.profileEditorStore.removeProfileById(this.profileEditorProfileStore.id);
  };

  handleClick = (e) => {
    if (
      e.target === this.item ||
      e.target.classList.contains('item__name')
    ) {
      this.props.history.push(`/profileEditor/${this.profileEditorProfileStore.id}`);
    }
  };

  item = null;
  refItem = (element) => {
    this.item = element;
  };

  render() {
    const profileEditorProfileStore = this.profileEditorProfileStore;

    return (
      <div ref={this.refItem} onClick={this.handleClick} data-id={profileEditorProfileStore.id} className="item">
        <div className="item__move"/>
        <div className="item__name">{profileEditorProfileStore.name}</div>
        <Link to={`/profileEditor/${profileEditorProfileStore.id}`}
              className="item__cell item__button button-edit"
              title={chrome.i18n.getMessage('edit')}/>
        <a onClick={this.handleRemove}
           className="item__cell item__button button-remove"
           href="#remove" title={chrome.i18n.getMessage('remove')}/>
      </div>
    );
  }
}

export default ProfileEditorProfiles;