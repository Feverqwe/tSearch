import '../assets/css/dialog.less';
import React from 'react';
import ReactDOM from 'react-dom';

class Dialog extends React.Component {
  constructor(props) {
    super(props);

    this.dialog = null;
  }

  componentDidMount() {
    document.addEventListener('click', this.handleBodyClick);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleBodyClick);
  }

  handleBodyClick = (e) => {
    if (!this.dialog.contains(e.target)) {
      this.props.onClose();
    }
  };

  refDialog = (element) => {
    this.dialog = element;
  };

  render() {
    const classList = ['dialog__body'];
    if (this.props.className) {
      classList.push(this.props.className);
    }

    const {onClose, ...props} = this.props;

    const dialog = (
      <div {...props} ref={this.refDialog} className={classList.join(' ')}>
        {this.props.children}
      </div>
    );

    return ReactDOM.createPortal(dialog, document.body);
  }
}

export default Dialog;