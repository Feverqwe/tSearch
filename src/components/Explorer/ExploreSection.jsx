import {observer} from "mobx-react";
import React from "react";
import PropTypes from "prop-types";
import ExplorerSectionItem from "../../stores/Explorer/ExplorerSectionItem";

@observer
class ExploreSection extends React.Component {
  static propTypes = {
    explorerStore: PropTypes.object.isRequired,
    sectionStore: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      minHeight: 0,
      showOptions: false,
      isEmpty: false
    };
  }

  /**@return {ExplorerStore}*/
  get explorerStore() {
    return this.props.explorerStore;
  }

  /**@return {ExplorerSectionStore}*/
  get sectionStore() {
    return this.props.sectionStore;
  }

  /**@return {ExplorerModuleStore}*/
  get moduleStore() {
    return this.sectionStore && this.sectionStore.module;
  }

  setMinHeight = (height) => {
    this.setState({
      minHeight: height,
    });
  };

  render() {
    if (!this.moduleStore) {
      return (`Module ${this.sectionStore.id} is not found`);
    }

    const classList = ['section'];
    if (this.sectionStore.state === 'pending') {
      classList.push('section-loading');
    } else
    if (this.sectionStore.authRequired) {
      classList.push('section-login');
    } else
    if (this.sectionStore.state === 'error') {
      classList.push('section-error');
    }

    if (this.sectionStore.id === 'favorite' && this.state.isEmpty) {
      classList.push('section-empty');
    }

    if (this.sectionStore.collapsed) {
      classList.push('section-collapsed');
    }

    let body = null;
    if (!this.sectionStore.collapsed) {
      body = (
        <SectionBody setMinHeight={this.setMinHeight} minHeight={this.state.minHeight} sectionStore={this.sectionStore}/>
      );
    }

    return (
      <li data-index={this.props.index} className={classList.join(' ')}>
        <SectionHeader setMinHeight={this.setMinHeight} sectionStore={this.sectionStore} moduleStore={this.moduleStore}/>
        {body}
      </li>
    );
  }
}

@observer
class SectionHeader extends React.Component {
  static propTypes = {
    sectionStore: PropTypes.object.isRequired,
    moduleStore: PropTypes.object.isRequired,
    setMinHeight: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      showOptions: false,
    };
  }

  /**@return {ExplorerSectionStore}*/
  get sectionStore() {
    return this.props.sectionStore;
  }

  /**@return {ExplorerModuleStore}*/
  get moduleStore() {
    return this.props.moduleStore;
  }

  zoomRange = null;
  refZoomRange = (element) => {
    this.zoomRange = element;
  };

  handleZoomRangeChange = (e) => {
    this.props.setMinHeight(0);
    const zoom = parseInt(this.zoomRange.value, 10);
    this.sectionStore.setItemZoom(zoom);
  };

  handleResetItemZoom = (e) => {
    e.preventDefault();
    this.props.setMinHeight(0);
    this.zoomRange.value = 100;
    this.sectionStore.setItemZoom(100);
  };

  handleOptionsClick = (e) => {
    e.preventDefault();
    this.setState({
      showOptions: !this.state.showOptions
    });
  };

  handleCollapse = (e) => {
    if (
      e.target.classList.contains('section__head') ||
      e.target.classList.contains('section__collapses') ||
      e.target.classList.contains('section__title')
    ) {
      e.preventDefault();
      this.sectionStore.toggleCollapse();
      if (!this.sectionStore.collapsed) {
        this.moduleStore.preloadItems();
      }
    }
  };

  rowCount = null;
  refRowCount = (element) => {
    this.rowCount = element;
  };

  handleRowCountChange = (e) => {
    this.props.setMinHeight(0);
    const count = parseInt(this.rowCount.value, 10);
    this.sectionStore.setRowCount(count);
  };

  render() {
    const section = this.sectionStore;
    const module = this.moduleStore;

    let openSite = null;
    let moduleActions = null;
    if (!section.collapsed) {
      if (module.meta.siteURL) {
        openSite = (
          <a href={module.meta.siteURL} title={chrome.i18n.getMessage('goToTheWebsite')} className="action action__open" target="_blank"/>
        );
      }

      moduleActions = module.meta.actions.map((action, i) => {
        const classList = ['action'];
        if (action.isLoading) {
          classList.push('loading');
        }
        switch (action.icon) {
          case 'update': {
            classList.push('action__update');
            return <a key={i} href={"#"} onClick={action.handleClick} className={classList.join(' ')}
                      title={action.getTitle()}/>;
          }
          default: {
            return <a key={i} href={"#"} onClick={action.handleClick} className={classList.join(' ')}
                      title={action.getTitle()}>{action.getTitle()}</a>;
          }
        }
      });

      /*if (module.authRequired) {
        actions.unshift(
          <a key={'authRequired'} className="action  action__open" target="_blank" href={module.authRequired.url}
             title={chrome.i18n.getMessage('login')}/>
        );
      }*/

    }

    let actionsCtr = null;
    if (!section.collapsed) {
      let options = null;
      if (this.state.showOptions) {
        options = (
          <div className={'section__setup'}>
            <input ref={this.refZoomRange} onChange={this.handleZoomRangeChange} defaultValue={section.zoom} type="range"
                   className="setup__size_range" min="1" max="150"/>
            <a onClick={this.handleResetItemZoom} title={chrome.i18n.getMessage('default')} className="setup__size_default" href="#"/>
            <select ref={this.refRowCount} onChange={this.handleRowCountChange} defaultValue={section.rowCount}
                    className="setup__lines">
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
              <option value="6">6</option>
            </select>
          </div>
        );
      }

      actionsCtr = (
        <div className="section__actions">
          {openSite}
          {moduleActions}
          <a href={"#"} onClick={this.handleOptionsClick} title={chrome.i18n.getMessage('setupView')} className="action action__setup"/>
          {options}
        </div>
      );
    }

    return (
      <div onClick={this.handleCollapse} className="section__head">
        <div className="section__move"/>
        <div className="section__title">{module.meta.getName()}</div>
        {actionsCtr}
        <div className="section__collapses"/>
      </div>
    );
  }
}

