import '../assets/css/magic.less';
import React from 'react';
import PropTypes from "prop-types";
import {Link} from "react-router-dom";
import getRandomColor from "../tools/getRandomColor";
import {inject, observer} from "mobx-react";
import getLogger from "../tools/getLogger";
import convertCodeV1toV2 from "../tools/convertCodeV1toV2";
import convertCodeV2toV3 from "../tools/convertCodeV2toV3";
import BindInput from "../components/BindInput";
import ElementSelector from "../components/ElementSelector";
import PipelineSelector from "../components/PipelineSelector";
import ExKitTracker from "../sandbox/exKitTracker";
import exKitRequestOptionsNormalize from "../tools/exKitRequestOptionsNormalize";
import CodeMakerFrame from "../components/CodeMakerFrame";
import getTitle from "../tools/getTitle";
import {autorun} from "mobx";

const logger = getLogger('codeMaker');

@inject('rootStore')
@observer
class CodeMaker extends React.Component {
  static propTypes = {
    rootStore: PropTypes.object,
    page: PropTypes.string,
  };

  constructor(props) {
    super(props);

    this.props.rootStore.createCodeMaker();
  }

  componentDidMount() {
    document.title = getTitle('Code maker');
  }

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

  componentWillUnmount() {
    this.props.rootStore.destroyCodeMaker();
  }

  frame = null;
  refFrame = (element) => {
    this.frame = element && element.wrappedInstance;
  };

  handleResolvePath = (path, options) => {
    return this.frame.resolvePath(path, options);
  };

  handleHighlightPath = (path, options) => {
    return this.frame.highlightPath(path, options);
  };

  render() {
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
          <CodeMakerSearchPage codeStore={this.codeMakerStore.code}/>
        );
        break;
      }
      case 'auth': {
        page = (
          <CodeMakerAuthPage
            onResolvePath={this.handleResolvePath}
            onHighlightPath={this.handleHighlightPath}
            codeStore={this.codeMakerStore.code}
          />
        );
        break;
      }
      case 'selectors': {
        page = (
          <CodeMakerSelectorsPage
            onResolvePath={this.handleResolvePath}
            onHighlightPath={this.handleHighlightPath}
            codeStore={this.codeMakerStore.code}
          />
        );
        break;
      }
      case 'desc': {
        page = (
          <CodeMakerDescriptionPage codeStore={this.codeMakerStore.code}/>
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

    let frame = null;
    if (this.codeMakerStore.frame.options) {
      frame = (
        <CodeMakerFrame ref={this.refFrame} key={`frame_${JSON.stringify(this.codeMakerStore.frame.options)}`}/>
      );
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
          <div className="status_bar" id="status_bar">
            {this.codeMakerStore.frame.path}
          </div>
        </div>
        {frame}
      </div>
    );
  }
}

@inject('rootStore')
@observer
class CodeMakerSearchPage extends React.Component {
  static propTypes = {
    rootStore: PropTypes.object,
    codeStore: PropTypes.object,
  };

  get frameStore() {
    return this.props.rootStore.codeMaker.frame;
  }

  /**@return CodeSearchStore*/
  get codeSearchStore() {
    return this.props.codeStore.search;
  }

  handleRequestPage = (e) => {
    e.preventDefault();

    const session = {};
    const query = this.searchQuery.value;
    const tracker = new CodeMakerExKitTracker();
    tracker.code = this.props.codeStore.getSnapshot();
    return Promise.resolve().then(() => {
      return tracker.search(session, query);
    }).then(options => {
      options._ = Date.now();
      this.frameStore.setOptions(options);
    });
  };

  encoding = null;
  refEncoding = element => {
    this.encoding = element;
  };

  handleEncodingChange = e => {
    this.codeSearchStore.set('encoding', this.encoding.value);
  };

  searchQuery = null;
  refSearchQuery = (element) => {
    this.searchQuery = element;
  };

  handleMethodChange = e => {
    this.codeSearchStore.set('method', this.method.value);
  };

  method = null;
  refMethod = (element) => {
    this.method = element;
  };

