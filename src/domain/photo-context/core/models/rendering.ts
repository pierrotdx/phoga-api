export interface IRendering {
  dateOrder?: SortDirection;
  size?: number;
  from?: number;
}

export enum SortDirection {
  Ascending = "asc",
  Descending = "desc",
}
