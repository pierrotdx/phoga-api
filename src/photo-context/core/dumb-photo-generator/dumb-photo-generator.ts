import { readFile } from "fs/promises";
import fetch from "node-fetch";
import { clone } from "ramda";

import { ILoremIpsumGenerator } from "@shared/lorem-ipsum";
import { IUuidGenerator } from "@shared/uuid";

import { assertPhoto } from "../assertions/is-photo/is-photo";
import {
  IDumbPhotoGenerator,
  IDumbPhotoGeneratorOptions,
  IPhoto,
  Photo,
} from "../models";

export class DumbPhotoGenerator implements IDumbPhotoGenerator {
  constructor(
    private readonly uuidGenerator: IUuidGenerator,
    private readonly loremIpsumGenerator: ILoremIpsumGenerator,
  ) {}

  async generatePhoto(options?: IDumbPhotoGeneratorOptions): Promise<IPhoto> {
    const id = clone(options?._id) || this.uuidGenerator.generate();
    const imageBuffer =
      clone(options?.imageBuffer) || (await this.generateImageBuffer());
    const metadata = await this.generateMetadata(options);
    const photo = new Photo(id, { imageBuffer, metadata });
    assertPhoto(photo);
    return photo;
  }

  private async generateImageBuffer(
    size: { width: number; height: number } = { width: 200, height: 200 },
  ): Promise<Buffer> {
    try {
      const response = await fetch(
        `https://picsum.photos/seed/picsum/${size.width}/${size.height}`,
      );
      return await response.buffer();
    } catch (err) {
      throw err;
    }
  }

  private async generateMetadata(
    options?: IDumbPhotoGeneratorOptions,
  ): Promise<IPhoto["metadata"]> {
    const date = clone(options?.date) || this.randomDate();
    const titles = clone(options?.titles) || this.generateTitles();
    const location =
      clone(options?.location) ||
      this.loremIpsumGenerator.generateWords(2).join(" ");
    const description =
      clone(options?.description) || this.generateDescription();
    return { date, titles, location, description };
  }

  // https://stackoverflow.com/a/9035732/6281776
  private randomDate(
    start: Date = new Date("1900-01-01"),
    end: Date = new Date(),
  ) {
    return new Date(
      start.getTime() + Math.random() * (end.getTime() - start.getTime()),
    );
  }

  private generateTitles(): IPhoto["metadata"]["titles"] {
    const nbTitles = this.randomIntFromInterval(0, 5);
    const titles = this.loremIpsumGenerator.generateWords(nbTitles);
    return titles;
  }

  // https://stackoverflow.com/a/7228322/6281776
  private randomIntFromInterval(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  private generateDescription(): IPhoto["metadata"]["description"] {
    const nbDescriptionSentences = this.randomIntFromInterval(0, 7);
    const description = this.loremIpsumGenerator
      .generateSentences(nbDescriptionSentences)
      .join(" ");
    return description;
  }

  async generatePhotos(nbPhotos: number): Promise<IPhoto[]> {
    const photos: IPhoto[] = [];
    while (photos.length < nbPhotos) {
      const photo = await this.generatePhoto();
      photos.push(photo);
    }
    return photos;
  }

  async generatePhotoFromPath(
    imagePath: string,
    _id?: IPhoto["_id"],
  ): Promise<Photo> {
    const imageBuffer = await readFile(imagePath);
    const photo = this.generatePhoto({ _id, imageBuffer });
    return photo;
  }
}
