export interface ISearchResult<T> extends ISearchResultMetadata {
  hits: T[];
}

export interface ISearchResultMetadata {
  totalCount: number;
}
