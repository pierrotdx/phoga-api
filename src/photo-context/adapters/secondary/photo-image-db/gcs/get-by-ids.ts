import { buffer } from "node:stream/consumers";

import { Bucket, File } from "@google-cloud/storage";

import { IPhoto } from "../../../../core";

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
    const filesStream = this.bucket.getFilesStream();
    return new Promise<File[]>((resole, reject) => {
      const files: File[] = [];
      filesStream
        .on("error", (err) => {
          const error = err instanceof Error ? err : new Error(err);
          reject(error);
        })
        .on("data", (chunk: File) => {
          if (ids.includes(chunk.name)) {
            files.push(chunk);
          }
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
