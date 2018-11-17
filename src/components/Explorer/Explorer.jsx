import React from "react";
import {inject, observer} from "mobx-react/index";
import PropTypes from "prop-types";

@inject('rootStore')
@observer
class Explorer extends React.Component {
  static propTypes = {
    rootStore: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);

    if (this.explorerStore.state === 'idle') {
      this.explorerStore.fetchSections();
    }
  }

  /**ExplorerStore*/
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
    });

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
    };

    if (this.sectionStore.state === 'idle') {
      this.sectionStore.fetchModule();
    }
  }

  /**@return ExplorerSectionStore*/
  get sectionStore() {
    return this.props.sectionStore;
  }

  render() {
    if (this.sectionStore.state !== 'done') {
      return (`Loading section: ${this.sectionStore.state}`);
    }

    return null;
  }
}

export default Explorer;