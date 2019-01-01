import '../../src/assets/css/options.less';
import React from 'react';
import Header from "../components/Header";
import ScrollTop from "../components/ScrollTop";
import PropTypes from "prop-types";
import {Link} from "react-router-dom";
import {inject, observer} from "mobx-react";
import getTitle from "../tools/getTitle";
import promiseFinally from "../tools/promiseFinally";


@inject('rootStore')
@observer
class Options extends React.Component {
  static propTypes = {
    rootStore: PropTypes.object,
    page: PropTypes.string,
  };

  constructor(props) {
    super(props);

    this.state = {
      importLock: false,
      exportLock: false,
    };

    if (this.optionsStore.state === 'idle') {
      this.optionsStore.fetchOptions();
    }
  }

  componentDidMount() {
    document.title = getTitle('Options');
  }

  /**@return OptionsStore*/
  get optionsStore() {
    return this.props.rootStore.options;
  }

  handleExport = (e) => {
    e.preventDefault();
    this.state.exportLock = true;
    this.optionsStore.exportZip().then(...promiseFinally(() => {
      this.state.exportLock = false;
    }));
  };

  handleImport = (e) => {
    e.preventDefault();
    this.state.importLock = true;
    this.optionsStore.importZip().then(...promiseFinally(() => {
      this.state.importLock = false;
    }));
  };

  render() {
    const optionsStore = this.optionsStore;
    if (optionsStore.state !== 'done') {
      return (`Loading options: ${optionsStore.state}`);
    }

    let page = null;
    switch (this.props.page) {
      case 'main': {
        page = (
          <div className="page page-basic">
            <h2 className="page__title">{chrome.i18n.getMessage('basic')}</h2>
            <OptionCheckbox name={'hidePeerRow'}/>
            <OptionCheckbox name={'hideSeedRow'}/>
            <OptionCheckbox name={'categoryWordFilter'}/>
            <OptionCheckbox name={'contextMenu'}/>
            <OptionCheckbox name={'disablePopup'}/>
            <OptionCheckbox name={'invertIcon'}/>
            <OptionCheckbox name={'defineCategory'}/>
            <OptionCheckbox name={'requestQueryDescription'}/>
            <OptionCheckbox name={'doNotSendStatistics'}/>
          </div>
        );
        break;
      }
      case 'explorer': {
        const sections = Object.keys(optionsStore.options.explorerSections).map(name => {
          if (name === 'favorite') return null;
          return (
            <OptionCheckbox store={optionsStore.options.explorerSections} key={name} name={name}/>
          );
        });

        page = (
          <div className="page page-mainPage">
            <h2 className="page__title">{chrome.i18n.getMessage('mainPage')}</h2>
            <OptionCheckbox name={'originalPosterName'}/>
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
              <a onClick={this.handleExport} type="button" href="#"
                 className="button backup__export-zip">{chrome.i18n.getMessage('exportZip')}</a>
              <a onClick={this.handleImport} type="button" href="#"
                 className="button backup__import-zip">{chrome.i18n.getMessage('importZip')}</a>
            </div>
          </div>
        );
        break;
      }
    }

    return (
      <div className="page-ctr">
        <Header {...this.props}/>
        <div className="main options-ctr">
          <div className="sections">
            <Link to="/options/main" className="sections__item" data-page="basic">{chrome.i18n.getMessage('basic')}</Link>
            <Link to="/options/explorer" className="sections__item" data-page="mainPage">{chrome.i18n.getMessage('mainPage')}</Link>
            <Link to="/options/backup" className="sections__item" data-page="backup">{chrome.i18n.getMessage('backupRestore')}</Link>
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


@inject('rootStore')
@observer
class OptionCheckbox extends React.Component {
  static propTypes = {
    rootStore: PropTypes.object,
    name: PropTypes.string.isRequired,
    store: PropTypes.object,
  };

  constructor(props) {
    super(props);

    this.input = null;
  }

  handleOptionChange = (e) => {
    const name = this.props.name;
    this.store.setValue(name, this.input.checked);
    this.props.rootStore.options.save();
  };

  refInput = (element) => {
    this.input = element;
  };

  get store() {
    return this.props.store || this.props.rootStore.options.options;
  }

  render() {
    const name = this.props.name;

    return (
      <div className="option">
        <label>
          <input ref={this.refInput} checked={this.store[name]} onChange={this.handleOptionChange} type="checkbox"/>
          <span>{chrome.i18n.getMessage(name)}</span>
        </label>
      </div>
    );
  }
}


@inject('rootStore')
@observer
class OptionText extends React.Component {
  static propTypes = {
    rootStore: PropTypes.object,
    name: PropTypes.string,
  };

  constructor(props) {
    super(props);

    this.input = null;
  }

  handleOptionChange = (e) => {
    const name = this.props.name;
    this.props.rootStore.options.options.setValue(name, this.input.value);
    this.props.rootStore.options.save();
  };

  refInput = (element) => {
    this.input = element;
  };

  render() {
    const options = this.props.rootStore.options.options;
    const name = this.props.name;

    return (
      <div className="option">
        <label>
          <span>{chrome.i18n.getMessage(name)}</span>:
          <input ref={this.refInput} defaultValue={options[name]} onChange={this.handleOptionChange} type="text"/>
        </label>
      </div>
    );
  }
}

export default Options;