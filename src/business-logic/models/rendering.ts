export interface IRendering {
  date?: SortDirection;
  size?: number;
  from?: number;
}

export enum SortDirection {
  Ascending = "asc",
  Descending = "desc",
}
