import React from "react";
import {observer} from "mobx-react/index";
import ReactDOM from "react-dom";
import editorModel from "./models/editor";
import "codemirror/lib/codemirror.css";
import "../css/editor.less";
import Dialog from "./components/Dialog";
import exKit from "./sandbox/exKit";
import jsonToUserscript from "./tools/jsonToUserscript";

const debug = require('debug')('editor');
const CodeMirror = require('codemirror');
require('codemirror/mode/javascript/javascript');
require('codemirror/addon/edit/matchbrackets');
require('codemirror/addon/edit/closebrackets');
require('codemirror/addon/comment/continuecomment');
require('codemirror/addon/selection/active-line');

@observer class EditorPage extends React.Component {
  render() {
    let content = null;
    switch (this.props.store.state) {
      case 'loading': {
        content = ('Loading...');
        break;
      }
      case 'done': {
        content = (
          <Editor {...this.props}/>
        );
        break;
      }
    }

    return (
      content
    );
  }
}

@observer class Editor extends React.Component {
  constructor() {
    super();

    this.state = {
      saveState: 'idle',
      addCodeDialog: false,
    };

    this.refTextarea = this.refTextarea.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleSave = this.handleSave.bind(this);
    this.handleAddCode = this.handleAddCode.bind(this);
    this.handleAutoUpdateChange = this.handleAutoUpdateChange.bind(this);
    this.handleDialogSave = this.handleDialogSave.bind(this);
    this.handleDialogCancel = this.handleDialogCancel.bind(this);
    this.handleDialogClose = this.handleDialogClose.bind(this);

    this.editor = null;
  }
  refTextarea(node) {
    if (!node) {
      if (this.editor) {
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
    }
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
    if (e) {
      e.preventDefault();
    }

    if (this.state.saveState === 'loading') return;

    const /**EditorM*/store = this.props.store;
    try {
      this.setState({saveState: 'loading'});
      store.module.setCode(this.editor.getValue());
      await store.module.save();
      this.setState({saveState: 'success'});
    } catch(err) {
      debug('handleSave error', err);
      this.setState({saveState: 'error'});
    }
  }
  async handleClose(e) {
    e.preventDefault();
    window.close();
  }
  async handleAutoUpdateChange() {
    const /**EditorM*/store = this.props.store;

    if (this.state.saveState === 'loading') return;

    try {
      this.setState({saveState: 'loading'});
      store.module.setAutoUpdate(this.refs.autoUpdate.checked);
      await store.module.save();
      this.setState({saveState: 'success'});
    } catch(err) {
      debug('handleAutoUpdateChange error', err);
      this.setState({saveState: 'error'});
    }
  }
  render() {
    const /**EditorM*/store = this.props.store;

    let code = store.module.code;
    if (store.module.state === 'error') {
      // some default value
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
        <a onClick={this.handleSave} href="#save" className={classList.join(' ')}>{chrome.i18n.getMessage('save')}</a>
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
              <input ref={'autoUpdate'} onChange={this.handleAutoUpdateChange} type="checkbox" className="option__auto-update" checked={store.module.isAutoUpdate}/>
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

window.app = ReactDOM.render(<EditorPage store={editorModel.create()}/>, document.getElementById('root'));