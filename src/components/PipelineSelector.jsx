import {observer} from "mobx-react";
import ElementSelector from "./ElementSelector";
import React from "react";
import exKitPipelineMethods from "../tools/exKitPipelineMethods";
import PropTypes from "prop-types";
import RootStore from "../stores/RootStore";
import {MethodStore} from "../stores/CodeStore";
import AddMethodDialog from "./AddMethodDialog";
import EditMethodDialog from "./EditMethodDialog";
import getLogger from "../tools/getLogger";

const Sortable = require('sortablejs');

const logger = getLogger('PipelineSelector');

@observer
class PipelineSelector extends ElementSelector {
  state = {
    showAddDialog: false,
    snapshot: null,
    inputError: null,
    outputError: null,
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
    this.selectorStore.addMethod(method, args);
    this.closeDialog();
  };

  handleRemoveMethod = method => {
    this.selectorStore.removeMethod(method);
  };

  selectListener = (path) => {
    this.input.value = path;

    this.updateResult();
  };

  handleSelectElement = (path) => {
    this.props.onSelectElement();

    this.input.value = path;

    this.updateResult();
  };

  output = null;
  refOutput = input => {
    this.output = input;
  };

  updateResult() {
    if (this.state.outputError || this.state.inputError) {
      this.setState({
        inputError: null,
        outputError: null
      });
    }

    try {
      const node = this.props.onResolvePath(this.input.value);
      if (!node) {
        throw new Error('Node is not found');
      }
      try {
        this.output.value = node.textContent;
      } catch (err) {
        logger('updateResult error', err);

        this.setState({
          outputError: err.message
        });
      }
    } catch (err) {
      logger('updateResult error', err);

      this.setState({
        inputError: err.message
      });
    }
  }

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

    let defaultValue = null;
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
      <button disabled={isDisabled} key={'add'} onClick={this.handleShowDialog} className={'pipeline-button method-add'} title={'Add'}>+</button>
    ];

    let dialog = null;
    if (this.state.showAddDialog) {
      dialog = (
        <AddMethodDialog onClose={this.closeDialog} onAdd={this.addMethod}/>
      );
    }

    let inputClassList = ['input'];
    if (this.state.inputError) {
      inputClassList.push('error');
    }

    let outputClassList = ['output'];
    if (this.state.outputError) {
      outputClassList.push('error');
    }

    return (
      <div className={'field pipeline-selector'}>
        <div className={'field-left'}>
          {title}
        </div>
        <div className={'field-right'}>
          <div className='select'>
            <input disabled={isDisabled} type="text" data-id={id} ref={this.refInput}
                   onChange={this.handleChange} defaultValue={defaultValue} className={inputClassList.join(' ')}/>
            <input disabled={isDisabled} type="text" data-id={`${id}-result`} ref={this.refOutput}
                   className={outputClassList.join(' ')} readOnly={true}/>
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

Method.propTypes = null && {
  rootStore: PropTypes.instanceOf(RootStore),
  method: PropTypes.instanceOf(MethodStore),
  onLeft: PropTypes.func,
  onRight: PropTypes.func,
  onRemove: PropTypes.func,
};

export default PipelineSelector;