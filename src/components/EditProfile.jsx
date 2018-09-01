import {inject, observer} from "mobx-react";
import React from "react";
import PropTypes from "prop-types";
import RootStore from "../stores/RootStore";


@inject('rootStore')
@observer
class EditProfile extends React.Component {
  constructor(props) {
    super(props);

    this.handleChangeName = this.handleChangeName.bind(this);
    this.refName = this.refName.bind(this);

    props.rootStore.profileEditor.setProfileById(props.id);

    this.profile = props.rootStore.profileEditor.profile;

    this.name = null;
  }
  handleChangeName() {
    this.profile.setName(this.name.value);
  }
  refName(element) {
    this.name = element;
  }
  render() {
    return (
      <div className="manager">
        <div className="manager__body">
          <div className="manager__sub_header sub_header__profile">
            <div className="profile__input">
              <input ref={this.refName} className="input__input" type="text" defaultValue={this.profile.name} onChange={this.handleChangeName}/>
            </div>
          </div>
          {/*<div className="manager__sub_header sub_header__filter">
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
          </div>*/}
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

export default EditProfile;