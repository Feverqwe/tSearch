import '../assets/css/magic.less';
import React from 'react';
import PropTypes from "prop-types";
import {Link} from "react-router-dom";
import getRandomColor from "../tools/getRandomColor";
import {inject, observer} from "mobx-react";
import RootStore from "../stores/RootStore";
import CodeStore from "../stores/CodeStore";
import getLogger from "../tools/getLogger";
import CodeMakerStore from "../stores/CodeMakerStore";
import convertCodeV1toV2 from "../tools/convertCodeV1toV2";
import convertCodeV2toV3 from "../tools/convertCodeV2toV3";
import BindInput from "../components/BindInput";
import ElementSelector from "../components/ElementSelector";
import PipelineSelector from "../components/PipelineSelector";

const logger = getLogger('codeMaker');

@inject('rootStore')
@observer
class CodeMaker extends React.Component {
  get codeMakerStore() {
    return this.props.rootStore.codeMaker;
  }

  pageTitleMap = {
    search: 'kitSearch',
    selectors: 'kitSelectors',
    auth: 'kitLogin',
    desc: 'kitDesc',
    save: 'kitSaveLoad',
  };

  frame = null;

  componentDidMount() {
    this.props.rootStore.createCodeMaker();
  }

  componentWillUnmount() {
    this.props.rootStore.destroyCodeMaker();
  }

  refFrame = (element) => {
    this.frame = element;
  };

  handleRequestPage = () => {
    return Promise.reject(new Error('Unimplemented'))
  };

  render() {
    if (!this.codeMakerStore) {
      return ('Loading...');
    }

    const menuItems = ['search', 'selectors', 'auth', 'desc', 'save'].map(page => {
      const isActive = this.props.page === page;
      const classList = [];
      if (isActive) {
        classList.push('active');
      }
      return (
        <Link key={page} className={classList.join(' ')}
              to={`/codeMaker/${page}`}>{chrome.i18n.getMessage(this.pageTitleMap[page])}</Link>
      );
    });

    let page = null;
    switch (this.props.page) {
      case 'search': {
        page = (
          <CodeMakerSearchPage onRequestPage={this.handleRequestPage} codeStore={this.codeMakerStore.code}/>
        );
        break;
      }
      case 'auth': {
        page = (
          <CodeMakerAuthPage onRequestPage={this.handleRequestPage} codeStore={this.codeMakerStore.code}/>
        );
        break;
      }
      case 'selectors': {
        page = (
          <CodeMakerSelectorsPage codeStore={this.codeMakerStore.code}/>
        );
        break;
      }
      case 'desc': {
        page = (
          <CodeMakerDescPage codeStore={this.codeMakerStore.code}/>
        );
        break;
      }
      case 'save': {
        page = (
          <CodeMakerSavePage codeMaker={this.codeMakerStore}/>
        );
        break;
      }
    }

    return (
      <div className="page-ctr page-ctr--code-maker">
        <div className="tools">
          <div className="top-menu" id="menu">
            {menuItems}
          </div>
          <div className="body" id="container">
            {page}
          </div>
          <div className="status_bar" id="status_bar"/>
        </div>
        <iframe ref={this.refFrame} sandbox="allow-same-origin allow-scripts"/>
      </div>
    );
  }
}

CodeMaker.propTypes = null && {
  rootStore: PropTypes.instanceOf(RootStore),
  page: PropTypes.string,
};


@inject('rootStore')
@observer
class CodeMakerSearchPage extends React.Component {
  state = {
    requestPageError: false
  };

  get codeSearchStore() {
    return this.props.codeStore.search;
  }

  handleRequestPage = (e) => {
    e.preventDefault();
    this.setState({
      requestPageError: false
    });
    const codeSearchStore = this.codeSearchStore;



    this.props.onRequestPage().catch(err => {
      logger.error('onRequestPage error', err);
      this.setState({
        requestPageError: true
      });
    });
  };

