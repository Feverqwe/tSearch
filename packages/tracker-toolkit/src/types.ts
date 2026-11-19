export interface PipelineStep {
  name: string;
  args?: (string | number)[];
}

export interface Rule {
  selector: string;
  pipeline?: PipelineStep[];
}

export interface SearchTemplate {
  url: string;
  method?: string;
  encoding?: string;
  originUrl?: string;
  query?: string;
  body?: string;
  charset?: string;
  headers?: string;
}
