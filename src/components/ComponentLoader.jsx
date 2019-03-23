import React from "react";
import getLogger from "../tools/getLogger";
import PropTypes from "prop-types";

const logger = getLogger('ComponentLoader');

const Editor = React.lazy(() => import('../pages/Editor'));
const CodeMaker = React.lazy(() => import('../pages/CodeMaker'));
const ProfileEditor = React.lazy(() => import('../pages/ProfileEditor'));
const History = React.lazy(() => import('../pages/History'));
const Options = React.lazy(() => import('../pages/Options'));
const Main = React.lazy(() => import('../pages/Main'));

const idComponent = {
  editor: Editor,
  codeMaker: CodeMaker,
  'profile-editor': ProfileEditor,
  history: History,
  options: Options,
  main: Main,
};

class ComponentLoader extends React.Component {
  static propTypes = {
    'load-page': PropTypes.string.isRequired,
  };

  render() {
    const {'load-page': componentId, ...props} = this.props;

    const Component = idComponent[componentId];

    return (
      <React.Suspense fallback={<Spinner/>}>
        <Component {...props}/>
      </React.Suspense>
    );
  }
}

const Spinner = () => 'Loading...';

export default ComponentLoader;