import { readFile } from "fs/promises";
import { clone } from "ramda";

import { IPhoto, Photo } from "@business-logic";
import {
  IDumbPhotoGenerator,
  IDumbPhotoGeneratorOptions,
  ILoremIpsumGenerator,
  IUuidGenerator,
  assertPhoto,
} from "@utils";

import { LoremIpsumGenerator } from "../lorem-ipsum/lorem-ipsum-generator.lorem-ipsum";
import { UuidGenerator } from "../uuid/uuid-generator.uuid";

const uuidGenerator = new UuidGenerator();
const loremIpsumGenerator = new LoremIpsumGenerator();

export class DumbPhotoGenerator implements IDumbPhotoGenerator {
  constructor(
    private readonly uuidGenerator: IUuidGenerator,
    private readonly loremIpsumGenerator: ILoremIpsumGenerator,
  ) {}

  generatePhoto(options?: IDumbPhotoGeneratorOptions): IPhoto {
    const id = clone(options?._id) || this.uuidGenerator.generate();
    const imageBuffer =
      clone(options?.imageBuffer) || this.generateImageBuffer();
    const metadata = this.generateMetadata(options);
    const photo = new Photo(id, { imageBuffer, metadata });
    assertPhoto(photo);
    return photo;
  }

  private generateImageBuffer(): Buffer {
    const data = this.loremIpsumGenerator.generateSentences(1)[0];
    return Buffer.from(data);
  }

  private generateMetadata(
    options?: IDumbPhotoGeneratorOptions,
  ): IPhoto["metadata"] {
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

  generatePhotos(nbPhotos: number): IPhoto[] {
    const photos: IPhoto[] = [];
    for (let index = 0; index < nbPhotos; index++) {
      photos.push(
        this.generatePhoto({
          imageBuffer: Buffer.from("dumb image buffer"),
        }),
      );
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

export const dumbPhotoGenerator = new DumbPhotoGenerator(
  uuidGenerator,
  loremIpsumGenerator,
);
