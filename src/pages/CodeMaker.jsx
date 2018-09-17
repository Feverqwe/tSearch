import '../assets/css/magic.less';
import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from "prop-types";
import {Link} from "react-router-dom";
import getRandomColor from "../tools/getRandomColor";
import {inject, observer} from "mobx-react";
import RootStore from "../stores/RootStore";
import CodeStore, {MethodStore, methods} from "../stores/CodeStore";
import getLogger from "../tools/getLogger";

const Sortable = require('sortablejs');

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

  handleRequestPage = () => {
    const searchStore = this.props.rootStore.codeMaker.code.search;

  };

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

CodeMaker.propTypes = null && {
  rootStore: PropTypes.instanceOf(RootStore),
  page: PropTypes.string,
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

    const title = (
      <label className="field-name">{this.props.title}</label>
    );

    return (
      <div className="field">
        {title}
        <input {...props} data-id={id} ref={this.refInput} onChange={this.handleChange}/>
        {children}
        <input type="button" data-id={`${id}-btn`} value={chrome.i18n.getMessage('kitSelect')}/>
      </div>
    )
  }
}

@observer
class PipelineSelector extends ElementSelector {
  state = {
    showAddDialog: false,
  };

  get store() {
    return this.props.store;
  }

  sortable = null;
  refSortable = node => {
    if (!node) {
      if (this.sortable) {
        this.sortable.destroy();
        this.sortable = null;
      }
    } else
    if (!this.sortable) {
      this.sortable = new Sortable(node, {
        group: {
          name: 'methods',
          pull: false,
          put: false
        },
        handle: '.move',
        draggable: '.method-wrapper',
        animation: 150,
        onStart: () => {
          node.classList.add('sorting');
        },
        onEnd: e => {
          node.classList.remove('sorting');

          const itemNode = e.item;
          const prevNode = itemNode.previousElementSibling;
          const nextNode = itemNode.nextElementSibling;
          const index = itemNode.dataset.index;
          const prevIndex = prevNode && prevNode.dataset.index;
          const nextIndex = nextNode && nextNode.dataset.index;

          this.selectorStore.moveMethod(index, prevIndex, nextIndex);
        }
      });
    }
  };

  optionalCheckbox = null;
  refOptionalCheckbox = element => {
    this.optionalCheckbox = element;
  };

  handleOptionalChange = e => {
    if (this.optionalCheckbox.checked) {
      if (!this.selectorStore) {
        let pipeline = null;
        if (['seeds', 'peers'].indexOf(this.props.id) !== -1) {
          pipeline = [{
            name: 'getText'
          }, {
            name: 'toInt'
          }];
        } else
        if (['size'].indexOf(this.props.id) !== -1) {
          pipeline = [{
            name: 'getText'
          }, {
            name: 'parseSize'
          }];
        } else
        if (/Link$/.test(this.props.id)) {
          pipeline = [{
            name: 'getProp',
            args: ['href']
          }];
        } else {
          pipeline = [{
            name: 'getText'
          }];
        }
        this.store.set(this.props.id, {
          selector: this.input.value,
          pipeline: pipeline
        });
      }
    } else {
      if (this.selectorStore) {
        this.store.set(this.props.id, undefined);
      }
    }
  };

  handleShowDialod = e => {
    e.preventDefault();
    this.setState({
      showAddDialog: true
    });
  };

  closeDialog = () => {
    this.setState({
      showAddDialog: false
    });
  };

  addMethod = (method, args) => {
    this.selectorStore.addMethod(method, args);
    this.closeDialog();
  };

  handleRemoveMethod = method => {
    this.selectorStore.removeMethod(method);
  };