  requestPage = null;
  refRequestPage = (element) => {
    this.requestPage = element;
  };

  encoding = null;
  refEncoding = element => {
    this.encoding = element;
  };

  handleEncodingChange = e => {
    this.codeSearchStore.set('encoding', this.encoding.value);
  };

  render() {
    const requestPageClassList = [];
    if (this.state.requestPageError) {
      requestPageClassList.push('error')
    }

    return (
      <div className="page search">
        <h2>{chrome.i18n.getMessage('kitSearch')}</h2>
        <div className="field">
          <span className="field-name">{chrome.i18n.getMessage('kitSearchUrl')}</span>
          <BindInput className={requestPageClassList} store={this.codeSearchStore} id={'url'} type="text"/>
          {' '}
          <input onClick={this.handleRequestPage} type="button" value={chrome.i18n.getMessage('kitOpen')}/>
        </div>
        <div className="field">
          <span className="field-name">{chrome.i18n.getMessage('kitSearchQuery')}</span>
          <BindInput store={this.codeSearchStore} id={'query'} type="text"/>
        </div>
        <div className="field">
          <span className="field-name">{chrome.i18n.getMessage('kitSearchQueryEncoding')}</span>
          <select onChange={this.handleEncodingChange} ref={this.refEncoding} defaultValue={this.codeSearchStore.encoding}>
            <option value="">utf-8</option>
            <option value="cp1251">cp1251</option>
          </select>
        </div>
        <div className="field">
          <span className="field-name">{chrome.i18n.getMessage('kitPageCharset')}</span>
          <BindInput store={this.codeSearchStore} id={'charset'} type="text" placeholder="auto"/>
        </div>
        <div className="field">
          <span className="field-name">{chrome.i18n.getMessage('kitPostParams')}</span>
          <BindInput store={this.codeSearchStore} id={'body'} type="text" placeholder="key=value&key2=value2"/>
        </div>
        <div className="field">
          <span className="field-name">{chrome.i18n.getMessage('kitBaseUrl')}</span>
          <BindInput store={this.codeSearchStore} id={'baseUrl'} type="text" placeholder="auto"/>
        </div>
      </div>
    );
  }
}

CodeMakerSearchPage.propTypes = null && {
  rootStore: PropTypes.instanceOf(RootStore),
  codeStore: PropTypes.instanceOf(CodeStore),
  onRequestPage: PropTypes.func,
};

@inject('rootStore')
@observer
class CodeMakerAuthPage extends React.Component {
  get codeSearchAuth() {
    return this.props.codeStore.auth;
  }

  render() {
    return (
      <div className="page auth">
        <h2>{chrome.i18n.getMessage('kitLogin')}</h2>
        <div className="field">
          <span className="field-name">{chrome.i18n.getMessage('kitLoginUrl')}</span>
          <BindInput store={this.codeSearchAuth} id={'url'} type="text"/>
          <input type="button" data-id="auth_open" value={chrome.i18n.getMessage('kitOpen')}/>
        </div>
        <ElementSelector store={this.codeSearchAuth} id={'loginForm'} optional={true}
                         type="text" title={chrome.i18n.getMessage('kitLoginFormSelector')}/>
      </div>
    );
  }
}

CodeMakerAuthPage.propTypes = null && {
  rootStore: PropTypes.instanceOf(RootStore),
  codeStore: PropTypes.instanceOf(CodeStore),
  onRequestPage: PropTypes.func,
};

@inject('rootStore')
@observer
class CodeMakerSelectorsPage extends React.Component {
  get codeSearchSelectors() {
    return this.props.codeStore.selectors;
  }

