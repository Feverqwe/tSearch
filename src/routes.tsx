import {useState} from 'react';

import {Route, Routes, useLocation, useParams} from 'react-router-dom';

import ComponentLoader from './components/ComponentLoader';
import NotFound from './pages/NotFound';
import Search from './pages/Search';
import {RouteRedirect as Navigate} from './ui/navigation';
import {profileRoute} from './ui/profileRoutes';

export default function ExtensionRoutes() {
  return (
    <Routes>
      <Route path="/" element={<ComponentLoader load-page="main" />} />
      <Route path="/profileEditor/:id?" element={<ProfileEditorRoute />} />
      <Route path="/search" element={<SearchRoute />} />
      <Route path="/history" element={<ComponentLoader load-page="history" />} />
      <Route path="/options/:page?/:detail?" element={<OptionsRoute />} />
      <Route path="/editor/:type/:id?" element={<EditorRoute />} />
      <Route path="/codeMaker/:page?" element={<CodeMakerRoute />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function ProfileEditorRoute() {
  const {id} = useParams();
  const {search} = useLocation();
  return <Navigate to={profileRoute(id, search)} replace />;
}

function SearchRoute() {
  const location = useLocation();
  const query = new URLSearchParams(location.search).get('query');
  return query === null ? (
    <Navigate to="/" replace />
  ) : (
    <Search key={location.state?.searchSessionKey ?? location.key} query={query} />
  );
}

function OptionsRoute() {
  const {page, detail} = useParams();
  if (!page) return <Navigate to="/options/main" replace />;
  if (
    !['main', 'explorer', 'backup', 'titles', 'profiles', 'quality'].includes(page) ||
    (detail && page !== 'profiles')
  )
    return <NotFound />;
  return <ComponentLoader load-page="options" page={page} detail={detail} />;
}

function EditorRoute() {
  const {type, id} = useParams();
  const [newId] = useState(() => crypto.randomUUID());
  if (!type) return <Navigate to="/" replace />;
  return id ? (
    <ComponentLoader key={`${type}/${id}`} load-page="editor" type={type} id={id} />
  ) : (
    <Navigate to={`/editor/${type}/${newId}`} replace />
  );
}

function CodeMakerRoute() {
  const {page} = useParams();
  return page ? (
    <ComponentLoader load-page="codeMaker" page={page} />
  ) : (
    <Navigate to="/codeMaker/search" replace />
  );
}
