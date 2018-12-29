import {inject, observer} from "mobx-react";
import React from "react";
import PropTypes from "prop-types";

@inject('rootStore')
@observer
class WhenReady extends React.Component {
  static propTypes = {
    rootStore: PropTypes.object,
  };

  constructor(props) {
    super(props);

    if (this.rootStore.options.state === 'idle') {
      this.rootStore.options.fetchOptions();
    }
  }

  /**@return RootStore*/
  get rootStore() {
    return this.props.rootStore;
  }

  componentDidMount() {
    this.rootStore.checkForUpdate();
  }

  render() {
    let whenOptionsReady = null;
    if (this.rootStore.options.state === 'done') {
      whenOptionsReady = (
        <WhenOptionsReady/>
      );
    }

    return (
      <>
        {whenOptionsReady}
      </>
    );
  }
}

@inject('rootStore')
class WhenOptionsReady extends React.Component {
  static propTypes = {
    rootStore: PropTypes.object,
  };

  /**@return RootStore*/
  get rootStore() {
    return this.props.rootStore;
  }

  /**@return OptionsStore*/
  get optionsStore() {
    return this.props.rootStore.options;
  }

  componentDidMount() {
    if (!this.optionsStore.options.doNotSendStatistics) {
      this.rootStore.analytics.init();
    }
  }

  render() {
    return null;
  }
}

export default WhenReady;