  render() {
    return (
      <div className="page selectors">
        <h2>{chrome.i18n.getMessage('kitSelectors')}</h2>
        <ElementSelector store={this.codeSearchSelectors} id={'row'}
                         type="text" className={'input'} title={chrome.i18n.getMessage('kitRowSelector')}>
          {' '}
          <BindInput store={this.codeSearchSelectors} id={'isTableRow'} type="checkbox"/>
          {' '}
          <span>{chrome.i18n.getMessage('kitTableRow')}</span>
          {' '}
        </ElementSelector>
        <PipelineSelector store={this.codeSearchSelectors} id={'categoryTitle'} optional={true}
                          title={chrome.i18n.getMessage('kitCategoryName')}/>
        <PipelineSelector store={this.codeSearchSelectors} id={'categoryUrl'} optional={true}
                          title={chrome.i18n.getMessage('kitCategoryLink')}/>
        <PipelineSelector store={this.codeSearchSelectors} id={'title'}
                          title={chrome.i18n.getMessage('kitTorrentTitle')}/>
        <PipelineSelector store={this.codeSearchSelectors} id={'url'}
                          title={chrome.i18n.getMessage('kitTorrentLink')}/>
        <PipelineSelector store={this.codeSearchSelectors} id={'size'} optional={true}
                          title={chrome.i18n.getMessage('kitTorrentSize')}/>
        <PipelineSelector store={this.codeSearchSelectors} id={'downloadUrl'} optional={true}
                          title={chrome.i18n.getMessage('kitTorrentDownloadLink')}/>
        <PipelineSelector store={this.codeSearchSelectors} id={'seeds'} optional={true}
                          title={chrome.i18n.getMessage('kitSeedCount')}/>
        <PipelineSelector store={this.codeSearchSelectors} id={'peers'} optional={true}
                          title={chrome.i18n.getMessage('kitPeerCount')}/>
        <PipelineSelector store={this.codeSearchSelectors} id={'date'} optional={true}
                          title={chrome.i18n.getMessage('kitAddTime')}/>
        <div className="field">
          <span className="field-name">{chrome.i18n.getMessage('kitSkipFirstRows')}</span>
          <BindInput store={this.codeSearchSelectors} id={'skipFromStart'} type="number"/>
        </div>
        <div className="field">
          <span className="field-name">{chrome.i18n.getMessage('kitSkipLastRows')}</span>
          <BindInput store={this.codeSearchSelectors} id={'skipFromEnd'} type="number"/>
        </div>
        <PipelineSelector store={this.codeSearchSelectors} id={'nextPageUrl'}  optional={true}
                          title={chrome.i18n.getMessage('kitNextPageLink')}/>
      </div>
    );
  }
}

CodeMakerSelectorsPage.propTypes = null && {
  rootStore: PropTypes.instanceOf(RootStore),
  codeStore: PropTypes.instanceOf(CodeStore),
};

@inject('rootStore')
@observer
class CodeMakerDescPage extends React.Component {
  get codeStoreDescription() {
    return this.props.codeStore.description;
  }

  generateIcon(color) {
    if (!/^#/.test(color)) {
      return color;
    }
    const icon = btoa(`<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 48 48"><circle cx="24" cy="24" r="24" fill="${color}" /></svg>`);
    return `data:image/svg+xml;base64,${icon}`;
  }

  handleIconClick = e => {
    e.preventDefault();
    this.codeStoreDescription.set('icon', getRandomColor());
  };

  iconData = null;
  iconDataInput = element => {
    this.iconData = element;
  };

  handleIconDataChange = e => {
    this.codeStoreDescription.set('icon', this.iconData.value);
  };

