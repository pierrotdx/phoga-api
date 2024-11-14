import { Response } from "supertest";

import { IPhoto, Photo } from "@domain";
import { imageBufferEncoding } from "@http-server";
import { isUuid } from "@shared";

export class ExpressSharedTestUtils {
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
    return new Photo(_id, { metadata });
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
}
