import type {TitleMatch} from '../tools/titlePresentation';
import type {Rating} from '../tools/rate';

export default interface SearchResult {
  trackerId: string;
  title: string;
  titleLowerCase: string;
  titleMatches: TitleMatch[];
  url: string;
  rate: Rating;
  quality: number;
  qualityLabel?: string;
  titleMatchTier?: number;
  categoryId: number;
  categoryTitle?: string | null;
  categoryTitleLowerCase: string;
  categoryUrl?: string | null;
  size?: number;
  downloadUrl?: string | null;
  seeds?: number;
  peers?: number;
  date?: number;
  dateTitle: string;
  dateText: string;
  sizeText: string;
}
