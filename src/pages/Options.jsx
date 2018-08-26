import React from 'react';
import Header from "../components/Header";
import ScrollTop from "../components/ScrollTop";
import '../../src/assets/css/options.less';
import PropTypes from "prop-types";
import RootStore from "../stores/RootStore";
import {Link} from "react-router-dom";
import {inject, observer} from "mobx-react";


@inject('rootStore')
@observer
class Options extends React.Component {
  constructor(props) {
    super(props);
  }
  componentDidMount() {
    if (this.props.rootStore.options.state === 'idle') {
      this.props.rootStore.options.fetchOptions();
    }
  }
  render() {
    const options = this.props.rootStore.options;
    let page = null;

    switch (options.state) {
      case 'pending': {
        page = ('Loading...');
        break;
      }
      case 'error': {
        page = ('Error...');
        break;
      }
      case 'done': {
        switch (this.props.section) {
          case 'main': {
            page = (
              <div className="page page-basic">
                <h2 className="page__title">{chrome.i18n.getMessage('basic')}</h2>
                <OptionCheckbox name={'hidePeerRow'}/>
                <OptionCheckbox name={'hideSeedRow'}/>
                <OptionCheckbox name={'categoryWordFilter'}/>
                <OptionCheckbox name={'syncProfiles'}/>
                <OptionCheckbox name={'contextMenu'}/>
                <OptionCheckbox name={'disablePopup'}/>
                <OptionCheckbox name={'invertIcon'}/>
                <OptionCheckbox name={'doNotSendStatistics'}/>
              </div>
            );
            break;
          }
          case 'explorer': {
            const sections = Object.keys(options.options.explorerSections).map(name => {
              if (name === 'favorite') return null;
              return (
                <OptionCheckbox store={options.options.explorerSections} key={name} name={name}/>
              );
            });

            page = (
              <div className="page page-mainPage">
                <h2 className="page__title">{chrome.i18n.getMessage('mainPage')}</h2>
                <OptionCheckbox name={'originalPosterName'}/>
                <OptionCheckbox name={'favoriteSync'}/>
                <OptionText name={'kpFolderId'}/>
                <h2 className="page__sub_title">{chrome.i18n.getMessage('showSections')}</h2>
                <div className="mainPage__sections">{sections}</div>
              </div>
            );
            break;
          }
          case 'backup': {
            page = (
              <div className="page page-backup">
                <h2 className="page__title">{chrome.i18n.getMessage('backupRestore')}</h2>
                <div className="page__buttons">
                  <a type="button" href="#exportZip" className="button backup__export-zip">{chrome.i18n.getMessage('exportZip')}</a>
                  <a type="button" href="#importZip" className="button backup__import-zip">{chrome.i18n.getMessage('importZip')}</a>
                </div>
              </div>
            );
            break;
          }
        }
        break;
      }
      default: {
        page = ('Idle');
      }
    }

    return (
      <div>
        <Header {...this.props}/>
        <div className="main options-ctr">
          <div className="sections">
            <Link to="/options?section=main" className="sections__item" data-page="basic">{chrome.i18n.getMessage('basic')}</Link>
            <Link to="/options?section=explorer" className="sections__item" data-page="mainPage">{chrome.i18n.getMessage('mainPage')}</Link>
            <Link to="/options?section=backup" className="sections__item" data-page="backup">{chrome.i18n.getMessage('backupRestore')}</Link>
          </div>
          <div className="options">
            {page}
          </div>
          <div className="author">
            <a title="email: leonardspbox@gmail.com" href="mailto:leonardspbox@gmail.com">Anton</a>, 2016
          </div>
        </div>
        <ScrollTop/>
      </div>
    );
  }
}

Options.propTypes = null && {
  rootStore: PropTypes.instanceOf(RootStore),
  section: PropTypes.string,
};


@inject('rootStore')
@observer
class OptionCheckbox extends React.Component {
  constructor(props) {
    super(props);

    this.handleOptionChange = this.handleOptionChange.bind(this);
    this.refInput = this.refInput.bind(this);

    this.input = null;
  }
  handleOptionChange(e) {
    const name = this.props.name;
    this.store.setValue(name, this.input.checked);
    this.props.rootStore.options.save();
  }
  refInput(element) {
    this.input = element;
  }
  get store() {
    return this.props.store || this.props.rootStore.options.options;
  }
  render() {
    const name = this.props.name;

    return (
      <div className="option">
        <label>
          <input ref={this.refInput} defaultChecked={this.store[name]} onChange={this.handleOptionChange} type="checkbox"/>
          <span>{chrome.i18n.getMessage(name)}</span>
        </label>
      </div>
    );
  }
}

OptionCheckbox.propTypes = null && {
  rootStore: PropTypes.instanceOf(RootStore),
  name: PropTypes.string,
  store: PropTypes.object,
};


@inject('rootStore')
@observer
class OptionText extends React.Component {
  constructor(props) {
    super(props);

    this.handleOptionChange = this.handleOptionChange.bind(this);
    this.refInput = this.refInput.bind(this);

    this.input = null;
  }
  handleOptionChange(e) {
    const name = this.props.name;
    this.props.rootStore.options.options.setValue(name, this.input.value);
    this.props.rootStore.options.save();
  }
  refInput(element) {
    this.input = element;
  }
  render() {
    const options = this.props.rootStore.options;
    const name = this.props.name;

    return (
      <div className="option">
        <label>
          <span>{chrome.i18n.getMessage(name)}</span>:
          <input ref={this.refInput} defaultValue={options.options[name]} onChange={this.handleOptionChange} type="text"/>
        </label>
      </div>
    );
  }
}

OptionText.propTypes = null && {
  rootStore: PropTypes.instanceOf(RootStore),
  name: PropTypes.string,
};

export default Options;