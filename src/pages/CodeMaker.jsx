import '../assets/css/magic.less';
import React from 'react';
import PropTypes from "prop-types";
import {Link} from "react-router-dom";
import getRandomColor from "../tools/getRandomColor";

class CodeMaker extends React.Component {
  constructor(props) {
    super(props);

    this.refFrame = this.refFrame.bind(this);

    this.pageTitleMap = {
      search: 'kitSearch',
      selectors: 'kitSelectors',
      convert: 'kitConvert',
      auth: 'kitLogin',
      desc: 'kitDesc',
      save: 'kitSaveLoad',
    };

    this.frame = null;
  }

  refFrame(element) {
    this.frame = element;
  }

  render() {
    const menuItems = ['search', 'selectors', 'convert', 'auth', 'desc', 'save'].map(page => {
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
          <CodeMakerSearchPage/>
        );
        break;
      }
      case 'auth': {
        page = (
          <CodeMakerAuthPage/>
        );
        break;
      }
      case 'selectors': {
        page = (
          <CodeMakerSelectorsPage/>
        );
        break;
      }
      case 'convert': {
        page = (
          <CodeMakerConvertPage/>
        );
        break;
      }
      case 'desc': {
        page = (
          <CodeMakerDescPage/>
        );
        break;
      }
      case 'save': {
        page = (
          <CodeMakerSavePage/>
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
  page: PropTypes.string,
};

class CodeMakerSearchPage extends React.Component {
  render() {
    return (
      <div className="page search">
        <h2>{chrome.i18n.getMessage('kitSearch')}</h2>
        <label>
          <span>{chrome.i18n.getMessage('kitSearchUrl')}</span>
          <input type="text" data-id="search_url"/>
          <input type="button" data-id="search_open" value={chrome.i18n.getMessage('kitOpen')}/>
        </label>
        <label>
          <span>{chrome.i18n.getMessage('kitSearchQuery')}</span>
          <input type="text" data-id="search_request"/>
        </label>
        <label>
          <span>{chrome.i18n.getMessage('kitSearchQueryEncoding')}</span>
          <select data-id="search_queryEncoding" defaultValue="utf-8">
            <option value="utf-8">utf-8</option>
            <option value="cp1251">cp1251</option>
          </select>
        </label>
        <label>
          <span>{chrome.i18n.getMessage('kitPageCharset')}</span>
          <input type="text" data-id="search_charset" placeholder="auto"/>
        </label>
        <label>
          <span>{chrome.i18n.getMessage('kitPostParams')}</span>
          <input type="text" data-id="search_post" placeholder="key=value&key2=value2"/>
        </label>
        <label>
          <span>{chrome.i18n.getMessage('kitBaseUrl')}</span>
          <input type="text" data-id="search_root"/>
        </label>
      </div>
    );
  }
}

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

class CodeMakerConvertPage extends React.Component {
  render() {
    return (
      <div className="page convert">
        <h2>{chrome.i18n.getMessage('kitConvert')}</h2>

        <h3>{chrome.i18n.getMessage('kitAddTime')}</h3>
        <label>
          <span>{chrome.i18n.getMessage('kitRegexpPattern')}</span>
          <input data-id="convert_time_regexp" type="text"/>
          <span>{chrome.i18n.getMessage('kitReplaceString')}</span>
          <input data-id="convert_time_regexpText" type="text"/>
        </label>
        <label>
          <input data-id="convert_time_today" type="checkbox"/>
          <span>{chrome.i18n.getMessage('kitReplaceToday')}</span>
        </label>
        <label>
          <input data-id="convert_time_month" type="checkbox"/>
          <span>{chrome.i18n.getMessage('kitReplaceMonth')}</span>
        </label>
        <label>
          <span>{chrome.i18n.getMessage('kitUseTemplate')}</span>
          <select data-id="convert_time_format" defaultValue={'-'}>
            {['-', '2013-04-31[[[ 07]:03]:27]', '31-04-2013[[[ 07]:03]:27]', 'n day ago', '04-31-2013[[[ 07]:03]:27]', '2d 1h 0m 0s ago'].map(option => {
              return (
                <option key={option} value={option}>{option}</option>
              );
            })}
          </select>
        </label>
        <label>
          <span>{chrome.i18n.getMessage('kitSourceString')}</span>
          <input data-id="convert_time_original" type="text"/>
          <span>{chrome.i18n.getMessage('kitConvertedString')}</span>
          <input data-id="convert_time_converted" type="text"/>
        </label>
        <label>
          <span>{chrome.i18n.getMessage('kitResult')}</span>
          <input data-id="convert_time_result" type="text"/>
        </label>

        <h3>{chrome.i18n.getMessage('kitTorrentSize')}</h3>
        <label>
          <span>{chrome.i18n.getMessage('kitRegexpPattern')}</span>
          <input data-id="convert_size_regexp" type="text"/>
          <span>{chrome.i18n.getMessage('kitReplaceString')}</span>
          <input data-id="convert_size_regexpText" type="text"/>
        </label>
        <label>
          <input data-id="convert_size_convert" type="checkbox"/>
          <span>{chrome.i18n.getMessage('kitConvertToNumber')}</span>
        </label>
        <label>
          <span>{chrome.i18n.getMessage('kitSourceString')}</span>
          <input data-id="convert_size_original" type="text"/>
          <span>{chrome.i18n.getMessage('kitConvertedString')}</span>
          <input data-id="convert_size_converted" type="text"/>
        </label>
        <label>
          <span>{chrome.i18n.getMessage('kitResult')}</span>
          <input data-id="convert_size_result" type="text"/>
        </label>

        <h3>{chrome.i18n.getMessage('kitSeedCount')}</h3>
        <label>
          <span>{chrome.i18n.getMessage('kitRegexpPattern')}</span>
          <input data-id="convert_seed_regexp" type="text"/>
          <span>{chrome.i18n.getMessage('kitReplaceString')}</span>
          <input data-id="convert_seed_regexpText" type="text"/>
        </label>
        <label>
          <span>{chrome.i18n.getMessage('kitSourceString')}</span>
          <input data-id="convert_seed_original" type="text"/>
          <span>{chrome.i18n.getMessage('kitConvertedString')}</span>
          <input data-id="convert_seed_converted" type="text"/>
        </label>
        <label>
          <span>{chrome.i18n.getMessage('kitResult')}</span>
          <input data-id="convert_seed_result" type="text"/>
        </label>

        <h3>{chrome.i18n.getMessage('kitPeerCount')}</h3>
        <label>
          <span>{chrome.i18n.getMessage('kitRegexpPattern')}</span>
          <input data-id="convert_peer_regexp" type="text"/>
          <span>{chrome.i18n.getMessage('kitReplaceString')}</span>
          <input data-id="convert_peer_regexpText" type="text"/>
        </label>
        <label>
          <span>{chrome.i18n.getMessage('kitSourceString')}</span>
          <input data-id="convert_peer_original" type="text"/>
          <span>{chrome.i18n.getMessage('kitConvertedString')}</span>
          <input data-id="convert_peer_converted" type="text"/>
        </label>
        <label>
          <span>{chrome.i18n.getMessage('kitResult')}</span>
          <input data-id="convert_peer_result" type="text"/>
        </label>
      </div>
    );
  }
}

class CodeMakerDescPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      iconData: '',
    };

    this.handleIconClick = this.handleIconClick.bind(this);
  }
  generateIcon(color) {
    const icon = btoa(`<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 48 48"><circle cx="24" cy="24" r="24" fill="${color}" /></svg>`);
    return `data:image/svg+xml;base64,${icon}`;
  }
  componentDidMount() {
    if (!this.state.iconData) {
      this.handleIconClick();
    }
  }
  handleIconClick(e) {
    e && e.preventDefault();
    this.setState({
      iconData: getRandomColor(),
    });
  }
  render() {
    return (
      <div className="page desk">
        <h2>{chrome.i18n.getMessage('kitDesc')}</h2>
        <label>
          <span>{chrome.i18n.getMessage('kitIcon')}</span>
          <i onClick={this.handleIconClick} style={{
            backgroundImage: `url(${this.generateIcon(this.state.iconData)})`
          }} className="tracker_iconPic" data-id="desk_tracker_iconPic"/>
          <input type="file" data-id="desk_tracker_iconFile"/>
          <input type="hidden" data-id="desk_tracker_icon" value={this.state.iconData}/>
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

export default CodeMaker;