  render() {
    const {id, optional} = this.props;

    const isDisabled = !this.selectorStore;
    let title = null;
    if (optional) {
      title = (
        <label className="field-name">
          <input ref={this.refOptionalCheckbox} defaultChecked={!isDisabled} onChange={this.handleOptionalChange} type="checkbox" data-id={`${id}-optional`}/>
          <span>{this.props.title}</span>
        </label>
      );
    } else {
      title = (
        <label className="field-name">{this.props.title}</label>
      );
    }

    let defaultValue = '';
    let pipeline = [];
    if (this.selectorStore) {
      defaultValue = this.selectorStore.selector || '';

      pipeline = this.selectorStore.pipeline.map((method, index) => {
        return (
          <Method key={`${index}_${method.name}`} index={index} method={method}
            onRemove={this.handleRemoveMethod}/>
        );
      });
    }

    const pipeControls = [
      <button disabled={isDisabled} key={'add'} onClick={this.handleShowDialod} className={'pipeline-button method-add'} title={'Add'}>+</button>
    ];

    let dialog = null;
    if (this.state.showAddDialog) {
      dialog = (
        <AddMethodDialog onClose={this.closeDialog} onAdd={this.addMethod}/>
      );
    }

    return (
      <div className={'field pipeline-selector'}>
        <div className={'field-left'}>
          {title}
        </div>
        <div className={'field-right'}>
          <div className='select'>
            <input disabled={isDisabled} type="text" data-id={id} ref={this.refInput}
                   onChange={this.handleChange} defaultValue={defaultValue} className={'input'}/>
            <input disabled={isDisabled} type="text" data-id={`${id}-result`} readOnly={true} className={'output'}/>
            <input disabled={isDisabled} type="button" data-id={`${id}-btn`} value={chrome.i18n.getMessage('kitSelect')}/>
          </div>
          <div className='pipeline'>
            <div ref={this.refSortable} className={'pipeline-sortable'}>
              {pipeline}
            </div>
            <div className={'controls'}>
              {pipeControls}
            </div>
          </div>
        </div>
        {dialog}
      </div>
    );
  }
}

class AddMethodDialog extends React.Component {
  state = {
    methodName: null,
    clonedInputs: 0
  };

  select = null;
  refSelect = element => {
    this.select = element;
  };

  args = {};
  refArg = (index, element) => {
    if (element) {
      this.args[index] = element;
    } else {
      delete this.args[index];
    }
  };

  handleSubmit = e => {
    e.preventDefault();
    const args = Object.keys(this.args).map(key => this.args[key].value);
    this.props.onAdd(this.state.methodName || this.select.value, args);
  };

  handleCancel = e => {
    e.preventDefault();
    this.props.onClose();
  };

  handleSelect = e => {
    this.setState({
      methodName: this.select.value,
    });
  };

  handleAddArg = e => {
    e.preventDefault();
    this.setState({
      clonedInputs: this.state.clonedInputs + 1
    });
  };

  handleRemoveArg = e => {
    e.preventDefault();
    if (this.state.clonedInputs !== 0) {
      this.setState({
        clonedInputs: this.state.clonedInputs - 1
      });
    }
  };

  render() {
    const methodName = this.state.methodName;
    const methodScheme = methods[this.state.methodName];

    const options = Object.keys(methods).map(key => {
      return (
        <option key={key} value={key}>{key}</option>
      );
    });

    let args = null;
    if (methodScheme) {
      if (methodScheme.args) {
        args = methodScheme.args.map((arg, index) => {
          let element = null;
          if (arg.type === 'select') {
            element = (
              <select ref={this.refArg.bind(this, index)}>
                {arg.values.map(key => {
                  return (
                    <option key={key} value={key}>{key}</option>
                  );
                })}
              </select>
            );
          } else {
            element = (
              <input ref={this.refArg.bind(this, index)} type={arg.type}/>
            );
          }
          return (
            <div className={'method-arg'} key={index}>
              <div className={'arg-name'}>{arg.name}</div>
              <div className={'arg-input'}>
                {element}
              </div>
            </div>
          );
        });

        if (methodScheme.multipleArgs) {
          const fistsArg = methodScheme.args[0];
          for (let i = 0; i < this.state.clonedInputs; i++) {
            const index = args.length;
            args.push(
              <div className={'method-arg'} key={index}>
                <div className={'arg-name'}>{fistsArg.name}</div>
                <div className={'arg-input'}>
                  <input ref={this.refArg.bind(this, index)} type={fistsArg.type}/>
                </div>
              </div>
            );
          }

          let removeBtn = null;
          if (this.state.clonedInputs > 0) {
            removeBtn = (
              <button onClick={this.handleRemoveArg}>Remove argument</button>
            );
          }

          args.push(
            <div className={'arg-controls'}>
              <button onClick={this.handleAddArg}>Add argument</button>
              {removeBtn}
            </div>
          );
        }
      }
    }

    return ReactDOM.createPortal(
      <div className={'method-dialog'}>
        <form onSubmit={this.handleSubmit}>
          <div className={'method-select-wrapper'}>
            <select className={'method-select'} ref={this.refSelect} onChange={this.handleSelect} defaultValue={methodName}>
              {options}
            </select>
          </div>
          {args}
          <div className={'dialog-footer'}>
            <button className={'dialog-button dialog-button-submit'} type="submit">Add</button>
            <button className={'dialog-button'} onClick={this.handleCancel}>Cancel</button>
          </div>
        </form>
      </div>,
      document.body
    );
  }
}

