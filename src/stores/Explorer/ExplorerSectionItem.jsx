import {observer} from "mobx-react";
import React from "react";
import PropTypes from "prop-types";
import Dialog from "../../components/Dialog";

@observer
class ExplorerSectionItem extends React.Component {
  static propTypes = {
    index: PropTypes.number.isRequired,
    sectionStore: PropTypes.object.isRequired,
    itemStore: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      posterError: false,
      edit: false
    };
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
    this.itemStore.handleRemoveFavorite();
  };

  handleAddFavorite = (e) => {
    e.preventDefault();
    this.itemStore.handleAddFavorite();
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

  render() {
    const sectionStore = this.sectionStore;
    const itemStore = this.itemStore;

    let posterUrl = itemStore.poster;
    if (!posterUrl || this.state.posterError) {
      posterUrl = require('!url-loader!../../assets/img/no_poster.png');
    }

    const actions = [];
    if (sectionStore.id === 'favorite') {
      actions.push(
        <div key={'rmFavorite'} onClick={this.handleRemoveFavorite} className="action__rmFavorite"
             title={chrome.i18n.getMessage('removeFromFavorite')}/>
      );
      actions.push(
        <div key={'move'} className="action__move" title={chrome.i18n.getMessage('move')}/>
      );
      actions.push(
        <div key={'edit'} onClick={this.handleEditFavorite} className="action__edit"
             title={chrome.i18n.getMessage('edit')}/>
      );
    } else {
      actions.push(
        <div key={'favorite'} onClick={this.handleAddFavorite} className="action__favorite"
             title={chrome.i18n.getMessage('addInFavorite')}/>,
      );
    }

    let dialog = null;
    if (this.state.edit) {
      dialog = (
        <Dialog className={'dialog-poster_edit'} onClose={this.handleDialogClose}>
          <form onSubmit={this.handleDialogSave}>
            <span className="dialog__label">{chrome.i18n.getMessage('title')}</span>
            <input ref={this.refTitle} className="input__input" name="title" type="text" defaultValue={itemStore.title}/>
            <span className="dialog__label">{chrome.i18n.getMessage('title')}</span>
            <input ref={this.refTitleOriginal} className="input__input" name="titleOriginal" type="text"
                   defaultValue={itemStore.titleOriginal}/>
            <span className="dialog__label">{chrome.i18n.getMessage('imageUrl')}</span>
            <input ref={this.refPoster} className="input__input" name="poster" type="text" defaultValue={itemStore.poster}/>
            <span className="dialog__label">{chrome.i18n.getMessage('descUrl')}</span>
            <input ref={this.refUrl} className="input__input" name="url" type="text" defaultValue={itemStore.url}/>
            <div className="dialog__button_box">
              <input className="button button-save" type="submit" value={chrome.i18n.getMessage('save')}/>
              <input className="button button-cancel" type="button" onClick={this.handleDialogCancel}
                     value={chrome.i18n.getMessage('cancel')}/>
            </div>
          </form>
        </Dialog>
      );
    }

    const itemStyle = {
      zoom: sectionStore.zoom / 100
    };

    return (
      <li className="section__poster poster" style={itemStyle} data-index={this.props.index}>
        {dialog}
        <div className="poster__image">
          {actions}
          <div className="action__quick_search" title={chrome.i18n.getMessage('quickSearch')}>{'?'}</div>
          <a className="image__more_link" href={itemStore.url} target="_blank" title={chrome.i18n.getMessage('readMore')}/>
          <a className="image__search_link" href="#" title={itemStore.title}>
            <img className="image__image" src={posterUrl} onError={this.handlePosterError}/>
          </a>
        </div>
        <div className="poster__title">
          <span>
            <a className="poster__search_link" href="#" title={itemStore.title}>{itemStore.title}</a>
          </span>
        </div>
      </li>
    );
  }
}

export default ExplorerSectionItem;