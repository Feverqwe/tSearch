import {observer} from 'mobx-react';
import React from 'react';
import Table from './Table';
import getLogger from "../tools/getLogger";

const qs = require('querystring');

const debug = getLogger('SearchFrag');

@observer class SearchFrag extends React.Component {
  componentDidMount() {
    const params = qs.parse(this.props.location.search.substr(1));
    this.props.store.createSearch(params.query);
  }
  componentWillUnmount() {
    this.props.store.destroySearch();
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.location !== nextProps.location) {
      if (nextProps.location) {
        const params = qs.parse(nextProps.location.search.substr(1));
        this.props.store.createSearch(params.query);
      }
    }
  }
  render() {
    /**@type {IndexM}*/
    const store = this.props.store;

    if (!store.searchFrag) {
      return (
        'Nothing yet...'
      );
    }

    if (store.searchFrag.state === 'loading') {
      return (
        'Loading...'
      );
    }

    return (
      store.searchFrag.tables.map(table => {
        return (
          <Table key={table.id} table={table} searchFrag={store.searchFrag} store={store}/>
        );
      })
    );
  }
}

export default SearchFrag;