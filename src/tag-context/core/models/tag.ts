import { IManifest } from "#shared/models";

export interface ITag {
  _id: string;
  name?: string;
  manifest?: IManifest;
}
