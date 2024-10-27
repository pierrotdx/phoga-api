import { IPhoto } from "@business-logic";
import { imageBufferEncoding } from "@http-server";

export class ExpressTestUtils {
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
}
