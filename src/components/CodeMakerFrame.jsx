import React from "react";
import PropTypes from "prop-types";
import exKitRequest from "../tools/exKitRequest";
import exKitGetDoc from "../tools/exKitGetDoc";
import getDoc5 from "../sandbox/getDoc5";
import getLogger from "../tools/getLogger";
import getNodePath from "../tools/getNodePath";

const logger = getLogger('CodeMakerFrame');

class CodeMakerFrame extends React.Component {
  static propTypes = {
    options: PropTypes.object,
    selectMode: PropTypes.bool,
    selectListener: PropTypes.func,
    onSelect: PropTypes.func,
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

    return Promise.resolve().then(() => {
      return exKitRequest(this.reqTracker, options);
    }).then(response => {
      const doc = exKitGetDoc(response.body, response.url);
      const newFrameDoc = getDoc5(response.body, response.url, this.frame.contentDocument);

      const kitStyle = document.createElement('style');
      kitStyle.textContent = `
      .kit_select {
        color:#000 !important;
        background-color:#FFCC33 !important;
        cursor:pointer;
        box-shadow: 0 0 3px red, inset 0 0 3px red !important;
      }`;

      if (newFrameDoc.head) {
        newFrameDoc.head.appendChild(kitStyle);
      } else
      if (newFrameDoc.body) {
        newFrameDoc.body.appendChild(kitStyle);
      } else {
        newFrameDoc.appendChild(kitStyle);
      }

      const frameDoc = this.frame.contentDocument.documentElement.parentNode;
      frameDoc.textContent = '';
      while (frameDoc.childNodes.length) {
        frameDoc.removeChild(frameDoc.firstChild);
      }
      while (newFrameDoc.childNodes.length) {
        frameDoc.appendChild(newFrameDoc.firstChild);
      }

      this.doc = doc;
      this.frameDoc = frameDoc;

      this.setState({
        state: 'done'
      });

      return response;
    }, err => {
      this.setState({
        state: 'error'
      });

      logger.error('requestPage error', err);
    });
  }

  abort() {
    this.reqTracker.requests.forEach(request => {
      request.abort();
    });
  }

  resolvePath(path) {
    return this.doc.querySelector(path);
  }

  render() {
    let selectMode = null;
    if (this.state.state === 'done' && this.state.selectMode) {
      selectMode = (
        <CodeMakerFrameSelectMode key={'selectMode'} frameDoc={this.frameDoc} selectListener={this.state.selectListener} onSelect={this.state.onSelect}/>
      );
    }

    return [
      <iframe key={'frame'} ref={this.refFrame} sandbox="allow-same-origin allow-scripts"/>,
      selectMode
    ];
  }
}

class CodeMakerFrameSelectMode extends React.Component {
  static propTypes = null && {
    frameDoc: PropTypes.instanceOf(HTMLDocument),
  };

  constructor(props) {
    super(props);

    this.state = {
      selectListener: props.selectListener,
      onSelect: props.onSelect,
    };

    this.selectClassName = 'kit_select';

    this.lastSelectedNode = null;
  }

  static getDerivedStateFromProps(props, state) {
    if (
      props.selectListener !== state.selectListener ||
      props.onSelect !== state.onSelect
    ) {
      return {
        selectListener: props.selectListener,
        onSelect: props.onSelect,
      };
    }
    // Return null to indicate no change to state.
    return null;
  }

  componentDidMount() {
    this.props.frameDoc.addEventListener('mouseover', this.handleMouseOver);
    this.props.frameDoc.addEventListener('mouseup', this.handleClick);
  }

  componentWillUnmount() {
    this.hideSelect();
    this.props.frameDoc.removeEventListener('mouseover', this.handleMouseOver);
    this.props.frameDoc.removeEventListener('mouseup', this.handleClick);
  }

  hideSelect() {
    Array.from(this.props.frameDoc.querySelectorAll(`.${this.selectClassName}`)).forEach(element => {
      element.classList.remove(this.selectClassName);
    });
  }

  handleClick = e => {
    const node = e.target;
    if (node.nodeType === 1) {
      if (this.state.onSelect) {
        const path = getNodePath(node, this.props.frameDoc, {
          skipClassNames: ['kit_select']
        });
        this.state.onSelect(path);
      }
    }
  };

  handleMouseOver = e => {
    const node = e.target;
    if (node.nodeType === 1) {
      if (this.lastSelectedNode) {
        this.lastSelectedNode.classList.remove(this.selectClassName);
      }
      this.lastSelectedNode = node;

      node.classList.add(this.selectClassName);

      if (this.state.selectListener) {
        const path = getNodePath(node, this.props.frameDoc, {
          skipClassNames: ['kit_select']
        });
        this.state.selectListener(path);
      }
    }
  };

  render() {
    return null;
  }
}

export default CodeMakerFrame;