class EditMethodDialog extends React.Component {
  constructor(props) {
    super(props);

    const method = props.method;
    const methodScheme = methods[method.name];

    this.state = {
      clonedInputs: 0
    };

    if (methodScheme.args) {
      this.state.clonedInputs = method.args.length - methodScheme.args.length;
    }
  }

  args = {};
  refArg = (index, element) => {
    if (element) {
      this.args[index] = element;
    } else {
      delete this.args[index];
    }
  };

  handleSubmit = e => {
    e.preventDefault();
    const args = Object.keys(this.args).map(key => this.args[key].value);
    this.props.method.setArgs(args);
    this.props.onClose();
  };

  handleCancel = e => {
    e.preventDefault();
    this.props.onClose();
  };

  handleAddArg = e => {
    e.preventDefault();
    this.setState({
      clonedInputs: this.state.clonedInputs + 1
    });
  };

  handleRemoveArg = e => {
    e.preventDefault();
    if (this.state.clonedInputs !== 0) {
      this.setState({
        clonedInputs: this.state.clonedInputs - 1
      });
    }
  };

  render() {
    const method = this.props.method;
    const methodScheme = methods[method.name];

    let args = null;
    if (methodScheme) {
      if (methodScheme.args) {
        args = methodScheme.args.map((arg, index) => {
          let element = null;
          if (arg.type === 'select') {
            element = (
              <select ref={this.refArg.bind(this, index)}
                      defaultValue={method.args[index]}>
                {arg.values.map(key => {
                  return (
                    <option key={key} value={key}>{key}</option>
                  );
                })}
              </select>
            );
          } else {
            element = (
              <input ref={this.refArg.bind(this, index)} type={arg.type}
                     defaultValue={method.args[index]}/>
            );
          }
          return (
            <div className={'method-arg'} key={index}>
              <div className={'arg-name'}>{arg.name}</div>
              <div className={'arg-input'}>
                {element}
              </div>
            </div>
          );
        });

        if (methodScheme.multipleArgs) {
          const fistsArg = methodScheme.args[0];
          for (let i = 0; i < this.state.clonedInputs; i++) {
            const index = args.length;
            args.push(
              <div className={'method-arg'} key={index}>
                <div className={'arg-name'}>{fistsArg.name}</div>
                <div className={'arg-input'}>
                  <input ref={this.refArg.bind(this, index)} type={fistsArg.type}
                         defaultValue={method.args[index]}/>
                </div>
              </div>
            );
          }

          let removeBtn = null;
          if (this.state.clonedInputs > 0) {
            removeBtn = (
              <button onClick={this.handleRemoveArg}>Remove argument</button>
            );
          }

          args.push(
            <div className={'arg-controls'}>
              <button onClick={this.handleAddArg}>Add argument</button>
              {removeBtn}
            </div>
          );
        }
      }
    }

    return ReactDOM.createPortal(
      <div className={'method-dialog'}>
        <form onSubmit={this.handleSubmit}>
          <div className="method-title">{method.name}</div>
          {args}
          <div className={'dialog-footer'}>
            <button className={'dialog-button dialog-button-submit'} type="submit">Save</button>
            <button className={'dialog-button'} onClick={this.handleCancel}>Cancel</button>
          </div>
        </form>
      </div>,
      document.body
    );
  }
}

