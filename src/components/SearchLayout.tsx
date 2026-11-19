import type {ReactNode} from 'react';

interface SearchLayoutProps {
  header: ReactNode;
  sidebar: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}

export default function SearchLayout({header, sidebar, children, footer}: SearchLayoutProps) {
  return (
    <div className="page-ctr">
      {header}
      <div className="content content-row search-workspace">
        <div className="parameter_box">{sidebar}</div>
        <div className="main">{children}</div>
      </div>
      {footer}
    </div>
  );
}
