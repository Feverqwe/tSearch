import {inject, observer} from "mobx-react";
import React from "react";
import getLogger from "../tools/getLogger";
import PropTypes from "prop-types";

const logger = getLogger('ComponentLoader');


class ComponentLoader extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      state: 'idle'
    };

    this.Component = null;
  }
  componentDidMount() {
    if (this.state.state === 'idle') {
      this.load();
    }
  }
  async load() {
    this.setState({state: 'pending'});
    try {
      let result = null;
      switch (this.props.page) {
        case 'editor': {
          result = await import('../pages/Editor');
          break;
        }
        default: {
          throw new Error('Component is not found');
        }
      }
      this.Component = result.default;
      this.setState({state: 'done'});
    } catch (err) {
      logger.error('Load error', err);
      this.setState({state: 'error'});
    }
  }
  render() {
    if (this.state.state !== 'done') {
      return (
        this.state.state
      );
    }

    return (
      <this.Component {...this.props}/>
    );
  }
}

ComponentLoader.propTypes = null && {
  page: PropTypes.string,
};

export default ComponentLoader;