import React from "react";
import {observer} from "mobx-react/index";
import ProfileConfig from "./ProfileConfig";


@observer class ProfileSelect extends React.Component {
  constructor() {
    super();

    this.state = {
      editing: false
    };

    this.handleSelect = this.handleSelect.bind(this);
    this.handleEdit = this.handleEdit.bind(this);
    this.handleEditClose = this.handleEditClose.bind(this);
  }

  handleEdit(e) {
    e.preventDefault();
    this.setState({
      editing: true
    });
  }

  handleEditClose() {
    this.setState({
      editing: false
    });
  }

  handleSelect() {
    const store = this.props.store;
    const value = this.refs.select.value;
    store.changeProfile(value);
  }

  render() {
    const /**@type IndexM*/store = this.props.store;
    const options = [];
    let foundActive = false;
    store.profiles.forEach(profile => {
      if (!foundActive && profile.name === store.profile.name) {
        foundActive = true;
      }
      options.push(
        <option key={profile.name} value={profile.name}>{profile.name}</option>
      );
    });
    if (!foundActive) {
      options.push(
        <option key={store.profile.name} value={store.profile.name}>{store.profile.name}</option>
      );
    }

    let editor = null;
    if (this.state.editing) {
      editor = (
        <ProfileConfig key={'editor'} store={this.props.store} onClose={this.handleEditClose}/>
      );
    }

    return [
      <select key={'select'} ref="select" className="profile__select" defaultValue={store.profile.name} onChange={this.handleSelect}>
        {options}
      </select>,
      <a key={'manageBtn'}
         onClick={this.handleEdit}
         href="#manageProfiles" title={chrome.i18n.getMessage('manageProfiles')}
         className="button-manage-profile"/>,
      editor
    ];
  }
}

export default ProfileSelect;