  handleIconFileChange = e => {
    const files = this.iconFile.files;

    const readFile = file => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => {
          resolve(reader.result);
        };
        reader.onerror = e => {
          reject(new Error('Read file error'));
        };
        reader.readAsDataURL(file);
      }).then(data => {
        this.codeStoreDescription.set('icon', data);
      }).catch(err => {
        logger.error('readFile error', file.name, err);
      });
    };

    const imageType = /^image\/(x-icon|jpeg|png|svg)$/;
    for (let i = 0, file; file = files[i]; i++) {
      try {
        if (!imageType.test(file.type)) {
          throw new Error('Incorrect file type');
        }
        if (file.size > 1024 * 1024) {
          throw new Error('File size more then 1mb');
        }
        readFile(file);
      } catch (err) {
        logger('Skip file cause: ', file.name, err);
      }
    }
  };

  iconFile = null;
  iconFileInput = element => {
    this.iconFile = element;
  };

  render() {
    const codeStore = this.props.codeStore;

    return (
      <div className="page desk">
        <h2>{chrome.i18n.getMessage('kitDesc')}</h2>
        <div className="field">
          <span className="field-name">{chrome.i18n.getMessage('kitIcon')}</span>
          <i onClick={this.handleIconClick} style={{
            backgroundImage: `url(${this.generateIcon(codeStore.description.icon)})`
          }} className="tracker_iconPic" data-id="desk_tracker_iconPic"/>
          {' '}
          <input ref={this.iconDataInput} onChange={this.handleIconDataChange} data-id="desk_tracker_icon" value={codeStore.description.icon}/>
          <input ref={this.iconFileInput} onChange={this.handleIconFileChange} type="file" data-id="desk_tracker_iconFile"/>
        </div>
        <div className="field">
          <span className="field-name">{chrome.i18n.getMessage('kitTrackerTitle')}</span>
          <BindInput store={this.codeStoreDescription} id={'name'} type={'text'}/>
        </div>
        <div className="field">
          <span className="field-name">{chrome.i18n.getMessage('kitTrackerDesc')}</span>
          <BindInput store={this.codeStoreDescription} id={'description'} type={'text'}/>
        </div>
        <div className="field">
          <span className="field-name">{chrome.i18n.getMessage('kitTrackerDownloadUrl')}</span>
          <BindInput store={this.codeStoreDescription} id={'downloadUrl'} type={'text'}/>
        </div>
        <div className="field">
          <span className="field-name">{chrome.i18n.getMessage('kitTrackerVersion')}</span>
          <BindInput store={this.codeStoreDescription} id={'version'} type={'text'} placeholder="1.0"/>
        </div>
      </div>
    );
  }
}

CodeMakerDescPage.propTypes = null && {
  rootStore: PropTypes.instanceOf(RootStore),
  codeStore: PropTypes.instanceOf(CodeStore),
};

@inject('rootStore')
@observer
class CodeMakerSavePage extends React.Component {
  handleSetCode = e => {
    e.preventDefault();
    let code = JSON.parse(this.textarea.value);
    if (code.version === 1) {
      code = convertCodeV1toV2(code);
    }
    if (code.version === 2) {
      code = convertCodeV2toV3(code);
    }

    if (!code.description) {
      code.description = {};
    }
    if (!code.description.icon) {
      code.description.icon = getRandomColor();
    }
    if (!code.description.name) {
      code.description.name = '';
    }
    if (!code.description.version) {
      code.description.version = '1.0';
    }

    this.props.codeMaker.setCode(code);
  };

  handleGetCode = e => {
    e.preventDefault();
    this.textarea.value = JSON.stringify(this.props.codeMaker.code);
  };

  textarea = null;
  refTextarea = element => {
    this.textarea = element;
  };

  render() {
    return (
      <div className="page save">
        <h2>{chrome.i18n.getMessage('kitSaveLoad')}</h2>
        <div>
          <input onClick={this.handleGetCode} type="button"
                 value={chrome.i18n.getMessage('kitGetCode')}/>
          <input onClick={this.handleSetCode} type="button"
                 value={chrome.i18n.getMessage('kitReadCode')}/>
        </div>
        <label>
          <textarea ref={this.refTextarea} data-id="save_code_textarea" defaultValue={JSON.stringify(this.props.codeMaker.code)}/>
        </label>
      </div>
    );
  }
}

CodeMakerSavePage.propTypes = null && {
  rootStore: PropTypes.instanceOf(RootStore),
  codeMaker: PropTypes.instanceOf(CodeMakerStore),
};

export default CodeMaker;