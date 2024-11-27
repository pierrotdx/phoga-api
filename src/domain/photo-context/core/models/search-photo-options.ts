import { ImageSize } from "@shared";

import { IRendering } from "./rendering";

export interface ISearchPhotoOptions {
  excludeImages?: boolean;
  rendering?: IRendering;
  imageSize?: ImageSize;
}
