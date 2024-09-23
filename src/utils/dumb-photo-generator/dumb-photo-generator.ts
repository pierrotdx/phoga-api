import { clone } from "ramda";

import { IPhoto, Photo } from "@business-logic";
import { assertPhoto } from "@utils/is-photo";

import {
  IDumbPhotoGenerator,
  IDumbPhotoGeneratorOptions,
  ILoremIpsumGenerator,
  IUuidGenerator,
} from "../models";
import { LoremIpsumGenerator, UuidGenerator } from "@adapters";

export class DumbPhotoGenerator implements IDumbPhotoGenerator {
  constructor(
    private readonly uuidGenerator: IUuidGenerator,
    private readonly loremIpsumGenerator: ILoremIpsumGenerator,
  ) {}

  generate(options?: IDumbPhotoGeneratorOptions): IPhoto {
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
    const date = clone(options?.date) || new Date();
    const titles = clone(options?.titles) || this.generateTitles();
    const location =
      clone(options?.location) ||
      this.loremIpsumGenerator.generateWords(2).join(" ");
    const description =
      clone(options?.description) || this.generateDescription();
    return { date, titles, location, description };
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
}

const uuidGenerator: IUuidGenerator = new UuidGenerator();
const loremIpsumGenerator: ILoremIpsumGenerator = new LoremIpsumGenerator();
export const dumbPhotoGenerator = new DumbPhotoGenerator(uuidGenerator, loremIpsumGenerator);