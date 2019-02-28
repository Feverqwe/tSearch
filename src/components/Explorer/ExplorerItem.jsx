import {inject, observer} from "mobx-react";
import React from "react";
import PropTypes from "prop-types";
import Dialog from "../Dialog";
import {Link} from "react-router-dom";
import highlight from "../../tools/highlight";

const qs = require('querystring');

@inject('rootStore')
@observer
class ExplorerItem extends React.Component {
  static propTypes = {
    index: PropTypes.number.isRequired,
    rootStore: PropTypes.object,
    sectionStore: PropTypes.object.isRequired,
    itemStore: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      posterError: false,
      edit: false,
      showQuickSearch: false,
    };
  }

  /**@return {RootStore}*/
  get rootStore() {
    return this.props.rootStore;
  }

  /**@return {ExplorerSectionStore}*/
  get sectionStore() {
    return this.props.sectionStore;
  }

  /**@return {ExplorerItemStore}*/
  get itemStore() {
    return this.props.itemStore;
  }

  handlePosterError = (e) => {
    this.setState({
      posterError: true
    });
  };

  handleEditFavorite = (e) => {
    this.setState({
      edit: true
    });
  };

  handleDialogCancel = (e) => {
    e.preventDefault();

    this.handleDialogClose();
  };

  handleDialogClose = (e) => {
    this.setState({
      posterError: false,
      edit: false
    });
  };

  handleRemoveFavorite = (e) => {
    e.preventDefault();
    this.itemStore.removeFavorite();
  };

  handleAddFavorite = (e) => {
    e.preventDefault();
    this.itemStore.addFavorite();
  };

  title = null;
  refTitle = (element) => {
    this.title = element;
  };

  titleOriginal = null;
  refTitleOriginal = (element) => {
    this.titleOriginal = element;
  };

  poster = null;
  refPoster = (element) => {
    this.poster = element;
  };

  url = null;
  refUrl = (element) => {
    this.url = element;
  };

  handleDialogSave = (e) => {
    e.preventDefault();

    this.itemStore.updateProps({
      title: this.title.value,
      titleOriginal: this.titleOriginal.value,
      poster: this.poster.value,
      url: this.url.value,
    }).then(() => {
      this.handleDialogClose();
    });
  };

  handleQuickSearch = (e) => {
    e.preventDefault();
    this.itemStore.quickSearch();
  };

  handleQuickSearchMouseEnter = (e) => {
    this.setState({
      showQuickSearch: true,
    });
  };

  handleQuickSearchMouseLeave = (e) => {
    this.setState({
      showQuickSearch: false,
    });
  };

  render() {
    const sectionStore = this.sectionStore;
    const itemStore = this.itemStore;

    let posterUrl = itemStore.poster;
    if (!posterUrl || this.state.posterError) {
      posterUrl = require('!url-loader!../../assets/img/no_poster.png');
    }

    const actions = [];
    if (sectionStore.id === 'favorites') {
      actions.push(
        <div key={'rmFavorite'} onClick={this.handleRemoveFavorite} title={chrome.i18n.getMessage('removeFromFavorite')}
             className="action__rmFavorite"/>
      );
      actions.push(
        <div key={'move'} title={chrome.i18n.getMessage('move')} className="action__move"/>
      );
      actions.push(
        <div key={'edit'} onClick={this.handleEditFavorite} title={chrome.i18n.getMessage('edit')}
             className="action__edit"/>
      );
    } else {
      actions.push(
        <div key={'favorite'} onClick={this.handleAddFavorite} title={chrome.i18n.getMessage('addInFavorite')}
             className="action__favorite"/>,
      );
    }

    let dialog = null;
    if (this.state.edit) {
      dialog = (
        <Dialog className={'dialog-poster_edit'} onClose={this.handleDialogClose}>
          <form onSubmit={this.handleDialogSave}>
            <span className="dialog__label">{chrome.i18n.getMessage('title')}</span>
            <input ref={this.refTitle} defaultValue={itemStore.title} className="input__input" name="title"
                   type="text"/>
            <span className="dialog__label">{chrome.i18n.getMessage('originalTitle')}</span>
            <input ref={this.refTitleOriginal} defaultValue={itemStore.titleOriginal} className="input__input"
                   name="titleOriginal" type="text"/>
            <span className="dialog__label">{chrome.i18n.getMessage('imageUrl')}</span>
            <input ref={this.refPoster} defaultValue={itemStore.poster} className="input__input" name="poster"
                   type="text"/>
            <span className="dialog__label">{chrome.i18n.getMessage('descUrl')}</span>
            <input ref={this.refUrl} defaultValue={itemStore.url} className="input__input" name="url" type="text"/>
            <div className="dialog__button_box">
              <input value={chrome.i18n.getMessage('save')} className="button button-save" type="submit"/>
              <input onClick={this.handleDialogCancel} value={chrome.i18n.getMessage('cancel')}
                     className="button button-cancel" type="button"/>
            </div>
          </form>
        </Dialog>
      );
    }

    const itemStyle = {
      zoom: sectionStore.zoom / 100
    };

    const title = itemStore.localTitle;

    const searchUrl = '/search?' + qs.stringify({
      query: title
    });

    let quickSearchResults = null;
    let quickSearchLabel = '?';
    const quickSearchItem = itemStore.quickSearchItem;
    if (quickSearchItem) {
      if (quickSearchItem.state === 'pending') {
        quickSearchLabel = '...';
      } else {
        quickSearchLabel = quickSearchItem.label;
      }
      if (this.state.showQuickSearch) {
        quickSearchResults = (
          <QuickSearchResults quickSearchItemStore={quickSearchItem} zoom={sectionStore.zoom}/>
        );
      }
    }

    return (
      <li data-index={this.props.index} style={itemStyle} className="section__poster poster">
        {dialog}
        <div className="poster__image">
          {actions}
          <div onClick={this.handleQuickSearch}
               onMouseEnter={this.handleQuickSearchMouseEnter}
               onMouseLeave={this.handleQuickSearchMouseLeave}
               title={chrome.i18n.getMessage('quickSearch')}
               className="action__quick_search">{quickSearchLabel}{quickSearchResults}</div>
          <a href={itemStore.url} title={chrome.i18n.getMessage('readMore')} className="image__more_link"
             target="_blank"/>
          <Link to={searchUrl} title={title} className="image__search_link">
            <img src={posterUrl} className="image__image" onError={this.handlePosterError} alt=""/>
          </Link>
        </div>
        <div className="poster__title">
          <span>
            <Link to={searchUrl} title={title} className="poster__search_link">{title}</Link>
          </span>
        </div>
      </li>
    );
  }
}

