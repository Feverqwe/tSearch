import React from "react";
import PropTypes from "prop-types";
import exKitRequest from "../tools/exKitRequest";
import exKitGetDoc from "../tools/exKitGetDoc";
import getDoc5 from "../sandbox/getDoc5";
import getLogger from "../tools/getLogger";

const logger = getLogger('CodeMakerFrame');

class CodeMakerFrame extends React.Component {
  static propTypes = {
    options: PropTypes.object,
  };

  state = {
    state: 'idle',
    selectMode: false,
    selectListener: null,
    onSelect: null,
  };

  static getDerivedStateFromProps(props, state) {
    if (
      props.selectMode !== state.selectMode ||
      props.selectListener !== state.selectListener ||
      props.onSelect !== state.onSelect
    ) {
      return {
        selectMode: props.selectMode,
        selectListener: props.selectListener,
        onSelect: props.onSelect,
      };
    }
    // Return null to indicate no change to state.
    return null;
  }

  componentDidMount() {
    if (this.props.options) {
      this.requestPage(this.props.options);
    }
  }

  componentWillUnmount() {
    this.abort();
  }

  frameDoc = null;
  doc = null;

  frame = null;
  refFrame = element => {
    this.frame = element;
  };

  reqTracker = {
    connectRe: /.+/,
    requests: [],
  };

  requestPage(options) {
    this.abort();

    this.setState({
      state: 'pending'
    });

    return exKitRequest(this.reqTracker, options).then(response => {
      const doc = this.doc = exKitGetDoc(response.body, response.url);
      const frameDoc = this.frameDoc = getDoc5(response.body, response.url);

      const kitStyle = document.createElement('style');
      kitStyle.textContent = `
      .kit_select {
        color:#000 !important;
        background-color:#FFCC33 !important;
        cursor:pointer;
        box-shadow: 0 0 3px red, inset 0 0 3px red !important;
      }`;

      if (frameDoc.head) {
        frameDoc.head.appendChild(kitStyle);
      } else
      if (frameDoc.body) {
        frameDoc.body.appendChild(kitStyle);
      } else {
        frameDoc.appendChild(kitStyle);
      }

      const currentFrameDoc = this.frame.contentDocument.documentElement.parentNode;
      currentFrameDoc.replaceChild(frameDoc.documentElement, currentFrameDoc.documentElement);

      this.setState({
        state: 'done'
      });

      return response;
    }, err => {
      this.setState({
        state: 'error'
      });

      throw err;
    });
  }

  abort() {
    this.reqTracker.requests.forEach(request => {
      request.abort();
    });
  }

  render() {
    let selectMode = null;
    if (this.state.state === 'done' && this.state.selectMode) {
      selectMode = (
        <CodeMakerFrameSelectMode key={'selectMode'} frame={this.frame} selectListener={this.state.selectListener} onSelect={this.state.onSelect}/>
      );
    }

    return [
      <iframe key={'frame'} ref={this.refFrame} sandbox="allow-same-origin allow-scripts"/>,
      selectMode
    ];
  }
}

class CodeMakerFrameSelectMode extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectListener: props.selectListener,
      onSelect: props.onSelect,
    };
  }

  static getDerivedStateFromProps(props, state) {
    if (
      props.selectListener !== state.selectListener ||
      props.onSelect !== state.onSelect
    ) {
      logger('selectListener, onSelect change');
      return {
        selectListener: props.selectListener,
        onSelect: props.onSelect,
      };
    }
    // Return null to indicate no change to state.
    return null;
  }

  componentDidMount() {
    logger('select mount');
    // this.frame
  }

  componentWillUnmount() {
    logger('select unmount');
    // this.frame
  }

  handleSelectElement = e => {
    if (!this.state.onSelect) return;

    const path = null;
    const node = null;

    this.state.onSelect(path, node);
  };

  handleElementEnter = e => {
    if (!this.state.selectListener) return;

    const path = null;
    const node = null;

    this.state.selectListener(path, node);
  };

  render() {
    return null;
  }
}

export default CodeMakerFrame;