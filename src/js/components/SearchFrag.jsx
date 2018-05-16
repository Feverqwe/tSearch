import {observer} from 'mobx-react';
import React from 'react';
import Table from './Table';

const debug = require('debug')('SearchFrag');
const qs = require('querystring');

@observer class SearchFrag extends React.Component {
  componentDidMount() {
    const params = qs.parse(this.props.location.search.substr(1));
    this.search(params.query);
  }
  componentWillUnmount() {
    this.clearSearch();
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.location !== nextProps.location) {
      if (nextProps.location) {
        const params = qs.parse(nextProps.location.search.substr(1));
        this.search(params.query);
      }
    }
  }
  clearSearch() {
    /**@type {IndexM}*/
    const store = this.props.store;
    store.clearSearch();
  }
  search(query) {
    /**@type {IndexM}*/
    const store = this.props.store;
    store.createSearch(query);
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