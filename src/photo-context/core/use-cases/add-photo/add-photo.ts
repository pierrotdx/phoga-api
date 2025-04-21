import { ErrorWithStatus, HttpErrorCode } from "#shared/models";
import { ITag, ITagDb } from "#tag-context";
import { isEmpty, isNil } from "ramda";

import { IPhotoDataDb, IPhotoImageDb } from "../../gateways";
import {
  IAddPhotoParams,
  IAddPhotoUseCase,
  IPhotoStoredData,
} from "../../models";

export class AddPhotoUseCase implements IAddPhotoUseCase {
  constructor(
    private readonly photoDataDb: IPhotoDataDb,
    private readonly photoImageDb: IPhotoImageDb,
    private readonly tagDb: ITagDb,
  ) {}

  async execute(data: IAddPhotoParams): Promise<void> {
    await this.uploadImage(data);
    await this.uploadPhotoStoredData(data);
  }

  private async uploadImage(data: IAddPhotoParams) {
    if (isNil(data.imageBuffer) || isEmpty(data.imageBuffer)) {
      throw new ErrorWithStatus(
        `no image to upload for photo: ${data._id}`,
        HttpErrorCode.BadRequest,
      );
    }
    await this.photoImageDb.insert(data);
  }

  private async uploadPhotoStoredData(data: IAddPhotoParams): Promise<void> {
    const storedPhotoData: IPhotoStoredData = {
      _id: data._id,
      metadata: data.metadata,
    };
    if (data.tagIds) {
      storedPhotoData.tags = await this.getTags(data.tagIds);
    }
    await this.photoDataDb.insert(storedPhotoData);
  }

  private async getTags(tagIds: ITag["_id"][]): Promise<ITag[]> {
    const tags$ = tagIds.map(async (id) => await this.tagDb.getById(id));
    const tags = await Promise.all(tags$);
    return tags;
  }
}
