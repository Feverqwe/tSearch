import React from 'react';
import ReactDOM from 'react-dom';
import popupStyle from '../css/popup.less';
import SearchForm from './components/SearchForm';
import searchFormModel from "./models/searchForm";


class Popup extends React.Component {
  render() {
    return (
      <div className="search">
        <SearchForm store={{searchForm: searchFormModel.create({})}}/>
      </div>
    );
  }
}

ReactDOM.render(<Popup/>, document.getElementById('root'));