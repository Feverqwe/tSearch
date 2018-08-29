import React from 'react';
import Header from "../components/Header";
import Profiles from "../components/Profiles";
import ScrollTop from "../components/ScrollTop";
import Filters from "../components/Filters";
import {inject, observer} from "mobx-react";
import PropTypes from "prop-types";
import RootStore from "../stores/RootStore";
import {Link} from "react-router-dom";
import ProfilesItemStore from "../stores/ProfilesItemStore";

const Sortable = require('sortablejs');


@inject('rootStore')
@observer
class ProfileEditor extends React.Component {
  componentDidMount() {
    if (this.props.rootStore.profiles.state === 'idle') {
      this.props.rootStore.profiles.fetchProfiles();
    }
  }

  render() {
    const rootStore = this.props.rootStore;
    const profilesStore = rootStore.profiles;

    let page = null;
    switch (profilesStore.state) {
      case 'pending': {
        page = ('Loading...');
        break;
      }
      case 'error': {
        page = ('Error');
        break;
      }
      case 'done': {
        page = (
          <ProfileEditorPage history={this.props.history}/>
        );
        break;
      }
      default: {
        page = ('Idle');
      }
    }

    return (
      <div>
        <Header {...this.props}/>
        <div className="content content-row">
          <div className="parameter_box">
            <Profiles/>
            <Filters/>
          </div>
          <div className="main">
            {page}
          </div>
        </div>
        <ScrollTop/>
      </div>
    );
  }
}

ProfileEditor.propTypes = null && {
  rootStore: PropTypes.instanceOf(RootStore)
};


@inject('rootStore')
@observer
class ProfileEditorPage extends React.Component {
  constructor(props) {
    super(props);

    this.refProfiles = this.refProfiles.bind(this);

    this.sortable = null;
  }

  componentDidMount() {
    if (!this.props.rootStore.profileEditor) {
      this.props.rootStore.createProfileEditor();
    }
  }

  componentWillUnmount() {
    this.props.rootStore.destroyProfileEditor();
  }

  refProfiles(node) {
    if (!node) {
      if (this.sortable) {
        this.sortable.destroy();
        this.sortable = null;
      }
    } else
    if (!this.sortable) {
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
          const id = itemNode.dataset.id;
          const prevId = prevNode && prevNode.dataset.id;
          const nextId = nextNode && nextNode.dataset.id;

          self.props.rootStore.profileEditor.moveProfile(id, prevId, nextId);
        }
      });
    }
  }

  render() {
    const profileEditor = this.props.rootStore.profileEditor;
    if (!profileEditor) {
      return ('Loading...');
    }

    const profiles = profileEditor.profiles.map((profilesItem, index) => {
      return (
        <ProfileItem key={profilesItem.id} index={index} profilesItem={profilesItem} history={this.props.history}/>
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
          <a className="button manager__footer__btn" href="#save" onClick={this.props.onSave}>{chrome.i18n.getMessage('save')}</a>
        </div>
      </div>
    );
  }
}

ProfileEditorPage.propTypes = null && {
  rootStore: PropTypes.instanceOf(RootStore)
};


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
    /*const store = this.props.store;
    const profile = this.props.profile;
    store.profilesEditor.removeProfile(profile);*/
  }

  handleNameClick(e) {
    if (
      e.target === this.item ||
      e.target.classList.contains('item__name')
    ) {
      this.props.history.push(`/profileEditor/${this.props.profilesItem.id}`);
    }
  }

  refItem(element) {
    this.item = element;
  }

  render() {
    const profilesItem = this.props.profilesItem;

    return (
      <div ref={this.refItem} onClick={this.handleNameClick} data-id={profilesItem.id} className="item">
        <div className="item__move"/>
        <div className="item__name">{profilesItem.name}</div>
        <Link to={`/profileEditor/${profilesItem.id}`}
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
  profilesItem: PropTypes.instanceOf(ProfilesItemStore),
};

export default ProfileEditor;