import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type Ref,
  type RefObject,
} from 'react';
import {createPortal} from 'react-dom';
import Button from '../components/ui/Button';
import IconButton from '../components/ui/IconButton';
import {message} from './trackerBuilderLabels';

const positions = ['bottom', 'right', 'window'] as const;
export type PreviewPosition = (typeof positions)[number];

const positionKey = 'tsearch.code-maker.position';

export function usePreviewWindow(onClose: () => void) {
  const [popup, setPopup] = useState<Window>();
  const windowRef = useRef<Window | undefined>(undefined);
  const closeCallback = useRef(onClose);
  useLayoutEffect(() => {
    closeCallback.current = onClose;
  });
  useEffect(() => () => windowRef.current?.close(), []);

  function close() {
    const active = windowRef.current;
    windowRef.current = undefined;
    active?.close();
    setPopup(undefined);
  }

  function open() {
    const previous = windowRef.current;
    if (previous && !previous.closed) {
      previous.focus();
      return true;
    }
    const next = window.open('', '_blank', 'popup,width=900,height=700');
    if (!next) return false;
    const doc = next.document;
    doc.title = message('maker_preview_title');
    doc.documentElement.lang = document.documentElement.lang;
    const theme = () => {
      doc.documentElement.dataset.theme = document.documentElement.dataset.theme;
    };
    theme();
    const observer = new MutationObserver(theme);
    observer.observe(document.documentElement, {attributes: true, attributeFilter: ['data-theme']});
    for (const node of document.head.querySelectorAll('style, link[rel=stylesheet]')) {
      const copy = doc.importNode(node, true);
      if (node instanceof HTMLLinkElement) copy.setAttribute('href', node.href);
      doc.head.append(copy);
    }
    const style = doc.createElement('style');
    style.textContent = 'body { margin: 0; } .maker-preview { height: 100dvh !important; }';
    doc.head.append(style);
    next.addEventListener(
      'pagehide',
      () => {
        observer.disconnect();
        if (windowRef.current !== next) return;
        windowRef.current = undefined;
        setPopup(undefined);
        closeCallback.current();
      },
      {once: true},
    );
    windowRef.current = next;
    setPopup(next);
    return true;
  }

  return {popup, open, close};
}

export function usePreviewPosition() {
  const [position, setPosition] = useState<PreviewPosition>(() => {
    const saved = localStorage.getItem(positionKey);
    return positions.find((position) => position === saved) ?? 'right';
  });
  return [
    position,
    (position: PreviewPosition) => {
      localStorage.setItem(positionKey, position);
      setPosition(position);
    },
  ] as const;
}

export function PreviewPortal({popup, children}: {popup: Window; children: ReactNode}) {
  return createPortal(<div className="page-ctr--code-maker">{children}</div>, popup.document.body);
}

export default function TrackerBuilderPreview({
  iframe,
  loaded,
  position,
  menuButtonRef,
  onPosition,
  onClose,
  selection,
  onCancel,
  highlight,
  path,
}: {
  iframe: Ref<HTMLIFrameElement>;
  loaded: boolean;
  position: PreviewPosition;
  menuButtonRef: RefObject<HTMLButtonElement | null>;
  onPosition: (position: PreviewPosition) => void;
  onClose: () => void;
  selection?: string;
  onCancel: () => void;
  highlight?: ReactNode;
  path: string;
}) {
  const [menu, setMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const id = useId();

  function closeMenu(focus = true) {
    setMenu(false);
    if (focus) menuButtonRef.current?.focus();
  }

  useLayoutEffect(() => {
    if (menu) menuRef.current?.querySelector<HTMLElement>('[aria-checked=true]')?.focus();
  }, [menu]);

  useEffect(() => {
    if (!menu) return;
    const doc = menuRef.current?.ownerDocument;
    const previewDoc = menuRef.current
      ?.closest('section')
      ?.querySelector('iframe')?.contentDocument;
    const off = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!menuRef.current?.contains(target) && !menuButtonRef.current?.contains(target))
        closeMenu(false);
    };
    doc?.addEventListener('pointerdown', off);
    previewDoc?.addEventListener('pointerdown', off);
    return () => {
      doc?.removeEventListener('pointerdown', off);
      previewDoc?.removeEventListener('pointerdown', off);
    };
  }, [menu, menuButtonRef]);

  return (
    <section className="maker-preview" aria-label={message('maker_preview_title')}>
      <header>
        <h2>{message('maker_preview_title')}</h2>
        <div className="maker-preview-menu">
          <IconButton
            ref={menuButtonRef}
            label={message('maker_preview_position')}
            icon="more-vertical"
            aria-haspopup="menu"
            aria-expanded={menu}
            aria-controls={menu ? id : undefined}
            variant="quiet"
            onClick={() => (menu ? closeMenu() : setMenu(true))}
          />
          {menu && (
            <div
              ref={menuRef}
              id={id}
              className="ts-floating"
              role="menu"
              aria-label={message('maker_preview_position')}
              onKeyDown={(event) => {
                if (event.key === 'Escape') {
                  event.preventDefault();
                  closeMenu();
                }
                const items = [...event.currentTarget.querySelectorAll('button')];
                const current = items.indexOf(event.target as HTMLButtonElement);
                const direction = event.key === 'ArrowDown' ? 1 : event.key === 'ArrowUp' ? -1 : 0;
                if (direction) {
                  event.preventDefault();
                  items[(current + direction + items.length) % items.length]?.focus();
                }
                if (event.key === 'Tab') closeMenu(false);
              }}
            >
              {positions.map((value) => (
                <Button
                  key={value}
                  role="menuitemradio"
                  icon={'dock-' + value}
                  tabIndex={-1}
                  aria-checked={position === value}
                  variant="quiet"
                  onClick={() => {
                    closeMenu();
                    onPosition(value);
                  }}
                >
                  {message('maker_preview_' + value)}
                </Button>
              ))}
            </div>
          )}
        </div>
        <Button aria-label={message('maker_preview_collapse')} variant="quiet" onClick={onClose}>
          {message('maker_collapse')}
        </Button>
      </header>
      {selection && (
        <div className="maker-preview-selection">
          <span>{message('maker_selecting', [selection])}</span>
          <Button onClick={onCancel}>{message('maker_cancel_selection')}</Button>
        </div>
      )}
      {highlight && (
        <div className="maker-preview-selection" role="status">
          {highlight}
        </div>
      )}
      {selection && path && <div className="status_bar">{path}</div>}
      {loaded ? (
        <iframe ref={iframe} title={message('maker_preview_title')} sandbox="allow-same-origin" />
      ) : (
        <p>{message('maker_no_preview')}</p>
      )}
    </section>
  );
}
