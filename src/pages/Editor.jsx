import "codemirror/lib/codemirror.css";
import "../assets/css/editor.less";
import React from 'react';
import PropTypes from "prop-types";
import RootStore from "../stores/RootStore";
import {inject, observer} from "mobx-react";
import Dialog from "../components/Dialog";
import exKit from "../sandbox/exKit";
import jsonToUserscript from "../tools/jsonToUserscript";
import getLogger from "../tools/getLogger";

const CodeMirror = require('codemirror');
require('codemirror/mode/javascript/javascript');
require('codemirror/addon/edit/matchbrackets');
require('codemirror/addon/edit/closebrackets');
require('codemirror/addon/comment/continuecomment');
require('codemirror/addon/selection/active-line');

const logger = getLogger('Editor');

@inject('rootStore')
@observer
class Editor extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showAddCodeDialog: false
    };

    this.handleAutoUpdateChange = this.handleAutoUpdateChange.bind(this);
    this.handleTextareaChange = this.handleTextareaChange.bind(this);
    this.handleAddCode = this.handleAddCode.bind(this);
    this.handleCloseWindow = this.handleCloseWindow.bind(this);
    this.handleDialogCancel = this.handleDialogCancel.bind(this);
    this.handleDialogSave = this.handleDialogSave.bind(this);
    this.handleSave = this.handleSave.bind(this);

    this.refTextarea = this.refTextarea.bind(this);
    this.refAutoUpdate = this.refAutoUpdate.bind(this);
    this.refDialogTextarea = this.refDialogTextarea.bind(this);

    this.editor = null;
    this.autoUpdate = null;
    this.dialogTextarea = null;
  }
  componentDidMount() {
    this.props.rootStore.createEditor(this.props.type, this.props.id);
    if (this.props.rootStore.editor.state === 'idle') {
      this.props.rootStore.editor.fetchModule();
    }
  }
  componentWillUnmount() {
    this.props.rootStore.destroyEditor();
  }
  refTextarea(element) {
    if (!element) {
      if (this.editor) {
        this.editor.off('change', this.handleTextareaChange);
        this.editor.toTextArea();
        this.editor = null;
      }
    } else
    if (!this.editor) {
      this.editor = CodeMirror.fromTextArea(element, {
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
  refAutoUpdate(element) {
    this.autoUpdate = element;
  }
  refDialogTextarea(element) {
    this.dialogTextarea = element;
  }
  handleTextareaChange() {
    const editor = this.props.rootStore.editor;
    editor.setCode(this.editor.getValue());
  }
  handleAutoUpdateChange() {
    const editor = this.props.rootStore.editor;
    editor.options.setAutoUpdate(this.autoUpdate.checked);
  }
  handleAddCode(e) {
    e.preventDefault();
    this.setState({
      showAddCodeDialog: true
    });
  }
  handleCloseWindow(e) {
    e.preventDefault();
    window.close();
  }
  handleDialogCancel(e) {
    e && e.preventDefault();
    this.setState({
      showAddCodeDialog: false
    });
  }
  handleDialogSave(e) {
    e.preventDefault();
    const editor = this.props.rootStore.editor;

    try {
      const text = this.dialogTextarea.value;
      let json = JSON.parse(text);

      if (json.version === 1) {
        json = exKit.convertV1ToV2(json);
      }

      const script = jsonToUserscript(json);

      editor.setCode(script);

      this.setState({
        showAddCodeDialog: false
      });
    } catch (err) {
      logger.error('Add code error', err);
      alert('Add code error: \n' + err.stack);
    }
  }
  handleSave(e) {
    e && e.preventDefault();
    const editor = this.props.rootStore.editor;
    editor.save();
  }
  render() {
    const editor = this.props.rootStore.editor;

    switch (!editor || editor.state) {
      case 'pending': {
        return ('Loading...');
      }
      case 'error': {
        return ('Error');
      }
      case 'done': {
        break;
      }
      default: {
        return ('Idle');
      }
    }

    let saveBtn = null;
    if (editor.saveState === 'pending') {
      saveBtn = (
        '...'
      );
    } else {
      const classList = ['button head__action head__action-save'];
      if (editor.saveState === 'error') {
        classList.push('error');
      }
      saveBtn = (
        <a onClick={this.handleSave} href="#save" className={classList.join(' ')}>{chrome.i18n.getMessage('save')}{editor.hasChanges() ? '*' : ''}</a>
      );
    }

    let dialog = null;
    if (this.state.showAddCodeDialog) {
      dialog = (
        <Dialog className={'dialog-code'} onClose={this.handleDialogCancel}>
          <form onSubmit={this.handleDialogSave}>
            <span className="dialog__label">{chrome.i18n.getMessage('enterTrackerCode')}</span>
            <textarea ref={this.refDialogTextarea} className="dialog__textarea" name="code"/>
            <div className="dialog__button_box">
              <input className="button button-save" type="submit" value={chrome.i18n.getMessage('save')}/>
              <input className="button button-cancel" type="button" onClick={this.handleDialogCancel} value={chrome.i18n.getMessage('cancel')}/>
            </div>
          </form>
        </Dialog>
      );
    }

    return (
      <div className="page-ctr page-ctr--editor">
        <div className="editor__head">
          <div className="head__options">
            <label>
              <input ref={this.refAutoUpdate} type="checkbox" className="option__auto-update" defaultChecked={editor.options.autoUpdate} onChange={this.handleAutoUpdateChange}/>
              <span>{chrome.i18n.getMessage('autoUpdate')}</span>
            </label>
          </div>
          <div className="head__action">
            <a onClick={this.handleAddCode} href="#code" className="button head__action head__action-add-code">{chrome.i18n.getMessage('addTrackerCode')}</a>
            {saveBtn}
            <a onClick={this.handleCloseWindow} href="#close" className="button head__action head__action-close">{chrome.i18n.getMessage('close')}</a>
          </div>
        </div>
        <div className="editor__body">
          <textarea ref={this.refTextarea} className="editor__textarea" defaultValue={editor.code}/>
        </div>
        {dialog}
      </div>
    );
  }
}

Editor.propTypes = null && {
  rootStore: PropTypes.instanceOf(RootStore),
  type: PropTypes.string,
  id: PropTypes.string,
};

export default Editor;