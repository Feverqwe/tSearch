import {inject, observer} from "mobx-react";
import React from "react";
import PropTypes from "prop-types";
import getLogger from "../tools/getLogger";
import {autorun} from "mobx";

const logger = getLogger('ElementSelector');

class _ElementSelector extends React.Component {
  static propTypes = {
    id: PropTypes.string,
    optional: PropTypes.bool,
    container: PropTypes.string,
    className: PropTypes.string,
    title: PropTypes.string,
    type: PropTypes.string,
    store: PropTypes.any,
    rootStore: PropTypes.object,
    onResolvePath: PropTypes.func,
    onHighlightPath: PropTypes.func,
    setActiveSelector: PropTypes.func,
  };

  constructor(props) {
    super(props);

    this.activeSelect = null;
  }

  state = {
    showAddDialog: false,
    snapshot: null,
    inputError: null,
    selectMode: false
  };

  componentWillUnmount() {
    if (this.props.setActiveSelector) {
      this.props.setActiveSelector(null);
    }
    this.fireActiveSelect();
  }

  get frameStore() {
    return this.props.rootStore.codeMaker.frame;
  }

  get store() {
    return this.props.store;
  }

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

  fireActiveSelect() {
    if (this.activeSelect) {
      this.activeSelect();
      this.activeSelect = null;
    }
  }

  optionalCheckbox = null;
  refOptionalCheckbox = element => {
    this.optionalCheckbox = element;
  };

  handleOptionalChange = e => {
    if (this.optionalCheckbox.checked) {
      if (!this.selectorStore) {
        const snapshot = this.state.snapshot && JSON.parse(this.state.snapshot);
        this.store.set(this.props.id, snapshot || {
          selector: this.input.value
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

  handleSelect = e => {
    e.preventDefault();

    if (this.props.setActiveSelector) {
      this.props.setActiveSelector(this);
    }

    this.frameStore.setSelect(true, {
      containerSelector: this.getContainerSelector(),
      skipFromStart: this.store.skipFromStart,
      skipFromEnd: this.store.skipFromEnd,
    }, this.selectListener, this.handleSelectElement);

    this.setState({
      selectMode: true,
    });

    this.activeSelect = () => {
      this.frameStore.setSelect();

      this.setState({
        selectMode: false,
      });
    };
  };

  selectListener = (path) => {
    this.input.value = path;
    this.handleChange();
  };

  handleSelectElement = (path) => {
    this.frameStore.setSelect();

    this.setState({
      selectMode: false,
    });

    this.input.value = path;
    this.handleChange();
  };

  updateResult() {
    if (this.props.setActiveSelector) {
      this.props.setActiveSelector(this);
    }

    if (this.state.inputError) {
      this.setState({
        inputError: null
      });
    }

    const selector = this.selectorStore.selector;

    try {
      const node = this.props.onResolvePath(selector);
      if (!node) {
        throw new Error('Node is not found');
      }
    } catch (err) {
      logger('updateResult error', selector, err);

      this.setState({
        inputError: err.message
      });
    }

    try {
      this.props.onHighlightPath(selector, {
        containerSelector: this.getContainerSelector(),
        skipFromStart: this.store.skipFromStart,
        skipFromEnd: this.store.skipFromEnd,
        scrollIntoView: true
      });
    } catch (err) {
      logger.error('highlightPath error', selector, err);
    }
  }

  getContainerSelector() {
    return '';
  }

  handleKeyup = (e) => {
    if (this.selectorStore) {
      this.updateResult();
    }
  };

  render() {
    const {id, children, optional} = this.props;

    const type = this.props.type;
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
    if (this.selectorStore) {
      defaultValue = this.selectorStore.selector;
    }

    let inputClassList = [];
    if (this.state.inputError) {
      inputClassList.push('error');
    }

    let isReadonly = false;
    if (this.state.selectMode) {
      isReadonly = true;
    }

    return (
      <div className="field">
        {title}
        <input disabled={isDisabled} readOnly={isReadonly} type={type} defaultValue={defaultValue} data-id={id} ref={this.refInput} onChange={this.handleChange} onKeyUp={this.handleKeyup} className={inputClassList.join(' ')}/>
        {children}
        <input disabled={isDisabled} onClick={this.handleSelect} type="button" data-id={`${id}-btn`} value={chrome.i18n.getMessage('kitSelect')}/>
      </div>
    )
  }
}

@inject('rootStore')
@observer
class ElementSelector extends _ElementSelector {}

export default ElementSelector;
export {_ElementSelector};