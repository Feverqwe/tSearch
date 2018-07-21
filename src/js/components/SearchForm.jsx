import '../../css/searchForm.less';
import React from 'react';
import Autosuggest from 'react-autosuggest';
import {observer} from 'mobx-react';
import searchFormModel from "../models/searchForm";

const debug = require('debug')('SearchForm');
const qs = require('querystring');

class SearchForm_ extends React.Component {
  constructor(props) {
    super();

    this.store = searchFormModel.create();

    this.state = {
      shouldRenderSuggestions: false
    };

    this.handleChange = this.handleChange.bind(this);
    this.RenderSuggestion = this.RenderSuggestion.bind(this);
    this.shouldRenderSuggestions = this.shouldRenderSuggestions.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.enableRenderSuggestions = this.enableRenderSuggestions.bind(this);
  }
  enableRenderSuggestions() {
    if (!this.state.shouldRenderSuggestions) {
      this.setState({
        shouldRenderSuggestions: true
      });
    }
  }
  handleChange(e, {newValue}) {
    this.enableRenderSuggestions();
    this.store.setQuery(newValue);
  }
  shouldRenderSuggestions() {
    return this.state.shouldRenderSuggestions;
  }
  handleSubmit(e) {
    e.preventDefault();
    let url = 'index.html';
    if (this.store.query) {
      url += '#' + qs.stringify({
        query: this.store.query
      });
    }
    chrome.tabs.create({url: url});
  }
  RenderSuggestion(suggestion) {
    return (
      <span>{suggestion}</span>
    );
  }
  render() {
    const inputProps = {
      type: 'search',
      placeholder: chrome.i18n.getMessage('searchPlaceholder'),
      value: this.store.query,
      onChange: this.handleChange,
      autoFocus: true
    };

    if (!this.state.shouldRenderSuggestions) {
      inputProps.onClick = this.enableRenderSuggestions;
      inputProps.onBlur = this.enableRenderSuggestions;
      inputProps.onKeyDown = this.enableRenderSuggestions;
      inputProps.onMouseDown = this.enableRenderSuggestions;
    }

    return (
      <div className="search-from">
        <form onSubmit={this.handleSubmit}>
          <Autosuggest
            theme={{
              input: 'input',
              suggestionsContainer: 'suggestions-container',
              suggestionsList: 'suggestions-list',
              suggestion: 'suggestion',
              suggestionHighlighted: 'suggestion--highlighted'
            }}
            suggestions={this.store.getSuggestions()}
            onSuggestionsFetchRequested={this.store.handleFetchSuggestions}
            onSuggestionsClearRequested={this.store.handleClearSuggestions}
            shouldRenderSuggestions={this.shouldRenderSuggestions}
            getSuggestionValue={suggestion => suggestion}
            renderSuggestion={this.RenderSuggestion}
            inputProps={inputProps}
          />
          <button type="submit" className="submit">{chrome.i18n.getMessage('search')}</button>
        </form>
      </div>
    );
  }
}

@observer class SearchForm extends SearchForm_ {}

export default SearchForm;
export {SearchForm_};