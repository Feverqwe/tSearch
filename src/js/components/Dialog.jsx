import React from 'react';
import ReactDOM from 'react-dom';
import '../../css/dialog.less';

class Dialog extends React.Component {
  constructor() {
    super();

    this.onBodyClick = this.onBodyClick.bind(this);
  }
  onBodyClick(e) {
    if (!this.refs.dialogNode.contains(e.target)) {
      this.props.onClose(e);
    }
  }
  componentWillMount() {
    document.addEventListener('click', this.onBodyClick);
  }
  componentWillUnmount() {
    document.removeEventListener('click', this.onBodyClick);
  }
  render() {
    const classList = ['dialog__body'];
    if (this.props.className) {
      classList.push(this.props.className);
    }
    const dialog = (
      <div ref={'dialogNode'} className={classList.join(' ')}>
        {this.props.children}
      </div>
    );
    return ReactDOM.createPortal(dialog, document.body);
  }
}

export default Dialog;