@observer
class SectionBody extends React.Component {
  static propTypes = {
    sectionStore: PropTypes.object.isRequired,
    minHeight: PropTypes.number.isRequired,
    setMinHeight: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      page: 0,
    };

    if (this.sectionStore.state === 'idle') {
      this.sectionStore.fetchData();
    }
  }

  /**@return {ExplorerSectionStore}*/
  get sectionStore() {
    return this.props.sectionStore;
  }

  getDisplayItemCount() {
    const section = this.sectionStore;

    const itemCount = Math.ceil((section.page.width - 175) / (120 * section.zoom / 100 + 10 * 2)) - 1;

    return itemCount * section.rowCount;
  }

  setPage = (page) => {
    const bodyHeight = this.body.clientHeight;
    if (bodyHeight > this.props.minHeight) {
      this.props.setMinHeight(bodyHeight);
    }
    this.setState({
      page: page
    });
  };

  body = null;
  refBody = (element) => {
    this.body = element;
  };

  render() {
    const items = this.sectionStore.items;
    const displayItemCount = this.getDisplayItemCount();

    let pageNumber = this.state.page;
    let from = 0;
    let pageItems = null;

    while (!pageItems || (pageItems.length === 0 && pageNumber > 0)) {
      if (pageItems) {
        pageNumber--;
      }
      from = displayItemCount * pageNumber;
      pageItems = items.slice(from, from + displayItemCount);
    }

    const contentItems = pageItems.map((item, i) => {
      return (
        <ExplorerSectionItem key={[from + i, item.url].join(':')} index={from + i} sectionStore={this.sectionStore} itemStore={item}/>
      );
    });

    const bodyStyle = {
      minHeight: this.props.minHeight
    };

    return (
      <>
        <ExplorerSectionPages page={pageNumber} count={items.length} displayCount={displayItemCount}
                             setPage={this.setPage}/>
        <ul ref={this.refBody} style={bodyStyle} className="section__body">{contentItems}</ul>
      </>
    );
  }
}

class ExplorerSectionPages extends React.Component {
  static propTypes = {
    page: PropTypes.number.isRequired,
    count: PropTypes.number.isRequired,
    displayCount: PropTypes.number.isRequired,
    setPage: PropTypes.func.isRequired,
  };

  handleMouseEnter = (e) => {
    const page = parseInt(e.target.dataset.page, 10);
    this.props.setPage(page);
  };

  render() {
    const page = this.props.page;
    const coefficient = this.props.count / this.props.displayCount;
    let pageCount = Math.floor(coefficient);
    if (coefficient % 1 === 0) {
      pageCount--;
    }
    if (!Number.isFinite(pageCount)) {
      pageCount = 0;
    }

    const pages = [];
    for (let i = 0; i <= pageCount; i++) {
      const isActive = page === i;
      const classList = ['pages__item'];
      if (isActive) {
        classList.push('item-active');
      }
      pages.push(
        <li key={i} className={classList.join(' ')} data-page={i} onMouseEnter={this.handleMouseEnter}>{i + 1}</li>
      );
    }

    let content = null;
    if (pages.length > 1) {
      content = (
        <ul className="section__pages">{pages}</ul>
      )
    }

    return (
      content
    );
  }
}

export default ExploreSection;