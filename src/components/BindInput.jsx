import React from "react";

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

export default BindInput;