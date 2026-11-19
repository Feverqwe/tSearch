import {useContext} from 'react';

import {useQuery} from '@tanstack/react-query';
import {observer} from 'mobx-react-lite';

import {optionsQuery} from '../data/options';
import {RootContext} from '../stores/rootContext';

import FiltersPanel from './FiltersPanel';

export default observer(function Filters() {
  const {filters} = useContext(RootContext);
  const {data: options, isError} = useQuery(optionsQuery);
  if (!options) {
    return (
      <p role={isError ? 'alert' : 'status'}>
        {chrome.i18n.getMessage(isError ? 'search_prepare_error' : 'search_preparing')}
      </p>
    );
  }

  return (
    <FiltersPanel
      key={filters.resetVersion}
      onReset={filters.active ? filters.reset : undefined}
      text={filters.text}
      onTextChange={filters.setText}
      size={{min: filters.minSizeGb, max: filters.maxSizeGb, onChange: filters.setSize}}
      seed={
        options.hideSeedRow
          ? undefined
          : {
              min: filters.minSeed,
              max: filters.maxSeed,
              onChange: filters.setSeed,
            }
      }
      peer={
        options.hidePeerRow
          ? undefined
          : {
              min: filters.minPeer,
              max: filters.maxPeer,
              onChange: filters.setPeer,
            }
      }
      time={{
        min: filters.minTime,
        max: filters.maxTime,
        preset: filters.timePreset,
        onChange: filters.setTime,
      }}
    />
  );
});
