import React from "react";
import {observer, inject} from "mobx-react/index";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.min.css';
import getLogger from "../tools/getLogger";
import PropTypes from "prop-types";
import RootStore from "../stores/RootStore";

const logger = getLogger('Filters');

class Filters extends React.Component {
  render() {
    return (
      <div className="parameter_box__right">
        <TextFilter/>
        <SizeFilter/>
        <TimeFilter/>
        <SeedFilter/>
        <PeerFilter/>
      </div>
    );
  }
}

@inject('rootStore')
@observer
class TextFilter extends React.Component {
  constructor() {
    super();

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleDoubleClick = this.handleDoubleClick.bind(this);
    this.onChange = this.onChange.bind(this);
  }
  onChange() {
    const filter = this.props.rootStore.filters;

    filter.setText(this.refs.input.value);
  }
  handleDoubleClick() {
    this.refs.input.value = '';
    this.onChange();
  }
  handleSubmit(e) {
    e.preventDefault();

    this.onChange();
  }
  render() {
    const filter = this.props.rootStore.filters;

    return (
      <div className="parameter parameter-filter">
        <span className="filter__label">{chrome.i18n.getMessage('wordFilterLabel')}</span>
        <form onSubmit={this.handleSubmit} className="input_box input_box-filter">
          <input
            onDoubleClick={this.handleDoubleClick}
            ref={'input'}
            onChange={this.onChange}
            defaultValue={filter.text}
            type="search" name="textFilter" className="input__input input__input-word-filter"/>
        </form>
      </div>
    );
  }
}

TextFilter.propTypes = null && {
  rootStore: PropTypes.instanceOf(RootStore)
};

@inject('rootStore')
@observer
class SizeFilter extends React.Component {
  constructor() {
    super();

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleDoubleClick = this.handleDoubleClick.bind(this);
    this.onChange = this.onChange.bind(this);
    this.factor = 1024 * 1024 * 1024;
  }
  onChange() {
    const filter = this.props.rootStore.filters;

    filter.setSize(this.refs.min.value * this.factor, this.refs.max.value * this.factor);
  }
  handleDoubleClick() {
    this.refs.min.value = '';
    this.refs.max.value = '';
    this.onChange();
  }
  handleSubmit(e) {
    e.preventDefault();

    this.onChange();
  }
  render() {
    const filter = this.props.rootStore.filters;

    return (
      <div className="parameter parameter-filter">
        <span className="filter__label">{chrome.i18n.getMessage('sizeFilterLabel')}</span>
        <form onSubmit={this.handleSubmit} className="input_box input_box-filter">
          <input
            onDoubleClick={this.handleDoubleClick}
            onChange={this.onChange}
            defaultValue={filter.minSize || ''}
            ref={'min'} name={'sizeMin'}
            className="input__input input__input-size-filter input__input-range input__input-range-from"
            type="number" placeholder={chrome.i18n.getMessage('rangeFromPlaceholder')}/>
          {' — '}
          <input
            onDoubleClick={this.handleDoubleClick}
            onChange={this.onChange}
            defaultValue={filter.maxSize || ''}
            ref={'max'} name={'sizeMax'}
            className="input__input input__input-size-filter input__input-range input__input-range-to"
            type="number" placeholder={chrome.i18n.getMessage('rangeToPlaceholder')}/>
        </form>
      </div>
    );
  }
}

SizeFilter.propTypes = null && {
  rootStore: PropTypes.instanceOf(RootStore)
};

