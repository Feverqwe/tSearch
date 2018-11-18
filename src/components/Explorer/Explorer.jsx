import '../../assets/css/explore.less';
import React from "react";
import {inject, observer} from "mobx-react/index";
import PropTypes from "prop-types";
import getLogger from "../../tools/getLogger";
import ExploreSection from "./ExploreSection";

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

          this.explorerStore.moveSection(index, prev, next);
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
        <ExploreSection key={section.id} index={index} sectionStore={section}/>
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

export default Explorer;