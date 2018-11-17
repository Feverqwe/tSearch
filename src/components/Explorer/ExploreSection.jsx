import {observer} from "mobx-react";
import React from "react";
import PropTypes from "prop-types";

@observer
class ExploreSection extends React.Component {
  static propTypes = {
    explorerStore: PropTypes.object.isRequired,
    sectionStore: PropTypes.object.isRequired,
    'data-index': PropTypes.number.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      page: 0,
      minBodyHeight: 0,
      showOptions: false,
      isEmpty: false
    };
  }

  /**@return {ExplorerSectionStore}*/
  get sectionStore() {
    return this.props.sectionStore;
  }

  /**@return {ExplorerModuleStore}*/
  get moduleStore() {
    return this.sectionStore && this.sectionStore.module;
  }

  render() {
    if (!this.moduleStore) {
      return (`Module ${this.sectionStore.id} is not found`);
    }

    const classList = ['section'];
    if (this.sectionStore.state === 'pending') {
      classList.push('section-loading');
    } else
    if (this.sectionStore.authRequired) {
      classList.push('section-login');
    } else
    if (this.sectionStore.state === 'error') {
      classList.push('section-error');
    }

    if (this.sectionStore.id === 'favorite' && this.state.isEmpty) {
      classList.push('section-empty');
    }

    if (this.sectionStore.collapsed) {
      classList.push('section-collapsed');
    }

    let body = null;
    if (!this.sectionStore.collapsed) {
      body = (
        <SectionBody sectionStore={this.sectionStore} moduleStore={this.moduleStore}/>
      );
    }

    return (
      <li data-index={this.props['data-index']} className={classList.join(' ')}>
        <SectionHeader sectionStore={this.sectionStore} moduleStore={this.moduleStore}/>
        {body}
      </li>
    );
  }
}

@observer
class SectionHeader extends React.Component {
  static propTypes = {
    sectionStore: PropTypes.object.isRequired,
    moduleStore: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);


  }

  /**@return {ExplorerSectionStore}*/
  get sectionStore() {
    return this.props.sectionStore;
  }

  /**@return {ExplorerModuleStore}*/
  get moduleStore() {
    return this.props.moduleStore;
  }

  render() {
    return null;
  }
}

@observer
class SectionBody extends React.Component {
  static propTypes = {
    sectionStore: PropTypes.object.isRequired,
    moduleStore: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);

    if (this.sectionStore.state === 'idle') {
      this.sectionStore.fetchData();
    }
  }

  /**@return {ExplorerSectionStore}*/
  get sectionStore() {
    return this.props.sectionStore;
  }

  /**@return {ExplorerModuleStore}*/
  get moduleStore() {
    return this.props.moduleStore;
  }

  render() {
    return null;
  }
}

export default ExploreSection;