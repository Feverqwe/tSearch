import {useEffect} from 'react';

import {useQuery} from '@tanstack/react-query';

import Header from '../components/Header';
import HistoryList from '../components/HistoryList';
import ScrollTop from '../components/ScrollTop';
import {historyQuery, useHistoryMutation} from '../data/history';
import {optionsQuery} from '../data/options';
import getTitle from '../tools/getTitle';

export default function History() {
  const query = useQuery(historyQuery);
  const {data: options} = useQuery(optionsQuery);
  const {mutateAsync: change} = useHistoryMutation();

  useEffect(() => {
    document.title = getTitle(chrome.i18n.getMessage('history'));
  }, []);

  if (!query.data) {
    return (
      <p role={query.isError ? 'alert' : 'status'}>
        {chrome.i18n.getMessage(query.isError ? 'history_load_error' : 'history_loading')}
      </p>
    );
  }
  const entries = Object.values(query.data).sort((a, b) => b.time - a.time);

  return (
    <div className="page-ctr">
      <Header />
      <div className="content content-row">
        <div className="main history-ctr">
          <HistoryList
            entries={entries}
            change={change}
            presentation={options?.titlePresentation}
          />
        </div>
      </div>
      <ScrollTop />
    </div>
  );
}
