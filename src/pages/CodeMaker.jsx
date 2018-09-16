import '../assets/css/magic.less';
import React from 'react';
import PropTypes from "prop-types";
import {Link} from "react-router-dom";
import getRandomColor from "../tools/getRandomColor";
import {inject, observer} from "mobx-react";
import RootStore from "../stores/RootStore";
import CodeStore from "../stores/CodeStore";
import getLogger from "../tools/getLogger";

const logger = getLogger('codeMaker');

@inject('rootStore')
@observer
class CodeMaker extends React.Component {
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

  handleRequestPage() {
    const searchStore = this.props.rootStore.codeMaker.code.search;

  }

  render() {
    if (!this.props.rootStore.codeMaker) {
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
          <CodeMakerSearchPage onRequestPage={this.handleRequestPage} codeStore={this.props.rootStore.codeMaker.code}/>
        );
        break;
      }
      case 'auth': {
        page = (
          <CodeMakerAuthPage onRequestPage={this.handleRequestPage} codeStore={this.props.rootStore.codeMaker.code}/>
        );
        break;
      }
      case 'selectors': {
        page = (
          <CodeMakerSelectorsPage codeStore={this.props.rootStore.codeMaker.code}/>
        );
        break;
      }
      case 'desc': {
        page = (
          <CodeMakerDescPage codeStore={this.props.rootStore.codeMaker.code}/>
        );
        break;
      }
      case 'save': {
        page = (
          <CodeMakerSavePage codeStore={this.props.rootStore.codeMaker.code}/>
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


class BindInput extends React.Component {
  input = null;
  refInput = element => {
    this.input = element;
  };
  handleChange = e => {
    if (this.props.type === 'checkbox') {
      this.props.store.set(this.props.id, this.input.checked);
    } else {
      let value = this.input.value;
      if (this.props.type === 'number') {
        value = parseInt(value, 10);
        if (!Number.isFinite(value)) {
          value = 0;
        }
      }
      this.props.store.set(this.props.id, value);
    }
  };
  render() {
    const {store, id, ...props} = this.props;

    if (props.type === 'checkbox') {
      props.defaultChecked = store[this.props.id];
    } else {
      props.defaultValue = store[this.props.id];
    }

    return (
      <input {...props} data-id={id} ref={this.refInput} onChange={this.handleChange}/>
    )
  }
}

class ElementSelector extends React.Component {
  get selectorStore() {
    return this.props.store[this.props.id];
  }
  input = null;
  refInput = element => {
    this.input = element;
  };
  handleChange = e => {
    this.selectorStore.set('selector', this.input.value);
  };
  render() {
    const {store, id, children, ...props} = this.props;

    props.defaultValue = this.selectorStore.selector;

    return [
      <input key={'input'} {...props} data-id={id} ref={this.refInput} onChange={this.handleChange}/>,
      children,
      <input key={'button'} type="button" data-id={`${id}-btn`} value={chrome.i18n.getMessage('kitSelect')}/>
    ]
  }
}

@observer
class PipelineSelector extends ElementSelector {
  get store() {
    return this.props.store;
  }

  optionalCheckbox = null;
  refOptionalCheckbox = element => {
    this.optionalCheckbox = element;
  };

  handleOptionalChange = e => {
    if (this.optionalCheckbox.checked) {
      if (!this.selectorStore) {
        this.store.set(this.props.id, {
          selector: this.input.value
        });
      }
    } else {
      if (this.selectorStore) {
        this.store.set(this.props.id, undefined);
      }
    }
  };

  render() {
    const {store, id, optional, ...props} = this.props;

    props.defaultValue = this.selectorStore && this.selectorStore.selector || '';

    const isDisabled = !this.selectorStore;
    let title = null;
    if (optional) {
      title = (
        <span key={'title'}>
          <input ref={this.refOptionalCheckbox} defaultChecked={!isDisabled} onChange={this.handleOptionalChange} type="checkbox" data-id={`${id}-optional`}/>
          <span>{this.props.title}</span>
        </span>
      );
    } else {
      title = (
        <span key={'title'}>{this.props.title}</span>
      );
    }


    return [
      title,
      <input disabled={isDisabled} key={'input'} {...props} data-id={id} ref={this.refInput} onChange={this.handleChange}/>,
      <input disabled={isDisabled} key={'output'} type="text" data-id={`${id}-result`} readOnly={true}/>,
      <input disabled={isDisabled} key={'button'} type="button" data-id={`${id}-btn`} value={chrome.i18n.getMessage('kitSelect')}/>
    ]
  }
}

CodeMaker.propTypes = null && {
  rootStore: PropTypes.instanceOf(RootStore),
  page: PropTypes.string,
};

@inject('rootStore')
@observer
class CodeMakerSearchPage extends React.Component {
  get codeSearchStore() {
    return this.props.codeStore.search;
  }

  handleRequestPage = (e) => {
    e.preventDefault();
    this.requestPage.classList.remove('error');
    this.props.onRequestPage().catch(err => {
      logger.error('onRequestPage error', err);
      if (this.requestPage) {
        this.requestPage.classList.add('error');
      }
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
    return (
      <div className="page search">
        <h2>{chrome.i18n.getMessage('kitSearch')}</h2>
        <label>
          <span>{chrome.i18n.getMessage('kitSearchUrl')}</span>
          <BindInput store={this.codeSearchStore} id={'url'} type="text"/>
          {' '}
          <input ref={this.refRequestPage} onClick={this.handleRequestPage} type="button" value={chrome.i18n.getMessage('kitOpen')}/>
        </label>
        <label>
          <span>{chrome.i18n.getMessage('kitSearchQuery')}</span>
          <BindInput store={this.codeSearchStore} id={'query'} type="text"/>
        </label>
        <label>
          <span>{chrome.i18n.getMessage('kitSearchQueryEncoding')}</span>
          <select onChange={this.handleEncodingChange} ref={this.refEncoding} defaultValue={this.codeSearchStore.encoding}>
            <option value="">auto</option>
            <option value="cp1251">cp1251</option>
          </select>
        </label>
        <label>
          <span>{chrome.i18n.getMessage('kitPageCharset')}</span>
          <BindInput store={this.codeSearchStore} id={'charset'} type="text" placeholder="auto"/>
        </label>
        <label>
          <span>{chrome.i18n.getMessage('kitPostParams')}</span>
          <BindInput store={this.codeSearchStore} id={'body'} type="text" placeholder="key=value&key2=value2"/>
        </label>
        <label>
          <span>{chrome.i18n.getMessage('kitBaseUrl')}</span>
          <BindInput store={this.codeSearchStore} id={'baseUrl'} type="text" placeholder="auto"/>
        </label>
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
        <label>
          <span>{chrome.i18n.getMessage('kitLoginUrl')}</span>
          <BindInput store={this.codeSearchAuth} id={'url'} type="text"/>
          <input type="button" data-id="auth_open" value={chrome.i18n.getMessage('kitOpen')}/>
        </label>
        <label>
          <span>{chrome.i18n.getMessage('kitLoginFormSelector')}</span>
          <ElementSelector store={this.codeSearchAuth} id={'selector'} type="text"/>
        </label>
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
        <label>
          <span>{chrome.i18n.getMessage('kitRowSelector')}</span>
          <ElementSelector store={this.codeSearchSelectors} id={'row'} type="text" className={'input'}>
            {' '}
            <BindInput store={this.codeSearchSelectors} id={'isTableRow'} type="checkbox"/>
            {' '}
            <span>{chrome.i18n.getMessage('kitTableRow')}</span>
            {' '}
          </ElementSelector>
        </label>
        <label>
          <PipelineSelector store={this.codeSearchSelectors} id={'categoryTitle'} optional={true}
            type={'text'} title={chrome.i18n.getMessage('kitCategoryName')}/>
        </label>
        <label>
          <PipelineSelector store={this.codeSearchSelectors} id={'categoryLink'} optional={true}
            type={'text'} title={chrome.i18n.getMessage('kitCategoryLink')}/>
        </label>
        <label>
          <PipelineSelector store={this.codeSearchSelectors} id={'title'}
            type={'text'} title={chrome.i18n.getMessage('kitTorrentTitle')}/>
        </label>
        <label>
          <PipelineSelector store={this.codeSearchSelectors} id={'link'}
            type={'text'} title={chrome.i18n.getMessage('kitTorrentLink')}/>
        </label>
        <label>
          <PipelineSelector store={this.codeSearchSelectors} id={'size'} optional={true}
            type={'text'} title={chrome.i18n.getMessage('kitTorrentSize')}/>
        </label>
        <label>
          <PipelineSelector store={this.codeSearchSelectors} id={'downloadLink'} optional={true}
            type={'text'} title={chrome.i18n.getMessage('kitTorrentDownloadLink')}/>
        </label>
        <label>
          <PipelineSelector store={this.codeSearchSelectors} id={'seeds'} optional={true}
            type={'text'} title={chrome.i18n.getMessage('kitSeedCount')}/>
        </label>
        <label>
          <PipelineSelector store={this.codeSearchSelectors} id={'peers'} optional={true}
            type={'text'} title={chrome.i18n.getMessage('kitPeerCount')}/>
        </label>
        <label>
          <PipelineSelector store={this.codeSearchSelectors} id={'date'} optional={true}
            type={'text'} title={chrome.i18n.getMessage('kitAddTime')}/>
        </label>
        <div className="label">
          <span>{chrome.i18n.getMessage('kitSkipFirstRows')}</span>
          <BindInput store={this.codeSearchSelectors} id={'skipFromStart'} type="number"/>
        </div>
        <div className="label">
          <span>{chrome.i18n.getMessage('kitSkipLastRows')}</span>
          <BindInput store={this.codeSearchSelectors} id={'skipFromEnd'} type="number"/>
        </div>
        <label>
          <PipelineSelector store={this.codeSearchSelectors} id={'nextPageLink'}  optional={true}
            type="text" title={chrome.i18n.getMessage('kitNextPageLink')}/>
        </label>
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

  constructor(props) {
    super(props);

    this.handleIconClick = this.handleIconClick.bind(this);
  }
  generateIcon(color) {
    if (!/^#/.test(color)) {
      return color;
    }
    const icon = btoa(`<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 48 48"><circle cx="24" cy="24" r="24" fill="${color}" /></svg>`);
    return `data:image/svg+xml;base64,${icon}`;
  }
  handleIconClick(e) {
    e.preventDefault();
    const codeStore = this.props.codeStore;
    codeStore.description.set('icon', getRandomColor());
  }
  render() {
    const codeStore = this.props.codeStore;

    return (
      <div className="page desk">
        <h2>{chrome.i18n.getMessage('kitDesc')}</h2>
        <label>
          <span>{chrome.i18n.getMessage('kitIcon')}</span>
          <i onClick={this.handleIconClick} style={{
            backgroundImage: `url(${this.generateIcon(codeStore.description.icon)})`
          }} className="tracker_iconPic" data-id="desk_tracker_iconPic"/>
          <input type="file" data-id="desk_tracker_iconFile"/>
          <input type="hidden" data-id="desk_tracker_icon" value={codeStore.description.icon}/>
        </label>
        <label>
          <span>{chrome.i18n.getMessage('kitTrackerTitle')}</span>
          <BindInput store={this.codeStoreDescription} id={'name'} type={'text'}/>
        </label>
        <label>
          <span>{chrome.i18n.getMessage('kitTrackerDesc')}</span>
          <BindInput store={this.codeStoreDescription} id={'description'} type={'text'}/>
        </label>
        <label>
          <span>{chrome.i18n.getMessage('kitTrackerDownloadUrl')}</span>
          <BindInput store={this.codeStoreDescription} id={'updateUrl'} type={'text'}/>
        </label>
        <label>
          <span>{chrome.i18n.getMessage('kitTrackerVersion')}</span>
          <BindInput store={this.codeStoreDescription} id={'version'} type={'text'} placeholder="1.0"/>
        </label>
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
  render() {
    return (
      <div className="page save">
        <h2>{chrome.i18n.getMessage('kitSaveLoad')}</h2>
        <div className="label">
          <input type="button" data-id="save_code_write"
                 value={chrome.i18n.getMessage('kitGetCode')}/>
          <input type="button" data-id="save_code_read"
                 value={chrome.i18n.getMessage('kitReadCode')}/>
        </div>
        <label>
          <textarea data-id="save_code_textarea" defaultValue={JSON.stringify(this.props.codeStore, null, 2)}/>
        </label>
      </div>
    );
  }
}

CodeMakerSavePage.propTypes = null && {
  rootStore: PropTypes.instanceOf(RootStore),
  codeStore: PropTypes.instanceOf(CodeStore),
};

export default CodeMaker;