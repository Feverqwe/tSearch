import type {ReactNode} from 'react';

import {RouteLink, RouteNavLink} from '../ui/navigation';

import './header.less';

const links = [
  {path: '/', label: 'main'},
  {path: '/history', label: 'history'},
  {path: '/options', label: 'options'},
];

export default function HeaderView({search}: {search: ReactNode}) {
  const name = chrome.i18n.getMessage('main');
  return (
    <header className="body__head">
      <div className="header-brand">
        <RouteLink to="/" className="header-logo" aria-label={name} title={name} />
      </div>
      <div className="header-search">{search}</div>
      <nav className="header-nav">
        {links.map(({path, label}) => {
          const name = chrome.i18n.getMessage(label);
          return (
            <RouteNavLink
              key={path}
              to={path}
              className={`header-link header-link--${label}`}
              aria-label={name}
              title={name}
            />
          );
        })}
      </nav>
    </header>
  );
}