@observer
class QuickSearchResults extends React.Component {
  static propTypes = {
    quickSearchItemStore: PropTypes.object.isRequired,
    zoom: PropTypes.number.isRequired,
  };

  /**@return ExplorerQuickSearchItemStore*/
  get quickSearchItemStore() {
    return this.props.quickSearchItemStore;
  }

  updatePosition() {
    const popupNode = this.popupNode;
    const labelNode = popupNode.parentNode;
    const angleNode = this.angleNode;
    if (labelNode && angleNode) {
      setPosition(labelNode, popupNode, this.angleNode, this.props.zoom);
    }
  }

  popupNode = null;
  refPopupNode = (element) => {
    this.popupNode = element;
    if (element) {
      this.updatePosition();
    }
  };

  angleNode = null;
  refAngleNode = (element) => {
    this.angleNode = element;
  };

  render() {
    const results = this.quickSearchItemStore.results.map((result) => {
      return (
        <li key={result.url} className="torrent__title">
          {highlight.getReactComponent('a', {
            className: 'title',
            target: '_blank',
            href: result.url
          }, result.title, result.titleHighlightMap)}
          , {result.sizeText}
        </li>
      );
    });

    if (!results.length) {
      return null;
    }

    return (
      <div ref={this.refPopupNode} title="" className="quick_search quick_search__visible">
        <div className="popup">
          <div ref={this.refAngleNode} className="popup__angle_shadow">
            <div className="popup__angle"/>
          </div>
          <div className="popup__body">
            <ul>
              {results}
            </ul>
          </div>
        </div>
      </div>
    );
  }
}

const getRectWithOffset = function(node, zoom) {
  const box = node.getBoundingClientRect();
  return {
    top: Math.round(box.top * zoom + window.pageYOffset),
    left: Math.round(box.left * zoom + window.pageXOffset),
    width: box.width * zoom,
    height: box.height * zoom
  }
};

const setPosition = function (labelNode, popupNode, angleNode, zoom) {
  zoom = zoom / 100;
  const popupWidth = 300 * zoom;

  const labelRect = getRectWithOffset(labelNode, zoom);

  const labelCenterPos = labelRect.left + labelRect.width / 2;
  const popupRightPos = labelCenterPos + popupWidth / 2;

  let popupLeftPos = labelCenterPos - popupWidth / 2;
  const docWidth = document.body.clientWidth;
  if (popupRightPos > docWidth) {
    popupLeftPos = docWidth - popupWidth;
  }
  if (popupLeftPos < 0) {
    popupLeftPos = 0;
  }

  const angleLeftPercent = 100 / popupWidth * (labelCenterPos - popupLeftPos);

  popupLeftPos -= labelRect.left;

  angleNode.style.left = angleLeftPercent + '%';
  popupNode.style.left = popupLeftPos / zoom + 'px';
  popupNode.style.top = ((labelRect.height - 5) / zoom) + 'px';
};

export default ExplorerItem;