import {useCallback, type Ref} from 'react';
import {
  Link,
  NavLink,
  Navigate,
  createPath,
  parsePath,
  useLocation,
  useNavigate,
  type LinkProps,
  type NavLinkProps,
  type NavigateProps,
  type NavigateOptions,
  type To,
} from 'react-router-dom';

import {themedSearch, themeInSearch} from './theme';

function withTheme(to: To, search: string): To {
  const mode = themeInSearch(search);
  if (!mode) return to;
  const path = typeof to === 'string' ? parsePath(to) : to;
  const result = {...path, search: themedSearch(path.search ?? '', mode)};
  // Keep relative route semantics, including a query-only navigation.
  return typeof to === 'string' && path.pathname ? createPath(result) : result;
}

export function RouteLink({to, ...props}: LinkProps & {ref?: Ref<HTMLAnchorElement>}) {
  return <Link {...props} to={withTheme(to, useLocation().search)} />;
}

export function RouteNavLink({to, ...props}: NavLinkProps & {ref?: Ref<HTMLAnchorElement>}) {
  return <NavLink {...props} to={withTheme(to, useLocation().search)} />;
}

export function RouteRedirect({to, ...props}: NavigateProps) {
  return <Navigate {...props} to={withTheme(to, useLocation().search)} />;
}

export function useRouteNavigate() {
  const navigate = useNavigate();
  const {search} = useLocation();
  return useCallback(
    (to: To, options?: NavigateOptions) => navigate(withTheme(to, search), options),
    [navigate, search],
  );
}
