import {type ReactNode, type Ref, useId, useLayoutEffect, useRef, useState} from 'react';

import '../../assets/css/explore.less';

interface ExplorerSectionViewProps {
  id: string;
  title: string;
  collapsed?: boolean;
  loading?: boolean;
  error?: boolean;
  loginRequired?: boolean;
  empty?: boolean;
  itemRef?: Ref<HTMLLIElement>;
  handleRef?: Ref<HTMLButtonElement>;
  dropTarget?: boolean;
  actions?: ReactNode;
  settings?: ReactNode;
  children: ReactNode;
  onToggle: () => void;
}

export default function ExplorerSectionView({
  id,
  title,
  collapsed,
  loading,
  error,
  loginRequired,
  empty,
  itemRef,
  handleRef,
  dropTarget,
  actions,
  settings,
  children,
  onToggle,
}: ExplorerSectionViewProps) {
  const contentId = useId();
  const content = useRef<HTMLDivElement>(null);
  const [keepContent, setKeepContent] = useState(!collapsed);
  const refreshError =
    error && !loginRequired ? chrome.i18n.getMessage('explorer_cache_error') : undefined;
  const classNames = ['section'];
  if (loading) classNames.push('section-loading');
  if (loginRequired) classNames.push('section-login');
  else if (error) classNames.push('section-error');
  if (empty) classNames.push('section-empty');
  if (collapsed) classNames.push('section-collapsed');

  useLayoutEffect(() => {
    if (!collapsed) {
      setKeepContent(true);
      return;
    }
    const transitions = content.current?.getAnimations() ?? [];
    if (!transitions.length) {
      setKeepContent(false);
      return;
    }
    let current = true;
    void Promise.allSettled(transitions.map(({finished}) => finished)).then(() => {
      if (current) setKeepContent(false);
    });
    return () => {
      current = false;
    };
  }, [collapsed]);

  return (
    <li
      ref={itemRef}
      data-id={id}
      data-sort-target={dropTarget || undefined}
      className={classNames.join(' ')}
    >
      <div className="section__head">
        {handleRef ? (
          <button
            ref={handleRef}
            type="button"
            className="section__move"
            aria-label={`${chrome.i18n.getMessage('move')}: ${title}`}
          />
        ) : (
          <span className="section__move" aria-hidden="true" />
        )}
        <button
          type="button"
          className="section__toggle"
          aria-expanded={!collapsed}
          aria-controls={contentId}
          aria-description={refreshError}
          onClick={onToggle}
        >
          <span className="section__title">
            <span title={title}>{title}</span>
            {refreshError && (
              <span className="section__refresh-error" title={refreshError} aria-hidden="true" />
            )}
          </span>
          <span className="section__collapses" aria-hidden="true" />
        </button>
        {!collapsed && <div className="section__actions">{actions}</div>}
      </div>
      <div id={contentId} ref={content} className="section__content" inert={collapsed}>
        {(!collapsed || keepContent) && (
          <>
            {settings}
            {loading && (
              <p role="status" className="section__status">
                {chrome.i18n.getMessage('explorer_loading')}
              </p>
            )}
            {loginRequired && (
              <p role="status" className="section__status">
                {chrome.i18n.getMessage('login')}
              </p>
            )}
            {empty && <p className="section__status">{chrome.i18n.getMessage('explorer_empty')}</p>}
            {children}
          </>
        )}
      </div>
    </li>
  );
}
