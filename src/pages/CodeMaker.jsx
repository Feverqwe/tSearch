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
          <CodeMakerAuthPage codeStore={this.props.rootStore.codeMaker.code}/>
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
    console.log(this.encoding.value);
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
          <BindInput store={this.codeSearchStore} id={'baseUrl'} type="text"/>
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

class BindInput extends React.Component {
  input = null;
  refInput = element => {
    this.input = element;
  };
  handleChange = e => {
    if (this.props.type === 'checkbox') {
      this.props.store.set(this.props.id, this.input.checked);
    } else {
      this.props.store.set(this.props.id, this.input.value);
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

@inject('rootStore')
@observer
class CodeMakerAuthPage extends React.Component {
  render() {
    return (
      <div className="page auth">
        <h2>{chrome.i18n.getMessage('kitLogin')}</h2>
        <label>
          <span>{chrome.i18n.getMessage('kitLoginUrl')}</span>
          <input type="text" data-id="auth_url"/>
          <input type="button" data-id="auth_open" value={chrome.i18n.getMessage('kitOpen')}/>
        </label>
        <label>
          <span>{chrome.i18n.getMessage('kitLoginFormSelector')}</span>
          <input type="text" data-id="auth_input"/>
          <input type="button" data-id="auth_btn" value={chrome.i18n.getMessage('kitSelect')}/>
        </label>
      </div>
    );
  }
}

CodeMakerAuthPage.propTypes = null && {
  rootStore: PropTypes.instanceOf(RootStore),
  codeStore: PropTypes.instanceOf(CodeStore),
};

@inject('rootStore')
@observer
class CodeMakerSelectorsPage extends React.Component {
  render() {
    return (
      <div className="page selectors">
        <h2>{chrome.i18n.getMessage('kitSelectors')}</h2>
        <label>
          <span>{chrome.i18n.getMessage('kitRowSelector')}</span>
          <input type="text" data-id="selectors_list_input"/>
          <input type="checkbox" data-id="selectors_list_tableMode"/>
          <span>{chrome.i18n.getMessage('kitTableRow')}</span>
          <input type="button" data-id="selectors_list_btn" value={chrome.i18n.getMessage('kitSelect')}/>
        </label>
        <label>
          <span>
            <input type="checkbox" data-id="selectors_categoryName_enable"/>
            <span>{chrome.i18n.getMessage('kitCategoryName')}</span>
          </span>
          <input type="text" data-id="selectors_categoryName_input"/>
          <input type="text" data-id="selectors_categoryName_output"/>
          <span>{chrome.i18n.getMessage('kitAttribute')}</span>
          <input type="text" data-id="selectors_categoryName_attr"/>
          <input type="button" data-id="selectors_categoryName_btn"
                 value={chrome.i18n.getMessage('kitSelect')}/>
        </label>
        <label>
          <span>
            <input type="checkbox" data-id="selectors_categoryLink_enable"/>
            <span>{chrome.i18n.getMessage('kitCategoryLink')}</span>
          </span>
          <input type="text" data-id="selectors_categoryLink_input"/>
          <input type="text" data-id="selectors_categoryLink_output"/>
          <input type="button" data-id="selectors_categoryLink_btn"
                 value={chrome.i18n.getMessage('kitSelect')}/>
        </label>
        <label>
          <span>{chrome.i18n.getMessage('kitTorrentTitle')}</span>
          <input type="text" data-id="selectors_torrentName_input"/>
          <input type="text" data-id="selectors_torrentName_output"/>
          <input type="button" data-id="selectors_torrentName_btn"
                 value={chrome.i18n.getMessage('kitSelect')}/>
        </label>
        <label>
          <span>{chrome.i18n.getMessage('kitTorrentLink')}</span>
          <input type="text" data-id="selectors_torrentLink_input"/>
          <input type="text" data-id="selectors_torrentLink_output"/>
          <input type="button" data-id="selectors_torrentLink_btn"
                 value={chrome.i18n.getMessage('kitSelect')}/>
        </label>
        <label>
          <span>
            <input type="checkbox" data-id="selectors_size_enable"/>
            <span>{chrome.i18n.getMessage('kitTorrentSize')}</span>
          </span>
          <input type="text" data-id="selectors_size_input"/>
          <input type="text" data-id="selectors_size_output"/>
          <span>{chrome.i18n.getMessage('kitAttribute')}</span>
          <input type="text" data-id="selectors_size_attr"/>
          <input type="button" data-id="selectors_size_btn"
                 value={chrome.i18n.getMessage('kitSelect')}/>
        </label>
        <label>
          <span>
            <input type="checkbox" data-id="selectors_torrentDl_enable"/>
            <span>{chrome.i18n.getMessage('kitTorrentDownloadLink')}</span>
          </span>
          <input type="text" data-id="selectors_torrentDl_input"/>
          <input type="text" data-id="selectors_torrentDl_output"/>
          <input type="button" data-id="selectors_torrentDl_btn"
                 value={chrome.i18n.getMessage('kitSelect')}/>
        </label>
        <label>
          <span>
            <input type="checkbox" data-id="selectors_seed_enable"/>
            <span>{chrome.i18n.getMessage('kitSeedCount')}</span>
          </span>
          <input type="text" data-id="selectors_seed_input"/>
          <input type="text" data-id="selectors_seed_output"/>
          <input type="button" data-id="selectors_seed_btn"
                 value={chrome.i18n.getMessage('kitSelect')}/>
        </label>
        <label>
          <span>
            <input type="checkbox" data-id="selectors_peer_enable"/>
            <span>{chrome.i18n.getMessage('kitPeerCount')}</span>
          </span>
          <input type="text" data-id="selectors_peer_input"/>
          <input type="text" data-id="selectors_peer_output"/>
          <input type="button" data-id="selectors_peer_btn"
                 value={chrome.i18n.getMessage('kitSelect')}/>
        </label>
        <label>
          <span>
            <input type="checkbox" data-id="selectors_time_enable"/>
            <span>{chrome.i18n.getMessage('kitAddTime')}</span>
          </span>
          <input type="text" data-id="selectors_time_input"/>
          <input type="text" data-id="selectors_time_output"/>
          <span>{chrome.i18n.getMessage('kitAttribute')}</span>
          <input type="text" data-id="selectors_time_attr"/>
          <input type="button" data-id="selectors_time_btn"
                 value={chrome.i18n.getMessage('kitSelect')}/>
        </label>
        <div className="label">
          <span>{chrome.i18n.getMessage('kitSkipFirstRows')}</span>
          <input type="number" data-id="selectors_skip_first" defaultValue={0}/>
        </div>
        <div className="label">
          <span>{chrome.i18n.getMessage('kitSkipLastRows')}</span>
          <input type="number" data-id="selectors_skip_last" defaultValue={0}/>
        </div>
        <label>
          <span>
            <input type="checkbox" data-id="selectors_nextPageLink_enable"/>
            <span>{chrome.i18n.getMessage('kitNextPageLink')}</span>
          </span>
          <input type="text" data-id="selectors_nextPageLink_input"/>
          <input type="text" data-id="selectors_nextPageLink_output"/>
          <input type="button" data-id="selectors_nextPageLink_btn"
                 value={chrome.i18n.getMessage('kitSelect')}/>
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
          <input type="text" data-id="desk_tracker_title"/>
        </label>
        <label>
          <span>{chrome.i18n.getMessage('kitTrackerDesc')}</span>
          <input type="text" data-id="desk_tracker_desk"/>
        </label>
        <label>
          <span>{chrome.i18n.getMessage('kitTrackerDownloadUrl')}</span>
          <input type="text" data-id="desk_tracker_downloadUrl"/>
        </label>
        <label>
          <span>{chrome.i18n.getMessage('kitTrackerVersion')}</span>
          <input type="text" data-id="desk_tracker_tVersion" placeholder="1.0"/>
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
          <textarea data-id="save_code_textarea"/>
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