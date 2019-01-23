import "codemirror/lib/codemirror.css";
import "../assets/css/editor.less";
import React from 'react';
import PropTypes from "prop-types";
import {inject, observer} from "mobx-react";
import Dialog from "../components/Dialog";
import jsonToUserscript from "../tools/jsonToUserscript";
import getLogger from "../tools/getLogger";
import convertCodeV1toV2 from "../tools/convertCodeV1toV2";
import convertCodeV2toV3 from "../tools/convertCodeV2toV3";
import getTitle from "../tools/getTitle";

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
  static propTypes = {
    rootStore: PropTypes.object,
    type: PropTypes.string,
    id: PropTypes.string,
  };

  constructor(props) {
    super(props);

    this.state = {
      showAddCodeDialog: false
    };

    this.editor = null;
    this.dialogTextarea = null;

    this.props.rootStore.createEditor(props.type, props.id);
    if (this.editorStore.state === 'idle') {
      this.editorStore.fetchModule();
    }
  }

  componentDidMount() {
    document.title = getTitle('Code editor');
    if (window.ga) {
      window.ga('send', 'pageview', {page: location.href, title: document.title});
    }
  }

  componentWillUnmount() {
    this.props.rootStore.destroyEditor();
  }

  /**@return EditorStore*/
  get editorStore() {
    return this.props.rootStore.editor;
  }

  refTextarea = (element) => {
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
  };

  autoUpdate = null;
  refAutoUpdate = (element) => {
    this.autoUpdate = element;
  };

  refDialogTextarea = (element) => {
    this.dialogTextarea = element;
  };

  handleTextareaChange = (e) => {
    const editorStore = this.editorStore;
    editorStore.setCode(this.editor.getValue());
  };

  handleAutoUpdateChange = (e) => {
    const editorStore = this.editorStore;
    editorStore.options.setAutoUpdate(this.autoUpdate.checked);
  };

  handleAddCode = (e) => {
    e.preventDefault();
    this.setState({
      showAddCodeDialog: true
    });
  };

  handleCloseWindow = (e) => {
    e.preventDefault();
    window.close();
  };

  handleDialogCancel = (e) => {
    e && e.preventDefault();
    this.setState({
      showAddCodeDialog: false
    });
  };

  handleDialogSave = (e) => {
    e.preventDefault();
    const editorStore = this.editorStore;

    try {
      const text = this.dialogTextarea.value;
      let json = JSON.parse(text);

      if (json.version === 1) {
        json = convertCodeV1toV2(json);
      }
      if (json.version === 2) {
        json = convertCodeV2toV3(json);
      }

      const script = jsonToUserscript(json);

      editorStore.setCode(script);
      this.editor.setValue(script);

      this.setState({
        showAddCodeDialog: false
      });
    } catch (err) {
      logger.error('Add code error', err);
      alert('Add code error: \n' + err.stack);
    }
  };

  handleSave = (e) => {
    e && e.preventDefault();
    const editorStore = this.editorStore;
    editorStore.save();
  };

  render() {
    const editorStore = this.editorStore;
    if (editorStore.state !== 'done') {
      return (`Loading editor: ${editorStore.state}`);
    }

    let saveBtn = null;
    if (editorStore.saveState === 'pending') {
      saveBtn = (
        '...'
      );
    } else {
      const classList = ['button head__action head__action-save'];
      if (editorStore.saveState === 'error') {
        classList.push('error');
      }
      saveBtn = (
        <a onClick={this.handleSave} href="#save" className={classList.join(' ')}>{chrome.i18n.getMessage('save')}{editorStore.hasChanges() ? '*' : ''}</a>
      );
    }

    let addCodeBtn = null;
    if (editorStore.type === 'tracker') {
      addCodeBtn = (
        <a onClick={this.handleAddCode} href="#code" className="button head__action head__action-add-code">{chrome.i18n.getMessage('addTrackerCode')}</a>
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
              <input ref={this.refAutoUpdate} type="checkbox" className="option__auto-update" defaultChecked={editorStore.options.autoUpdate} onChange={this.handleAutoUpdateChange}/>
              <span>{chrome.i18n.getMessage('autoUpdate')}</span>
            </label>
          </div>
          <div className="head__action">
            {addCodeBtn}
            {saveBtn}
            <a onClick={this.handleCloseWindow} href="#close" className="button head__action head__action-close">{chrome.i18n.getMessage('close')}</a>
          </div>
        </div>
        <div className="editor__body">
          <textarea ref={this.refTextarea} className="editor__textarea" defaultValue={editorStore.code}/>
        </div>
        {dialog}
      </div>
    );
  }
}

export default Editor;