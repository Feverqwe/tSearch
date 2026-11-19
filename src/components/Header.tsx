import {useLocation} from 'react-router-dom';

import {useRouteNavigate as useNavigate} from '../ui/navigation';

import HeaderView from './HeaderView';
import SearchForm from './SearchForm/SearchForm';

export default function Header({searchPending}: {searchPending?: boolean}) {
  const location = useLocation();
  const query =
    location.pathname === '/search' ? new URLSearchParams(location.search).get('query') : null;
  const navigate = useNavigate();

  return (
    <HeaderView
      search={
        <SearchForm
          key={`${location.pathname}:${query ?? ''}`}
          initialQuery={query ?? ''}
          pending={searchPending}
          onSubmit={(query) => void navigate(`/search?${new URLSearchParams({query})}`)}
        />
      }
    />
  );
}