@inject('rootStore')
@observer
class SeedFilter extends React.Component {
  constructor() {
    super();

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleDoubleClick = this.handleDoubleClick.bind(this);
    this.onChange = this.onChange.bind(this);
    this.factor = 1;
  }
  onChange() {
    const filter = this.props.rootStore.filters;

    filter.setSeed(this.refs.min.value * this.factor, this.refs.max.value * this.factor);
  }
  handleDoubleClick() {
    this.refs.min.value = '';
    this.refs.max.value = '';
    this.onChange();
  }
  handleSubmit(e) {
    e.preventDefault();

    this.onChange();
  }
  render() {
    const filter = this.props.rootStore.filters;

    return (
      <div className="parameter parameter-filter">
        <span className="filter__label">{chrome.i18n.getMessage('seedFilterLabel')}</span>
        <form onSubmit={this.handleSubmit} className="input_box input_box-filter">
          <input
            onDoubleClick={this.handleDoubleClick}
            onChange={this.onChange}
            defaultValue={filter.minSeed || ''}
            ref={'min'} name={'seedMin'}
            className="input__input input__input-seed-filter input__input-range input__input-range-from"
            type="number" placeholder={chrome.i18n.getMessage('rangeFromPlaceholder')}/>
          {' — '}
          <input
            onDoubleClick={this.handleDoubleClick}
            onChange={this.onChange}
            defaultValue={filter.maxSeed || ''}
            ref={'max'} name={'seedMax'}
            className="input__input input__input-seed-filter input__input-range input__input-range-to"
            type="number" placeholder={chrome.i18n.getMessage('rangeToPlaceholder')}/>
        </form>
      </div>
    );
  }
}

SeedFilter.propTypes = null && {
  rootStore: PropTypes.instanceOf(RootStore)
};

@inject('rootStore')
@observer
class PeerFilter extends React.Component {
  constructor() {
    super();

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleDoubleClick = this.handleDoubleClick.bind(this);
    this.onChange = this.onChange.bind(this);
    this.factor = 1;
  }
  onChange() {
    const filter = this.props.rootStore.filters;

    filter.setPeer(this.refs.min.value * this.factor, this.refs.max.value * this.factor);
  }
  handleDoubleClick() {
    this.refs.min.value = '';
    this.refs.max.value = '';
    this.onChange();
  }
  handleSubmit(e) {
    e.preventDefault();

    this.onChange();
  }
  render() {
    const filter = this.props.rootStore.filters;

    return (
      <div className="parameter parameter-filter">
        <span className="filter__label">{chrome.i18n.getMessage('peerFilterLabel')}</span>
        <form onSubmit={this.handleSubmit} className="input_box input_box-filter">
          <input
            onDoubleClick={this.handleDoubleClick}
            onChange={this.onChange}
            defaultValue={filter.minPeer || ''}
            ref={'min'} name={'peerMin'}
            className="input__input input__input-peer-filter input__input-range input__input-range-from"
            type="number" placeholder={chrome.i18n.getMessage('rangeFromPlaceholder')}/>
          {' — '}
          <input
            onDoubleClick={this.handleDoubleClick}
            onChange={this.onChange}
            defaultValue={filter.maxPeer || ''}
            ref={'max'} name={'peerMax'}
            className="input__input input__input-peer-filter input__input-range input__input-range-to"
            type="number" placeholder={chrome.i18n.getMessage('rangeToPlaceholder')}/>
        </form>
      </div>
    );
  }
}

PeerFilter.propTypes = null && {
  rootStore: PropTypes.instanceOf(RootStore)
};

