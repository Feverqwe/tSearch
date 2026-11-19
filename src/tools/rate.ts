import {prepareTitleQuery, type TitleQuery} from './titleMatchFeatures.ts';
import {evaluateTitleMatch, type TitleMatchScore} from './titleMatch.ts';

export type RateScheme = TitleQuery;

export interface Rating {
  titleMatch: TitleMatchScore;
  sum: number;
}

export default {
  getScheme: prepareTitleQuery,
  getRate(torrent: {title: string}, scheme: RateScheme): Rating {
    const titleMatch = evaluateTitleMatch(scheme, torrent.title);
    return {titleMatch, sum: titleMatch.score * 400};
  },
};
