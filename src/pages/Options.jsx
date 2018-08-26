import React from 'react';
import Header from "../components/Header";
import ScrollTop from "../components/ScrollTop";
import '../../src/assets/css/options.less';
import PropTypes from "prop-types";
import RootStore from "../stores/RootStore";
import {Link} from "react-router-dom";

class Options extends React.Component {
  constructor(props) {
    super(props);


  }
  render() {
    let page = null;
    switch (this.props.section) {
      case 'main': {
        page = (
          <div className="page page-basic">
            <h2 className="page__title">{chrome.i18n.getMessage('basic')}</h2>
            <div className="option">
              <label>
                <input type="checkbox" data-option="hidePeerRow"/>
                <span>{chrome.i18n.getMessage('hidePeerRow')}</span>
              </label>
            </div>
            <div className="option">
              <label>
                <input type="checkbox" data-option="hideSeedRow"/>
                <span>{chrome.i18n.getMessage('hideSeedRow')}</span>
              </label>
            </div>
            <div className="option">
              <label>
                <input type="checkbox" data-option="categoryWordFilter"/>
                <span>{chrome.i18n.getMessage('categoryWordFilter')}</span>
              </label>
            </div>
            <div className="option">
              <label>
                <input type="checkbox" data-option="syncProfiles"/>
                <span>{chrome.i18n.getMessage('syncProfiles')}</span>
              </label>
            </div>
            <div className="option">
              <label>
                <input type="checkbox" data-option="contextMenu"/>
                <span>{chrome.i18n.getMessage('contextMenu')}</span>
              </label>
            </div>
            <div className="option">
              <label>
                <input type="checkbox" data-option="disablePopup"/>
                <span>{chrome.i18n.getMessage('disablePopup')}</span>
              </label>
            </div>
            <div className="option">
              <label>
                <input type="checkbox" data-option="invertIcon"/>
                <span>{chrome.i18n.getMessage('invertIcon')}</span>
              </label>
            </div>
            <div className="option">
              <label>
                <input type="checkbox" data-option="doNotSendStatistics"/>
                <span>{chrome.i18n.getMessage('doNotSendStatistics')}</span>
              </label>
            </div>
          </div>
        );
        break;
      }
      case 'explorer': {
        page = (
          <div className="page page-mainPage">
            <h2 className="page__title">{chrome.i18n.getMessage('mainPage')}</h2>
            <div className="option">
              <label>
                <input type="checkbox" data-option="originalPosterName"/>
                <span>{chrome.i18n.getMessage('originalPosterName')}</span>
              </label>
            </div>
            <div className="option">
              <label>
                <input type="checkbox" data-option="favoriteSync"/>
                <span>{chrome.i18n.getMessage('favoriteSync')}</span>
              </label>
            </div>
            <div className="option">
              <label>
                <span>{chrome.i18n.getMessage('kpFolderId')}</span>:
                <input type="text" data-option="kpFolderId"/>
              </label>
            </div>
            <h2 className="page__sub_title">{chrome.i18n.getMessage('showSections')}</h2>
            <div className="mainPage__sections"></div>
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

export default Options;