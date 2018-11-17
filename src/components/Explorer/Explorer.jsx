import React from "react";
import {inject, observer} from "mobx-react/index";
import PropTypes from "prop-types";
import getLogger from "../../tools/getLogger";

const Sortable = require('sortablejs');

const logger = getLogger('Explorer');

@inject('rootStore')
@observer
class Explorer extends React.Component {
  static propTypes = {
    rootStore: PropTypes.object,
  };

  constructor(props) {
    super(props);

    if (this.explorerStore.state === 'idle') {
      this.explorerStore.fetch();
    }
  }

  /**@return {ExplorerStore}*/
  get explorerStore() {
    return this.props.rootStore.explorer;
  }

  sortable = null;
  refSections = (node) => {
    if (!node) {
      if (this.sortable) {
        this.sortable.destroy();
        this.sortable = null;
        // debug('destroy');
      }
    } else
    if (this.sortable) {
      // debug('update');
    } else {
      // debug('create');
      this.sortable = new Sortable(node, {
        group: 'sections',
        handle: '.section__move',
        draggable: '.section',
        animation: 150,
        onStart: () => {
          node.classList.add('explore-sort');
        },
        onEnd: (e) => {
          node.classList.remove('explore-sort');

          const itemNode = e.item;
          const prevNode = itemNode.previousElementSibling;
          const nextNode = itemNode.nextElementSibling;
          const index = parseInt(itemNode.dataset.index, 10);
          const prev = prevNode && parseInt(prevNode.dataset.index, 10);
          const next = nextNode && parseInt(nextNode.dataset.index, 10);

          // todo: fix me
          // this.explorerStore.moveSection(index, prev, next);
        }
      });
    }
  };

  render() {
    if (this.explorerStore.state !== 'done') {
      return (`Loading explorer: ${this.explorerStore.state}`);
    }

    const sections = this.explorerStore.sections.reduce((result, section, index) => {
      result.push(
        <ExploreSection key={section.id} data-index={index} explorerStore={this.explorerStore} sectionStore={section}/>
      );
      return result;
    }, []);

    return (
      <ul ref={this.refSections} className="explore">
        {sections}
      </ul>
    );
  }
}

@observer
class ExploreSection extends React.Component {
  static propTypes = {
    explorerStore: PropTypes.object.isRequired,
    sectionStore: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      page: 0,
      minBodyHeight: 0,
      showOptions: false,
      isEmpty: false
    };

    if (this.sectionStore.state === 'idle' && this.moduleStore && !this.sectionStore.collapsed) {
      this.sectionStore.fetchData();
    }
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

    return (
      <li data-index={this.props['data-index']} className={classList.join(' ')}>
        {this.sectionStore.id}
      </li>
    );
  }
}

export default Explorer;