@observer
class Method extends React.Component {
  state = {
    showEditDialog: false,
  };

  handleShowDialog = e => {
    e.preventDefault();
    this.setState({
      showEditDialog: true
    });
  };

  closeDialog = () => {
    this.setState({
      showEditDialog: false
    });
  };

  handleRemove = e => {
    e.preventDefault();
    this.props.onRemove(this.props.method);
  };

  render() {
    const method = this.props.method;

    const args = method.args.map((arg, index) => {
      return (
        <div className={'method-arg'} key={index}>{arg}</div>
      );
    });

    let dialog = null;
    if (this.state.showEditDialog) {
      dialog = (
        <EditMethodDialog method={this.props.method} onClose={this.closeDialog}/>
      );
    }

    let editBtn = null;
    if (method.args.length) {
      editBtn = (
        <button onClick={this.handleShowDialog} title={'Edit'} className={'pipeline-button'}>E</button>
      );
    }

    return (
      <div data-index={this.props.index} className="method-wrapper">
        <div className="move"/>
        <div className="method">
          <div className="method-name">{method.name}</div>
          <div className="method-args">{args}</div>
        </div>
        {editBtn}
        <button onClick={this.handleRemove} title={'Remove'} className={'pipeline-button'}>X</button>
        {dialog}
      </div>
    );
  }
}

Method.propTypes = null && {
  rootStore: PropTypes.instanceOf(RootStore),
  method: PropTypes.instanceOf(MethodStore),
  onLeft: PropTypes.func,
  onRight: PropTypes.func,
  onRemove: PropTypes.func,
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
        <div className="field">
          <span className="field-name">{chrome.i18n.getMessage('kitSearchUrl')}</span>
          <BindInput store={this.codeSearchStore} id={'url'} type="text"/>
          {' '}
          <input ref={this.refRequestPage} onClick={this.handleRequestPage} type="button" value={chrome.i18n.getMessage('kitOpen')}/>
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
        <ElementSelector store={this.codeSearchAuth} id={'selector'}
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
        <PipelineSelector store={this.codeSearchSelectors} id={'categoryLink'} optional={true}
                          title={chrome.i18n.getMessage('kitCategoryLink')}/>
        <PipelineSelector store={this.codeSearchSelectors} id={'title'}
                          title={chrome.i18n.getMessage('kitTorrentTitle')}/>
        <PipelineSelector store={this.codeSearchSelectors} id={'link'}
                          title={chrome.i18n.getMessage('kitTorrentLink')}/>
        <PipelineSelector store={this.codeSearchSelectors} id={'size'} optional={true}
                          title={chrome.i18n.getMessage('kitTorrentSize')}/>
        <PipelineSelector store={this.codeSearchSelectors} id={'downloadLink'} optional={true}
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
        <PipelineSelector store={this.codeSearchSelectors} id={'nextPageLink'}  optional={true}
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
        <div className="field">
          <span className="field-name">{chrome.i18n.getMessage('kitIcon')}</span>
          <i onClick={this.handleIconClick} style={{
            backgroundImage: `url(${this.generateIcon(codeStore.description.icon)})`
          }} className="tracker_iconPic" data-id="desk_tracker_iconPic"/>
          <input type="file" data-id="desk_tracker_iconFile"/>
          <input type="hidden" data-id="desk_tracker_icon" value={codeStore.description.icon}/>
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
          <BindInput store={this.codeStoreDescription} id={'updateUrl'} type={'text'}/>
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
  render() {
    return (
      <div className="page save">
        <h2>{chrome.i18n.getMessage('kitSaveLoad')}</h2>
        <div>
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