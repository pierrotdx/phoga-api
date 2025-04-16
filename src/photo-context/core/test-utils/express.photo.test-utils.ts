import { imageBufferEncoding } from "#shared/models";
import { isUuid } from "#shared/uuid";
import { Response, Test } from "supertest";

import { IPhoto, Photo } from "../models";

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
      : this.getPhotoFromGetMetadataResponse(res);
  }

  private getPhotoFromGetMetadataResponse(res: Response): IPhoto {
    const { _id, metadata } = res.body;
    if (metadata?.date) {
      metadata.date = new Date(metadata.date);
    }
    return new Photo(_id, { photoData: { metadata } });
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

  addFormDataToReq(req: Test, photo: IPhoto): void {
    req.field("_id", photo._id);
    if (photo.imageBuffer) {
      req.attach("image", photo.imageBuffer);
    }
    if (!photo.metadata) {
      return;
    }
    if (photo.metadata.date) {
      const stringDate = photo.metadata.date.toISOString();
      req.field("date", stringDate);
    }
    if (photo.metadata.location) {
      req.field("location", photo.metadata.location);
    }
    if (photo.metadata.description) {
      req.field("description", photo.metadata.description);
    }
    if (photo.metadata.titles?.length) {
      req.field("titles", photo.metadata.titles);
    }
  }
}
