import './searchForm.less';
import React from 'react';
import Autosuggest from 'react-autosuggest';
import {observer} from 'mobx-react';
import searchFormModel from "./searchFormModel";

const debug = require('debug')('SearchForm');

@observer class SearchForm extends React.Component {
  constructor() {
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
  componentWillUnmount() {
    this.store.destroy();
    this.store = null;
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
    this.props.onSubmit(this.store.query);
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

export default SearchForm;