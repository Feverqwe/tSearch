import React from "react";
import exKitPipelineMethods from "../tools/exKitPipelineMethods";
import ReactDOM from "react-dom";

class EditMethodDialog extends React.Component {
  constructor(props) {
    super(props);

    const method = props.method;
    const methodScheme = exKitPipelineMethods[method.name];

    this.state = {
      clonedInputs: 0
    };

    if (methodScheme.args) {
      this.state.clonedInputs = method.args.length - methodScheme.args.length;
    }
  }

  args = {};
  refArg = (index, element) => {
    if (element) {
      this.args[index] = element;
    } else {
      delete this.args[index];
    }
  };

  handleSubmit = e => {
    e.preventDefault();
    const args = Object.keys(this.args).map(key => this.args[key].value);
    this.props.method.setArgs(args);
    this.props.onClose();
  };

  handleCancel = e => {
    e.preventDefault();
    this.props.onClose();
  };

  handleAddArg = e => {
    e.preventDefault();
    this.setState({
      clonedInputs: this.state.clonedInputs + 1
    });
  };

  handleRemoveArg = e => {
    e.preventDefault();
    if (this.state.clonedInputs !== 0) {
      this.setState({
        clonedInputs: this.state.clonedInputs - 1
      });
    }
  };

  render() {
    const method = this.props.method;
    const methodScheme = exKitPipelineMethods[method.name];

    let args = null;
    if (methodScheme) {
      if (methodScheme.args) {
        args = methodScheme.args.map((arg, index) => {
          let element = null;
          if (arg.type === 'select') {
            element = (
              <select ref={this.refArg.bind(this, index)}
                      defaultValue={method.args[index]}>
                {arg.values.map(({key, text}) => {
                  return (
                    <option key={key} value={key}>{text}</option>
                  );
                })}
              </select>
            );
          } else {
            element = (
              <input ref={this.refArg.bind(this, index)} type={arg.type}
                     defaultValue={method.args[index]}/>
            );
          }
          return (
            <div className={'method-arg'} key={index}>
              <div className={'arg-name'}>{arg.name}</div>
              <div className={'arg-input'}>
                {element}
              </div>
            </div>
          );
        });

        if (methodScheme.multipleArgs) {
          const fistsArg = methodScheme.args[0];
          for (let i = 0; i < this.state.clonedInputs; i++) {
            const index = args.length;
            args.push(
              <div className={'method-arg'} key={index}>
                <div className={'arg-name'}>{fistsArg.name}</div>
                <div className={'arg-input'}>
                  <input ref={this.refArg.bind(this, index)} type={fistsArg.type}
                         defaultValue={method.args[index]}/>
                </div>
              </div>
            );
          }

          let removeBtn = null;
          if (this.state.clonedInputs > 0) {
            removeBtn = (
              <button onClick={this.handleRemoveArg}>Remove argument</button>
            );
          }

          args.push(
            <div className={'arg-controls'}>
              <button onClick={this.handleAddArg}>Add argument</button>
              {removeBtn}
            </div>
          );
        }
      }
    }

    return ReactDOM.createPortal(
      <div className={'method-dialog'}>
        <form onSubmit={this.handleSubmit}>
          <div className="method-title">{method.name}</div>
          {args}
          <div className={'dialog-footer'}>
            <button className={'dialog-button dialog-button-submit'} type="submit">Save</button>
            <button className={'dialog-button'} onClick={this.handleCancel}>Cancel</button>
          </div>
        </form>
      </div>,
      document.body
    );
  }
}

export default EditMethodDialog;