  render() {
    const requestPageClassList = [];
    if (this.frameStore.state === 'error') {
      requestPageClassList.push('error')
    }

    let postBody = null;
    if (this.codeSearchStore.method === 'POST' || this.codeSearchStore.body) {
      postBody = (
        <div className="field">
          <span className="field-name">{chrome.i18n.getMessage('kitPostBody')}</span>
          <BindInput store={this.codeSearchStore} id={'body'} type="text" placeholder="key=value&key2=value2"/>
        </div>
      );
    }

    return (
      <div className="page search">
        <h2>{chrome.i18n.getMessage('kitSearch')}</h2>
        <div className="field">
          <form onSubmit={this.handleRequestPage}>
            <span className="field-name">{chrome.i18n.getMessage('kitSearchUrl')}</span>
            <BindInput className={requestPageClassList} store={this.codeSearchStore} id={'url'} type="text"/>
            <input ref={this.refSearchQuery} type="text" placeholder="Search query"/>
            {' '}
            <input type="submit" value={chrome.i18n.getMessage('kitOpen')}/>
          </form>
        </div>
        <div className="field">
          <span className="field-name">{chrome.i18n.getMessage('kitSearchMethod')}</span>
          <select onChange={this.handleMethodChange} ref={this.refMethod} defaultValue={this.codeSearchStore.method}>
            <option value="GET">GET</option>
            <option value="POST">POST</option>
          </select>
        </div>
        <div className="field">
          <span className="field-name">{chrome.i18n.getMessage('kitQuery')}</span>
          <BindInput store={this.codeSearchStore} id={'query'} type="text"/>
        </div>
        {postBody}
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
      </div>
    );
  }
}

@inject('rootStore')
@observer
class CodeMakerAuthPage extends React.Component {
  static propTypes = {
    rootStore: PropTypes.object,
    codeStore: PropTypes.object,
    onResolvePath: PropTypes.func,
    onHighlightPath: PropTypes.func,
  };

  get frameStore() {
    return this.props.rootStore.codeMaker.frame;
  }

  get codeSearchAuth() {
    return this.props.codeStore.auth;
  }

  handleSubmit = e => {
    e.preventDefault();
    const tracker = new CodeMakerExKitTracker();
    tracker.code = this.props.codeStore.getSnapshot();
    const options = {
      method: 'GET',
      url: tracker.code.auth.url,
    };
    options._ = Date.now();
    this.frameStore.setOptions(options);
  };

  render() {
    const requestPageClassList = [];
    if (this.frameStore.state === 'error') {
      requestPageClassList.push('error')
    }

    return (
      <div className="page auth">
        <h2>{chrome.i18n.getMessage('kitLogin')}</h2>
        <div className="field">
          <form onSubmit={this.handleSubmit}>
            <span className="field-name">{chrome.i18n.getMessage('kitLoginUrl')}</span>
            <BindInput className={requestPageClassList.join(' ')} store={this.codeSearchAuth} id={'url'} type="text"/>
            <input type="submit" data-id="auth_open" value={chrome.i18n.getMessage('kitOpen')}/>
          </form>
        </div>
        <ElementSelector store={this.codeSearchAuth} onResolvePath={this.props.onResolvePath} onHighlightPath={this.props.onHighlightPath} id={'loginForm'} optional={true}
                         type="text" title={chrome.i18n.getMessage('kitLoginFormSelector')}/>
      </div>
    );
  }
}

@inject('rootStore')
@observer
class CodeMakerSelectorsPage extends React.Component {
  static propTypes = {
    rootStore: PropTypes.object,
    codeStore: PropTypes.object,
    onResolvePath: PropTypes.func,
    onHighlightPath: PropTypes.func,
  };

  get codeSearchSelectors() {
    return this.props.codeStore.selectors;
  }

  outputAutorun = null;
  componentWillUnmount() {
    if (this.outputAutorun) {
      this.outputAutorun();
      this.outputAutorun = null;
    }
  }

  activeSelector = null;
  setActiveSelector = (component) => {
    if (this.activeSelector !== component) {
      if (this.outputAutorun) {
        this.outputAutorun();
        this.outputAutorun = null;
      }

      this.activeSelector = component;

      this.outputAutorun = autorun(() => {
        if (this.activeSelector && this.activeSelector.selectorStore) {
          this.activeSelector.updateResult();
        }
      });
    }
  };

