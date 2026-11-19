import {useEffect, useState} from 'react';

import IconButton from './ui/IconButton';

export default function ScrollTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 100);
    onScroll();
    window.addEventListener('scroll', onScroll, {passive: true});
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    visible && (
      <div className="scroll-top">
        <IconButton
          label={chrome.i18n.getMessage('scrollTop')}
          icon="up"
          onClick={() => window.scrollTo(0, 0)}
        />
      </div>
    )
  );
}
