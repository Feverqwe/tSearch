import React from "react";
import {observer} from "mobx-react/index";
import ReactDOM from "react-dom";
import editorModel from "./models/editor";
import "codemirror/lib/codemirror.css";
import "../css/editor.less";
import Dialog from "./components/Dialog";
import exKit from "./sandbox/exKit";
import jsonToUserscript from "./tools/jsonToUserscript";
import {HashRouter, Route} from 'react-router-dom';

const debug = require('debug')('editor');
const uuid = require('uuid/v4');
const CodeMirror = require('codemirror');
require('codemirror/mode/javascript/javascript');
require('codemirror/addon/edit/matchbrackets');
require('codemirror/addon/edit/closebrackets');
require('codemirror/addon/comment/continuecomment');
require('codemirror/addon/selection/active-line');

@observer class EditorPage extends React.Component {
  render() {
    return (
      <HashRouter>
        <div>
          <Route exact path="/:type" component={observer(props => {
            const id = uuid();
            const type = props.match.params.type;
            props.history.replace(`/${type}/${id}`);
            return null;
          })}/>
          <Route path="/:type/:id" component={observer(props => {
            const {type, id} = props.match.params;
            return (
              <LoaderEditor key={[type, id].join(':')} type={type} id={id} {...this.props} {...props}/>
            );
          })}/>
        </div>
      </HashRouter>
    );
  }
}

@observer class LoaderEditor extends React.Component {
  constructor() {
    super();

    this.state = {
      error: false
    };

    this.store = null;
  }
  componentWillMount() {
    try {
      this.store = editorModel.create({
        module: {
          moduleType: this.props.type,
          id: this.props.id
        }
      });
    } catch (err) {
      this.setState({
        error: true
      });
    }
  }
  componentWillUnmount() {
    if (this.store) {
      this.store.destroy();
      this.store = null;
    }
  }
  render() {
    if (this.state.error) {
      return ('Loading error');
    }

    switch (this.store.state) {
      case 'loading': {
        return ('Loading...');
      }
      case 'done': {
        return (
          <Editor {...this.props} store={this.store}/>
        );
      }
    }
    return null;
  }
}