  render() {
    const pipelineProps = {
      store: this.codeSearchSelectors,
      onResolvePath: this.props.onResolvePath,
      onHighlightPath: this.props.onHighlightPath,
      setActiveSelector: this.setActiveSelector,
    };

    return (
      <div className="page selectors">
        <h2>{chrome.i18n.getMessage('kitSelectors')}</h2>
        <ElementSelector {...pipelineProps} id={'row'} type="text"
          className={'input'} title={chrome.i18n.getMessage('kitRowSelector')}/>
        <div className="field skip-field">
          <div className={'field-left'}>
            <span className="field-name">{chrome.i18n.getMessage('kitSkip')}</span>
          </div>
          <div className={'field-right'}>
            <span>{chrome.i18n.getMessage('kitSkipTop')}</span>
            {' '}
            <BindInput store={this.codeSearchSelectors} id={'skipFromStart'} type="number"/>
            {' '}
            <span>{chrome.i18n.getMessage('kitSkipEnd')}</span>
            {' '}
            <BindInput store={this.codeSearchSelectors} id={'skipFromEnd'} type="number"/>
          </div>
        </div>
        <PipelineSelector {...pipelineProps} id={'categoryTitle'} optional={true} container={'row'}
          title={chrome.i18n.getMessage('kitCategoryName')}/>
        <PipelineSelector {...pipelineProps} id={'categoryUrl'} optional={true} container={'row'}
          title={chrome.i18n.getMessage('kitCategoryLink')}/>
        <PipelineSelector {...pipelineProps} id={'title'} container={'row'}
          title={chrome.i18n.getMessage('kitTorrentTitle')}/>
        <PipelineSelector {...pipelineProps} id={'url'} container={'row'}
          title={chrome.i18n.getMessage('kitTorrentLink')}/>
        <PipelineSelector {...pipelineProps} id={'size'} optional={true} container={'row'}
          title={chrome.i18n.getMessage('kitTorrentSize')}/>
        <PipelineSelector {...pipelineProps} id={'downloadUrl'} optional={true} container={'row'}
          title={chrome.i18n.getMessage('kitTorrentDownloadLink')}/>
        <PipelineSelector {...pipelineProps} id={'seeds'} optional={true} container={'row'}
          title={chrome.i18n.getMessage('kitSeedCount')}/>
        <PipelineSelector {...pipelineProps} id={'peers'} optional={true} container={'row'}
          title={chrome.i18n.getMessage('kitPeerCount')}/>
        <PipelineSelector {...pipelineProps} id={'date'} optional={true} container={'row'}
          title={chrome.i18n.getMessage('kitAddTime')}/>
        <PipelineSelector {...pipelineProps} id={'nextPageUrl'}  optional={true}
          title={chrome.i18n.getMessage('kitNextPageLink')}/>
      </div>
    );
  }
}

@inject('rootStore')
@observer
class CodeMakerDescriptionPage extends React.Component {
  static propTypes = {
    rootStore: PropTypes.object,
    codeStore: PropTypes.object,
  };

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
          <span className="field-name">{chrome.i18n.getMessage('kitTrackerUrl')}</span>
          <BindInput store={this.codeStoreDescription} id={'url'} type="text" placeholder="auto"/>
        </div>
        <div className="field">
          <span className="field-name">{chrome.i18n.getMessage('kitTrackerDesc')}</span>
          <BindInput store={this.codeStoreDescription} id={'description'} type={'text'}/>
        </div>
        <div className="field">
          <span className="field-name">{chrome.i18n.getMessage('kitTrackerUpdateUrl')}</span>
          <BindInput store={this.codeStoreDescription} id={'updateUrl'} type={'text'}/>
        </div>
        <div className="field">
          <span className="field-name">{chrome.i18n.getMessage('kitTrackerIsDownloadUrl')}</span>
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

@inject('rootStore')
@observer
class CodeMakerSavePage extends React.Component {
  static propTypes = {
    rootStore: PropTypes.object,
    codeMaker: PropTypes.object,
  };

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
    this.textarea.value = this.props.codeMaker.codeJson;
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
          <textarea ref={this.refTextarea} data-id="save_code_textarea" defaultValue={this.props.codeMaker.codeJson}/>
        </label>
      </div>
    );
  }
}

class CodeMakerExKitTracker extends ExKitTracker {
  request(session, rawOptions) {
    const {options} = exKitRequestOptionsNormalize(rawOptions);
    return options;
  }
}

export default CodeMaker;