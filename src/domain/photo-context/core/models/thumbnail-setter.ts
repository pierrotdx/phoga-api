import { IPhoto } from "./photo";

export interface IThumbnailSetter {
  set(photo: IPhoto): Promise<void>;
}
