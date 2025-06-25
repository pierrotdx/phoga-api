import { IAddPhotoParams, IPhoto, Photo } from "#photo-context";
import { imageBufferEncoding } from "#shared/models";
import { isUuid } from "#shared/uuid";
import { ITag } from "#tag-context";
import { Response, Test } from "supertest";
import { parseTagDates } from "../tags";

export class ExpressPhotoTestUtils {
  getPayloadFromPhoto(photo: IPhoto, encoding = imageBufferEncoding) {
    return {
      _id: photo._id,
      imageBuffer: photo.imageBuffer?.toString(encoding),
      location: photo.metadata?.location,
      description: photo.metadata?.description,
      titles: photo.metadata?.titles,
      date: photo.metadata?.date?.toISOString(),
    };
  }

  getPhotoFromResponse(res: Response): IPhoto {
    return res.header["content-type"] === "image/jpeg"
      ? this.getPhotoFromGetImageResponse(res)
      : this.getPhotoFromGetPhotoDataResponse(res);
  }

  private getPhotoFromGetPhotoDataResponse(res: Response): IPhoto {
    const { _id, metadata, tags } = res.body;
    if (metadata?.date) {
      metadata.date = new Date(metadata.date);
    }
    if (tags) {
      (tags as ITag[]).forEach((t) => parseTagDates(t));
    }
    return new Photo(_id, { photoData: { metadata, tags } });
  }

  private getPhotoFromGetImageResponse(res: Response): IPhoto {
    const imageBuffer = res.body as Buffer;
    const id = res.request.url
      .split("/")
      .reduce(
        (acc, fragment) => (isUuid(fragment) ? fragment : acc),
        undefined,
      );
    return new Photo(id, { imageBuffer });
  }

  addFormDataToReq(req: Test, addPhotoParams: IAddPhotoParams): void {
    req.field("_id", addPhotoParams._id);
    if (addPhotoParams.imageBuffer) {
      req.attach("image", addPhotoParams.imageBuffer);
    }
    if (!addPhotoParams.metadata) {
      return;
    }
    if (addPhotoParams.metadata.date) {
      const stringDate = addPhotoParams.metadata.date.toISOString();
      req.field("date", stringDate);
    }
    if (addPhotoParams.metadata.location) {
      req.field("location", addPhotoParams.metadata.location);
    }
    if (addPhotoParams.metadata.description) {
      req.field("description", addPhotoParams.metadata.description);
    }
    if (addPhotoParams.metadata.titles?.length) {
      req.field("titles", addPhotoParams.metadata.titles);
    }
    if (addPhotoParams.tagIds) {
      req.field("tagIds", addPhotoParams.tagIds);
    }
  }
}
