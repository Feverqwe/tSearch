import React from "react";

class ScrollTop extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      visible: false
    };
  }

  componentDidMount() {
    window.addEventListener('scroll', this.onScroll);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.onScroll);
  }

  onScroll = () => {
    if (window.scrollY > 100) {
      if (!this.state.visible) {
        this.setState({
          visible: true
        });
      }
    } else
    if (this.state.visible) {
      this.setState({
        visible: false
      });
    }
  };

  onClick = (e) => {
    e.preventDefault();
    window.scrollTo(0, 0);
  };

  render() {
    const classList = ['scroll_top'];
    if (this.state.visible) {
      classList.push('visible');
    }
    return (
      <a key="scroll-top" className={classList.join(' ')} href="#scrollTop" onClick={this.onClick}
         title={chrome.i18n.getMessage('scrollTop')}/>
    );
  }
}

export default ScrollTop;