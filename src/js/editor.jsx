import React from "react";
import {observer} from "mobx-react/index";
import ReactDOM from "react-dom";
import editorModel from "./models/editor";
import "codemirror/lib/codemirror.css";
import "../css/editor.less";

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

    this.refTextarea = this.refTextarea.bind(this);

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
          "Ctrl-S": function() {
            // save.dispatchEvent(new MouseEvent('click', {cancelable: true}));
          },
          "Cmd-S": function() {
            // save.dispatchEvent(new MouseEvent('click', {cancelable: true}));
          }
        }
      });
    }
  }
  render() {
    const /**EditorM*/store = this.props.store;

    let code = store.module.code;
    if (store.module.state === 'error') {
      // some default value
    }

    return (
      <div className="editor">
        <div className="editor__head">
          <div className="head__options">
            <label>
              <input type="checkbox" className="option__auto-update"/>
              <span>{chrome.i18n.getMessage('autoUpdate')}</span>
            </label>
          </div>
          <div className="head__action">
            <a href="#code" className="button head__action head__action-add-code">{chrome.i18n.getMessage('addTrackerCode')}</a>
            <a href="#save" className="button head__action head__action-save">{chrome.i18n.getMessage('save')}</a>
            <a href="#close" className="button head__action head__action-close">{chrome.i18n.getMessage('close')}</a>
          </div>
        </div>
        <div className="editor__body">
          <textarea ref={this.refTextarea} className="editor__textarea" defaultValue={code}/>
        </div>
      </div>
    );
  }
}

window.app = ReactDOM.render(<EditorPage store={editorModel.create()}/>, document.getElementById('root'));