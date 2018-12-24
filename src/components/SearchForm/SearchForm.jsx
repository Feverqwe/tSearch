import './searchForm.less';
import React from 'react';
import Autosuggest from 'react-autosuggest';
import {inject, observer} from 'mobx-react';
import getLogger from "../../tools/getLogger";
import PropTypes from 'prop-types';

const debug = getLogger('SearchForm');

@inject('rootStore')
@observer
class SearchForm extends React.Component {
  static propTypes = {
    rootStore: PropTypes.object,
  };

  constructor(props) {
    super(props);

    this.state = {
      shouldRenderSuggestions: false
    };
  }

  componentDidMount() {
    if (this.props.rootStore.history.state === 'idle') {
      this.props.rootStore.history.fetchHistory();
    }
  }

  enableRenderSuggestions = () => {
    if (!this.state.shouldRenderSuggestions) {
      this.setState({
        shouldRenderSuggestions: true
      });
    }
  };

  handleChange = (e, {newValue}) => {
    const searchForm = this.props.rootStore.searchForm;
    this.enableRenderSuggestions();
    searchForm.setQuery(newValue);
  };

  shouldRenderSuggestions = () => {
    return this.state.shouldRenderSuggestions;
  };

  handleSubmit = (e) => {
    const searchForm = this.props.rootStore.searchForm;
    e.preventDefault();
    this.props.onSubmit(searchForm.query);
  };

  handleFetchSuggestions = ({value}) => {
    this.props.rootStore.searchForm.fetchSuggestions(value);
  };

  handleClearSuggestions = () => {
    this.props.rootStore.searchForm.clearSuggestions();
  };

  renderSuggestion = (suggestion) => {
    return (
      <span>{suggestion}</span>
    );
  };

  render() {
    const searchForm = this.props.rootStore.searchForm;
    const inputProps = {
      type: 'search',
      placeholder: chrome.i18n.getMessage('searchPlaceholder'),
      value: searchForm.query,
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
            suggestions={searchForm.getSuggestions()}
            onSuggestionsFetchRequested={this.handleFetchSuggestions}
            onSuggestionsClearRequested={this.handleClearSuggestions}
            shouldRenderSuggestions={this.shouldRenderSuggestions}
            getSuggestionValue={suggestion => suggestion}
            renderSuggestion={this.renderSuggestion}
            inputProps={inputProps}
          />
          <button type="submit" className="submit">{chrome.i18n.getMessage('search')}</button>
        </form>
      </div>
    );
  }
}

export default SearchForm;