import React from 'react';
import ReactDOM from 'react-dom';
import '../css/popup.less';
import SearchForm from './components/SearchForm';

const Popup = () => {
  return (
    <div className="search">
      <SearchForm/>
    </div>
  );
};

ReactDOM.render(<Popup/>, document.getElementById('root'));