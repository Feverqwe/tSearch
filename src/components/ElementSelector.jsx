import {observer} from "mobx-react";
import React from "react";

@observer
class ElementSelector extends React.Component {
  state = {
    showAddDialog: false,
    snapshot: null
  };

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
      }
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

    return (
      <div className="field">
        {title}
        <input disabled={isDisabled} type={type} defaultValue={defaultValue} data-id={id} ref={this.refInput} onChange={this.handleChange}/>
        {children}
        <input disabled={isDisabled} type="button" data-id={`${id}-btn`} value={chrome.i18n.getMessage('kitSelect')}/>
      </div>
    )
  }
}

export default ElementSelector;