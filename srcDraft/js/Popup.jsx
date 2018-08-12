import React from 'react';
import ReactDOM from 'react-dom';
import '../../src/assets/css/popup.less';
import SearchForm from '../../src/components/SearchForm/SearchForm';

const qs = require('querystring');

class Popup extends React.Component {
  constructor() {
    super();

    this.handleSubmit = this.handleSubmit.bind(this);
  }
  handleSubmit(query) {
    let url = 'index.html';
    if (query) {
      url += '#/search?' + qs.stringify({
        query: query
      });
    }
    chrome.tabs.create({url: url});
  }
  render() {
    return (
      <div className="search">
        <SearchForm onSubmit={this.handleSubmit}/>
      </div>
    );
  }
}

ReactDOM.render(<Popup/>, document.getElementById('root'));