import {types} from 'mobx-state-tree';
import getLogger from "../tools/getLogger";

const logger = getLogger('CodeMakerStore');

const SelectorWithAttrStore = types.model('SelectorWithAttrStore', {
  selector: types.string,
  attr: types.maybe(types.string),
});

const RegexpStore = types.model('RegexpStore', {
  patter: types.string,
  replace: types.optional(types.string, ''),
});

const CodeMakerStore = types.model('CodeMakerStore', {
  search: types.model({
    url: types.string,
    query: types.maybe(types.string),
    body: types.maybe(types.string),
    encoding: types.maybe(types.string),
    charset: types.maybe(types.string),
  }),
  auth: types.model({
    url: types.maybe(types.string),
    selector: types.maybe(types.string),
  }),
  selectors: types.model({
    row: types.string,
    tableRow: types.optional(types.boolean, false),
    categoryTitle: types.maybe(SelectorWithAttrStore),
    categoryLink: types.maybe(types.string),
    title: types.string,
    link: types.string,
    size: types.maybe(SelectorWithAttrStore),
    downloadLink: types.maybe(types.string),
    seeds: types.maybe(types.string),
    peers: types.maybe(types.string),
    date: types.maybe(SelectorWithAttrStore),
    skipFromStart: types.optional(types.number, 0),
    skipFromEnd: types.optional(types.number, 0),
    nextPageLink: types.maybe(types.string),
  }),
  converter: types.model({
    dateRegexp: types.maybe(RegexpStore),
    dateReplaceToday: types.optional(types.boolean, false),
    dateReplaceMonth: types.optional(types.boolean, false),
    dateUseTemplate: types.maybe(types.enumeration(['2013-04-31[[[ 07]:03]:27]', '31-04-2013[[[ 07]:03]:27]', 'n day ago', '04-31-2013[[[ 07]:03]:27]', '2d 1h 0m 0s ago'])),
    sizeRegexp: types.maybe(RegexpStore),
    sizeConvert: types.optional(types.boolean, false),
    peersRegexp: types.maybe(RegexpStore),
    seedsRegexp: types.maybe(RegexpStore),
  }),
  description: types.model({
    icon: types.maybe(types.string),
    name: types.string,
    description: types.maybe(types.string),
    updateUrl: types.maybe(types.string),
    version: types.string,
  }),
});

export default CodeMakerStore;