import { buffer } from "node:stream/consumers";

import { IPhoto } from "@business-logic";
import { Bucket, File } from "@google-cloud/storage";

export class GetByIds {
  private files: File[] = [];

  constructor(private readonly bucket: Bucket) {}

  async execute(
    ids: IPhoto["_id"][],
  ): Promise<Record<IPhoto["_id"], IPhoto["imageBuffer"]>> {
    this.files = await this.getFiles(ids);
    return await this.getBuffers();
  }

  private getFiles(ids: IPhoto["_id"][]): Promise<File[]> {
    const filesStream = this.bucket.getFilesStream({
      matchGlob: ids.join(" | "),
    });
    return new Promise<File[]>((resole, reject) => {
      const files: File[] = [];
      filesStream
        .on("error", (err) => {
          reject(err);
        })
        .on("data", (chunk: File) => {
          files.push(chunk);
        })
        .on("end", () => {
          resole(files);
        });
    });
  }

  private async getBuffers(): Promise<
    Record<IPhoto["_id"], IPhoto["imageBuffer"]>
  > {
    const buffers$ = this.files.map(async (f) => ({
      [f.name]: await buffer(f.createReadStream()),
    }));
    const buffers = await Promise.all(buffers$);
    const buffersById = buffers.reduce(
      (acc: Record<IPhoto["_id"], Buffer>, bufferWithId) => {
        return { ...acc, ...bufferWithId };
      },
      {},
    );
    return buffersById;
  }
}
