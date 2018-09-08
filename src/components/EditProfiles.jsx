import {inject, observer} from "mobx-react";
import React from "react";
import PropTypes from "prop-types";
import RootStore from "../stores/RootStore";
import {Link} from "react-router-dom";
import ProfileStore from "../stores/ProfileStore";
import getLogger from "../tools/getLogger";

const uuid = require('uuid/v4');
const Sortable = require('sortablejs');

const logger = getLogger('EditProfiles');


@inject('rootStore')
@observer
class EditProfiles extends React.Component {
  constructor(props) {
    super(props);

    this.refProfiles = this.refProfiles.bind(this);
    this.handleSave = this.handleSave.bind(this);
    this.handleCreate = this.handleCreate.bind(this);

    this.sortable = null;
  }

  refProfiles(node) {
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

          this.props.rootStore.profileEditor.moveProfile(id, prevId, nextId);
        }
      });
    }
  }

  handleSave(e) {
    e.preventDefault();
    const profileEditor = this.props.rootStore.profileEditor;
    profileEditor.save();
  }

  handleCreate(e) {
    e.preventDefault();
    this.props.history.push(`/profileEditor/${uuid()}`);
  }

  render() {
    const profileEditor = this.props.rootStore.profileEditor;
    const profiles = profileEditor.profiles.map((profileStore, index) => {
      return (
        <ProfileItem key={profileStore.id} index={index} profileStore={profileStore} history={this.props.history}/>
      );
    });

    return (
      <div className="manager">
        <div className="manager__body">
          <div className="manager__sub_header manager__sub_header-profiles">
            <a className="manager__new_profile" href="#new_profile" onClick={this.handleCreate}>{chrome.i18n.getMessage('newProfile')}</a>
          </div>
          <div ref={this.refProfiles} className="manager__profiles">
            {profiles}
          </div>
        </div>
        <div className="manager__footer">
          <a className="button manager__footer__btn" href="#save" onClick={this.handleSave}>{chrome.i18n.getMessage('save')}</a>
        </div>
      </div>
    );
  }
}

EditProfiles.propTypes = null && {
  rootStore: PropTypes.instanceOf(RootStore),
  history: PropTypes.object,
};

@inject('rootStore')
@observer
class ProfileItem extends React.Component {
  constructor(props) {
    super(props);

    this.handleRemove = this.handleRemove.bind(this);
    this.handleNameClick = this.handleNameClick.bind(this);
    this.refItem = this.refItem.bind(this);

    this.item = null;
  }

  handleRemove(e) {
    e.preventDefault();
    this.props.rootStore.profileEditor.removeProfileById(this.props.profileStore.id);
  }

  handleNameClick(e) {
    if (
      e.target === this.item ||
      e.target.classList.contains('item__name')
    ) {
      this.props.history.push(`/profileEditor/${this.props.profileStore.id}`);
    }
  }

  refItem(element) {
    this.item = element;
  }

  render() {
    const profileStore = this.props.profileStore;

    return (
      <div ref={this.refItem} onClick={this.handleNameClick} data-id={profileStore.id} className="item">
        <div className="item__move"/>
        <div className="item__name">{profileStore.name}</div>
        <Link to={`/profileEditor/${profileStore.id}`}
              className="item__cell item__button button-edit"
              title={chrome.i18n.getMessage('edit')}/>
        <a onClick={this.handleRemove}
           className="item__cell item__button button-remove"
           href="#remove" title={chrome.i18n.getMessage('remove')}/>
      </div>
    );
  }
}

ProfileItem.propTypes = null && {
  rootStore: PropTypes.instanceOf(RootStore),
  index: PropTypes.number,
  profileStore: PropTypes.instanceOf(ProfileStore),
  history: PropTypes.object,
};

export default EditProfiles;