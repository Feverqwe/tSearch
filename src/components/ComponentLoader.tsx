import {Suspense, lazy} from 'react';

import PageLoading from './PageLoading';

const Editor = lazy(() => import('../pages/Editor'));
const CodeMaker = lazy(() => import('../pages/CodeMaker'));
const History = lazy(() => import('../pages/History'));
const Options = lazy(() => import('../pages/Options'));
const Main = lazy(() => import('../pages/Main'));

type PageProps =
  | {'load-page': 'editor'; type: string; id: string}
  | {'load-page': 'options'; page?: string; detail?: string}
  | {'load-page': 'codeMaker'; page?: string}
  | {'load-page': 'history' | 'main'};

export default function ComponentLoader(props: PageProps) {
  return <Suspense fallback={<PageLoading />}>{renderPage(props)}</Suspense>;
}

function renderPage(props: PageProps) {
  switch (props['load-page']) {
    case 'editor':
      return <Editor type={props.type} id={props.id} />;
    case 'codeMaker':
      return <CodeMaker page={props.page} />;
    case 'history':
      return <History />;
    case 'options':
      return <Options page={props.page} detail={props.detail} />;
    case 'main':
      return <Main />;
  }
}
