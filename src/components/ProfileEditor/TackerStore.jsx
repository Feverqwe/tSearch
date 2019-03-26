import {observer} from "mobx-react";
import React from "react";
import PropTypes from "prop-types";
import TackerStoreItem from "./TackerStoreItem";


@observer
class TackerStore extends React.Component {
  static propTypes = {
    profileEditorStore: PropTypes.object.isRequired,
    showOptions: PropTypes.bool.isRequired,
  };

  /**@return ProfileEditorStore*/
  get profileEditorStore() {
    return this.props.profileEditorStore;
  }

  componentDidMount() {
    if (!this.profileEditorStore.trackerStore) {
      this.profileEditorStore.createTrackerStore();
      this.profileEditorStore.trackerStore.fetch();
    }
  }

  render() {
    let items = null;

    if (this.profileEditorStore.trackerStore) {
      if (this.profileEditorStore.trackerStore.state !== 'done') {
        return (`Loading: ${this.profileEditorStore.trackerStore.state}`);
      }

      items = this.profileEditorStore.trackerStore.results.map((module) => {
        return (
          <TackerStoreItem key={module.download_url} module={module}/>
        );
      });
    }

    return (
      <div className="manager__trackers">
        {items}
      </div>
    );
  }
}

export default TackerStore;