@observer class Editor extends React.Component {
  constructor() {
    super();

    this.state = {
      saveState: 'idle',
      addCodeDialog: false,
      default: null,
      hasChanges: false,
    };

    this.refTextarea = this.refTextarea.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleSave = this.handleSave.bind(this);
    this.handleAddCode = this.handleAddCode.bind(this);
    this.handleAutoUpdateChange = this.handleAutoUpdateChange.bind(this);
    this.handleDialogSave = this.handleDialogSave.bind(this);
    this.handleDialogCancel = this.handleDialogCancel.bind(this);
    this.handleDialogClose = this.handleDialogClose.bind(this);
    this.handleTextareaChange = this.handleTextareaChange.bind(this);

    this.editor = null;
  }
  componentWillMount() {
    this.state.default = this.getDefault();
  }
  getDefault() {
    const /**EditorM*/store = this.props.store;
    const /**TrackerM*/module = store.module;
    return JSON.stringify([module.code, module.info]);
  }
  refTextarea(node) {
    if (!node) {
      if (this.editor) {
        this.editor.off('change', this.handleTextareaChange);
        this.editor.toTextArea();
        this.editor = null;
      }
    } else
    if (this.editor) {
      // pass
    } else {
      this.editor = CodeMirror.fromTextArea(node, {
        mode: 'javascript',
        lineWrapping: true,
        lineNumbers: true,
        matchBrackets: true,
        autoCloseBrackets: true,
        continueComments: true,
        styleActiveLine: true,
        extraKeys: {
          "Ctrl-S": () => {
            this.handleSave();
          },
          "Cmd-S": () => {
            this.handleSave();
          }
        }
      });
      this.editor.on('change', this.handleTextareaChange);
    }
  }
  handleTextareaChange() {
    const /**EditorM*/store = this.props.store;

    store.module.setCode(this.editor.getValue());

    this.checkChanges();
  }
  handleDialogSave(e) {
    e.preventDefault();

    const text = this.refs.dialogTextarea.value;
    try {
      let json = JSON.parse(text);
      if (json.version === 1) {
        json = exKit.convertV1ToV2(json);
      }
      const script = jsonToUserscript(json);
      this.editor.setValue(script);

      this.handleDialogClose();
    } catch (err) {
      debug('Add code error', err);
      alert('Add code error: \n' + err.stack);
    }
  }
  handleDialogCancel(e) {
    e.preventDefault();

    this.handleDialogClose();
  }
  handleDialogClose(e) {
    this.setState({
      addCodeDialog: false
    });
  }
  handleAddCode(e) {
    e.preventDefault();
    this.setState({
      addCodeDialog: true
    });
  }
  async handleSave(e) {
    e && e.preventDefault();

    if (this.state.saveState === 'loading') return;

    const /**EditorM*/store = this.props.store;
    try {
      this.setState({saveState: 'loading'});
      this.handleAutoUpdateChange();
      this.handleTextareaChange();
      await store.module.save();
      this.state.default = this.getDefault();
      this.checkChanges();
      this.setState({saveState: 'success'});
    } catch(err) {
      alert('Save code error: \n' + err.stack);
      debug('handleSave error', err);
      this.setState({saveState: 'error'});
    }
  }
  handleClose(e) {
    e.preventDefault();

    if (!this.state.hasChanges || confirm("Sure?")) {
      window.close();
    }
  }
  handleAutoUpdateChange() {
    const /**EditorM*/store = this.props.store;
    store.module.setAutoUpdate(this.refs.autoUpdate.checked);

    this.checkChanges();
  }
  checkChanges() {
    const hasChanges = this.state.default !== this.getDefault();
    this.setState({
      hasChanges
    });
  }
  getDefaultCode() {
    const meta = [];
    meta.push('==UserScript==');
    meta.push(`@name New Tracker`);
    meta.push(`@version 1.0`);
    meta.push(`@connect *://localhost`);
    meta.push('==/UserScript==');

    const code = [];
    code.push(...meta.map(line => ['//', line].join(' ')));
    code.push('');
    return code.join('\n');
  }
  render() {
    const /**EditorM*/store = this.props.store;
    const /**TrackerM*/module = store.module;

    let code = module.code;
    if (module.state === 'error') {
      code = this.getDefaultCode();
    }

    let saveBtn = null;
    if (this.state.saveState === 'loading') {
      saveBtn = (
        <a className="button head__action head__action-save">...</a>
      );
    } else {
      const classList = ['button head__action head__action-save'];
      if (this.state.saveState === 'error') {
        classList.push('error');
      }
      saveBtn = (
        <a onClick={this.handleSave} href="#save" className={classList.join(' ')}>{chrome.i18n.getMessage('save')}{this.state.hasChanges ? '*' : ''}</a>
      );
    }

    let dialog = null;
    if (this.state.addCodeDialog) {
      dialog = (
        <Dialog className={'dialog-code'} onClose={this.handleDialogClose}>
          <form onSubmit={this.handleDialogSave}>
            <span className="dialog__label">{chrome.i18n.getMessage('enterTrackerCode')}</span>
            <textarea ref={'dialogTextarea'} className="dialog__textarea" name="code"/>
            <div className="dialog__button_box">
              <input className="button button-save" type="submit" value={chrome.i18n.getMessage('save')}/>
              <input className="button button-cancel" type="button" onClick={this.handleDialogCancel} value={chrome.i18n.getMessage('cancel')}/>
            </div>
          </form>
        </Dialog>
      );
    }

    return (
      <div className="editor">
        <div className="editor__head">
          <div className="head__options">
            <label>
              <input ref={'autoUpdate'} type="checkbox" className="option__auto-update" defaultChecked={module.isAutoUpdate} onChange={this.handleAutoUpdateChange}/>
              <span>{chrome.i18n.getMessage('autoUpdate')}</span>
            </label>
          </div>
          <div className="head__action">
            <a onClick={this.handleAddCode} href="#code" className="button head__action head__action-add-code">{chrome.i18n.getMessage('addTrackerCode')}</a>
            {saveBtn}
            <a onClick={this.handleClose} href="#close" className="button head__action head__action-close">{chrome.i18n.getMessage('close')}</a>
          </div>
        </div>
        <div className="editor__body">
          <textarea ref={this.refTextarea} className="editor__textarea" defaultValue={code}/>
        </div>
        {dialog}
      </div>
    );
  }
}

window.app = ReactDOM.render(<EditorPage/>, document.getElementById('root'));