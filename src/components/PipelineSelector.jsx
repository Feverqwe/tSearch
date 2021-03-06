import {inject, observer} from "mobx-react";
import {_ElementSelector} from "./ElementSelector";
import React from "react";
import exKitPipelineMethods from "../tools/exKitPipelineMethods";
import PropTypes from "prop-types";
import AddMethodDialog from "./AddMethodDialog";
import EditMethodDialog from "./EditMethodDialog";
import getLogger from "../tools/getLogger";
import filesize from "filesize";

const Sortable = require('sortablejs');

const logger = getLogger('PipelineSelector');

@inject('rootStore')
@observer
class PipelineSelector extends _ElementSelector {
  static propTypes = {
    id: PropTypes.string.isRequired,
    optional: PropTypes.bool,
    container: PropTypes.string,
    title: PropTypes.string.isRequired,
    store: PropTypes.any.isRequired,
    rootStore: PropTypes.object,
    onResolvePath: PropTypes.func.isRequired,
    onHighlightPath: PropTypes.func.isRequired,
    setActiveSelector: PropTypes.func.isRequired,
    preview: PropTypes.bool,
    previewType: PropTypes.string,
  };

  static defaultProps = {
    preview: false,
    optional: false,
  };

  state = {
    showAddDialog: false,
    snapshot: null,
    inputError: null,
    outputError: null,
    previewMode: false,
  };

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
          this.updateResult();
        }
      });
    }
  };

  handleOptionalChange = e => {
    if (this.optionalCheckbox.checked) {
      if (!this.selectorStore) {
        const snapshot = this.state.snapshot && JSON.parse(this.state.snapshot);
        const pipeline = this.store.getDefaultPipeline(this.props.id);
        this.store.set(this.props.id, snapshot || {
          selector: this.input.value,
          pipeline: pipeline
        });
      }
    } else {
      if (this.selectorStore) {
        this.state.snapshot = JSON.stringify(this.selectorStore);
        this.store.set(this.props.id, undefined);
        this.fireActiveSelect();
      }
    }
  };

  handleShowDialog = e => {
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
    this.setActiveSelector(this);

    this.selectorStore.addMethod(method, args);
    this.closeDialog();
  };

  handleChangeMethod = () => {
    this.setActiveSelector(this);
  };

  handleRemoveMethod = (method) => {
    this.setActiveSelector(this);

    this.selectorStore.removeMethod(method);
  };

  selectListener = (path) => {
    this.input.value = path;
    this.handleChange();
  };

  output = null;
  refOutput = input => {
    this.output = input;
  };

  updateResult = () => {
    this.setActiveSelector(this);

    if (this.state.inputError) {
      this.setState({
        inputError: null
      });
    }

    const selector = this.selectorStore.selector;

    let node = null;
    try {
      node = this.props.onResolvePath(selector, {
        containerSelector: this.getContainerSelector(),
        skipFromStart: this.store.skipFromStart,
        skipFromEnd: this.store.skipFromEnd,
      });
      if (!node) {
        throw new Error('Node is not found');
      }
    } catch (err) {
      logger('updateResult input error', selector, err);

      this.setState({
        inputError: err.message
      });
    }

    try {
      this.props.onHighlightPath(selector, {
        containerSelector: this.getContainerSelector(),
        skipFromStart: this.store.skipFromStart,
        skipFromEnd: this.store.skipFromEnd,
        scrollIntoView: !this.isSelectMode
      });
    } catch (err) {
      logger.error('highlightPath error', selector, err);
    }

    let lastResult = '';
    return this.selectorStore.pipeline.reduce((promise, method) => {
      return promise.then(result => {
        return Promise.resolve().then(() => {
          return exKitPipelineMethods[method.name].getMethod(...method.args);
        }).then(fn => lastResult = fn(result));
      });
    }, Promise.resolve(node)).then((result) => {
      this.selectorStore.verifyType(result);
      if (this.state.previewMode) {
        switch (this.props.previewType) {
          case 'date': {
            result = new Date(result * 1000).toString();
            break;
          }
          case 'size': {
            try {
              result = filesize(result);
            } catch (err) {
              logger.warn('filesize error', result, err);
              result = 'n/a';
            }
            break;
          }
        }
      }
      return result;
    }).then(result => {
      if (this.output) {
        this.output.value = result;

        this.setState({
          outputError: null
        });
      }
    }, err => {
      logger('updateResult output error', err);

      if (this.output) {
        this.output.value = lastResult;

        this.setState({
          outputError: err.message
        });
      }
    });
  };

  getContainerSelector() {
    let result = '';
    const container = this.props.container;
    if (container) {
      result = this.store[container].selector;
    }
    return result;
  }

  handlePreview = (e) => {
    e.preventDefault();
    this.setState({
      previewMode: !this.state.previewMode,
    }, () => {
      this.updateResult();
    });
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

    let previewBtn = null;
    if (this.props.preview) {
      const classList = ['preview-btn'];
      if (this.state.previewMode) {
        classList.push('active');
      }
      previewBtn = (
        <input disabled={isDisabled} onClick={this.handlePreview} type="button" title={chrome.i18n.getMessage('kitPreview')} className={classList.join(' ')}/>
      );
    }

    let defaultValue = null;
    let pipeline = [];
    if (this.selectorStore) {
      defaultValue = this.selectorStore.selector || '';

      pipeline = this.selectorStore.pipeline.map((method, index) => {
        return (
          <Method key={`${index}_${method.name}`} index={index} method={method} onChange={this.handleChangeMethod} onRemove={this.handleRemoveMethod}/>
        );
      });
    }

    const pipeControls = [
      <button disabled={isDisabled} key={'add'} onClick={this.handleShowDialog} className={'pipeline-button method-add'} title={'Add'}>+</button>
    ];

    let dialog = null;
    if (this.state.showAddDialog) {
      dialog = (
        <AddMethodDialog onClose={this.closeDialog} onAdd={this.addMethod}/>
      );
    }

    let inputClassList = ['input'];
    let outputClassList = ['output'];
    if (!isDisabled) {
      if (this.state.inputError) {
        inputClassList.push('error');
      }
      if (this.state.outputError) {
        outputClassList.push('error');
      }
    }

    let isReadonly = false;
    if (this.isSelectMode) {
      isReadonly = true;
    }

    return (
      <div className={'field pipeline-selector'}>
        <div className={'field-left'}>
          {title}
        </div>
        <div className={'field-right'}>
          <div className='select'>
            <input disabled={isDisabled} readOnly={isReadonly} type="text" data-id={id} ref={this.refInput}
                   onChange={this.handleChange} onKeyUp={this.handleKeyup} defaultValue={defaultValue} className={inputClassList.join(' ')}/>
            <input disabled={isDisabled} type="text" data-id={`${id}-result`} ref={this.refOutput}
                   className={outputClassList.join(' ')} readOnly={true}/>
            {previewBtn}
            <input disabled={isDisabled} onClick={this.handleSelect} type="button" data-id={`${id}-btn`} value={chrome.i18n.getMessage('kitSelect')}/>
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

@observer
class Method extends React.Component {
  static propTypes = {
    method: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
  };

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
    this.props.onChange();
  };

  handleRemove = e => {
    e.preventDefault();
    this.props.onRemove(this.props.method);
  };

  render() {
    const method = this.props.method;
    const methodScheme = exKitPipelineMethods[method.name];

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

    const methodTypeClass = `color-${methodScheme.in}-${methodScheme.out}`;
    const methodInputTypeClass = `color-${methodScheme.in}`;

    return (
      <div data-index={this.props.index} className={`method-wrapper ${methodTypeClass}`}>
        <div className={`move ${methodInputTypeClass}`}/>
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

export default PipelineSelector;