@inject('rootStore')
@observer
class TimeFilter extends React.Component {
  constructor() {
    super();

    this.state = {
      showRange: false,
      minDate: null,
      maxDate: null,
      min: 0,
      max: 0
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleSelectChange = this.handleSelectChange.bind(this);
    this.handleMinDateChange = this.handleMinDateChange.bind(this);
    this.handleMaxDateChange = this.handleMaxDateChange.bind(this);
    this.handleDoubleClick = this.handleDoubleClick.bind(this);

    this.onChange = this.onChange.bind(this);
    this.onCreateDatePicker = this.onCreateDatePicker.bind(this);

    this.selectorOptions = new Map();
    [
      [0, chrome.i18n.getMessage('timeFilterAll')],
      [3600, chrome.i18n.getMessage('timeFilter1h')],
      [86400, chrome.i18n.getMessage('timeFilter24h')],
      [259200, chrome.i18n.getMessage('timeFilter72h')],
      [604800, chrome.i18n.getMessage('timeFilter1w')],
      [2592000, chrome.i18n.getMessage('timeFilter1m')],
      [31536000, chrome.i18n.getMessage('timeFilter1y')],
      [-1, chrome.i18n.getMessage('timeFilterRange')]
    ].forEach(([key, value]) => {
      this.selectorOptions.set(key, value);
    });

    this.factor = 1;
  }
  onChange() {
    const filter = this.props.rootStore.filters;

    filter.setTime(this.state.min * this.factor, this.state.max * this.factor);
  }
  handleDoubleClick() {
    this.state.min = 0;
    this.state.max = 0;
    this.onChange();
    this.setState({
      minDate: null,
      maxDate: null
    });
  }
  handleSubmit(e) {
    e.preventDefault();

    this.onChange();
  }
  handleSelectChange() {
    const value = parseInt(this.refs.select.value, 10);
    const isExtra = value === -1;
    if (this.state.showRange !== isExtra) {
      const {minDate, maxDate} = this.state;
      const min = minDate && minDate.unix() || 0;
      const max = maxDate && maxDate.unix() || 0;
      if (min || max) {
        this.state.min = min;
        this.state.max = max;
        this.onChange();
      }
      this.setState({
        showRange: isExtra
      });
    }

    if (!isExtra) {
      this.state.min = value === 0 ? 0 : Math.trunc(Date.now() / 1000) - value;
      this.state.max = 0;
      this.onChange();
    }
  }
  getSelect() {
    const filter = this.props.rootStore.filters;

    let defaultValue = -1;
    const options = [];
    this.selectorOptions.forEach((value, key) => {
      if (key === filter.minTime) {
        defaultValue = key;
      }
      options.push(
        <option key={options.length} value={key}>{value}</option>
      );
    });

    return (
      <select ref={'select'} onChange={this.handleSelectChange} className="select__select select__select-time-filter" defaultValue={defaultValue}>
        {options}
      </select>
    );
  }
  handleMinDateChange(date) {
    this.state.min = date && date.unix() || 0;
    this.onChange();
    this.setState({
      minDate: date
    });
  }
  handleMaxDateChange(date) {
    this.state.max = date && date.unix() || 0;
    this.onChange();
    this.setState({
      maxDate: date
    });
  }
  onCreateDatePicker(dataPicker) {
    if (dataPicker) {
      dataPicker.input.addEventListener('dblclick', this.handleDoubleClick);
    }
  }
  getRange() {
    return (
      <form onSubmit={this.handleSubmit} className="input_box input_box-filter input_box-time-filter input_box-time-filter-visible">
        <DatePicker
          ref={this.onCreateDatePicker}
          name={'timeMin'}
          selected={this.state.minDate}
          onChange={this.handleMinDateChange}
          className="input__input input__input-time-filter input__input-range input__input-range-from"
        />
        {' — '}
        <DatePicker
          ref={this.onCreateDatePicker}
          name={'timeMax'}
          selected={this.state.maxDate}
          onChange={this.handleMaxDateChange}
          className="input__input input__input-time-filter input__input-range input__input-range-to"
        />
      </form>
    );
  }
  render() {
    let extra = null;
    if (this.state.showRange) {
      extra = this.getRange();
    }

    return (
      <div className="parameter parameter-filter">
        <span className="filter__label">{chrome.i18n.getMessage('timeFilterLabel')}</span>
        <div className="select">
          {this.getSelect()}
        </div>
        {extra}
      </div>
    );
  }
}

TimeFilter.propTypes = null && {
  rootStore: PropTypes.instanceOf(RootStore)
};

export default Filters;