export interface SelectorLocation {
  containerSelector?: string;
  skipFromStart?: number;
  skipFromEnd?: number;
}

export type OptionalResultSelectorId =
  | 'categoryTitle'
  | 'categoryUrl'
  | 'size'
  | 'downloadUrl'
  | 'seeds'
  | 'peers'
  | 'date'
  | 'nextPageUrl';
export type SelectorId = OptionalResultSelectorId | 'row' | 'title' | 'url' | 'loginForm';

export interface PipelineStep {
  name: string;
  args?: (string | number)[];
}

export interface Selector {
  selector: string;
  pipeline?: PipelineStep[];
}

export interface Selection {
  id: SelectorId;
  location: SelectorLocation;
  finish?: () => void;
}

export interface SelectorPreview {
  available: boolean;
  active: SelectorId | null;
  highlighted?: SelectorId;
  selection: Selection | null;
  activate: (id: SelectorId) => void;
  toggleHighlight: (id: SelectorId, path: string, location: SelectorLocation) => void;
  select: (selection: Selection | null) => void;
  resolve: (path: string, location: SelectorLocation) => Element | null;
}
