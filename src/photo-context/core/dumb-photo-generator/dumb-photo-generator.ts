import { ILoremIpsumGenerator } from "#shared/lorem-ipsum";
import { IUuidGenerator } from "#shared/uuid";
import { ITag } from "#tag-context";
import { clone } from "ramda";

import {
  IAddPhotoParams,
  IDumbPhotoGenerator,
  IGenerateAddPhotoParams,
  IGeneratePhotoOptions,
  IGeneratePhotoStoredDataOptions,
  IPhoto,
  IPhotoStoredData,
  Photo,
} from "../models";

export class DumbPhotoGenerator implements IDumbPhotoGenerator {
  constructor(
    private readonly uuidGenerator: IUuidGenerator,
    private readonly loremIpsumGenerator: ILoremIpsumGenerator,
  ) {}

  generatePhoto(options?: IGeneratePhotoOptions): IPhoto {
    const id = this.generateId(options);
    const metadata = this.generateMetadata(options);
    const photo = new Photo(id, { photoData: { metadata } });
    if (!options?.noImageBuffer) {
      const imageBuffer =
        clone(options?.imageBuffer) || this.generateImageBuffer();
      photo.imageBuffer = imageBuffer;
    }
    return photo;
  }

  private generateId(options?: IGeneratePhotoOptions): string {
    return clone(options?._id) ?? this.uuidGenerator.generate();
  }

  private generateImageBuffer(): Buffer {
    const dumbContent = this.loremIpsumGenerator.generateWords(2).join(" ");
    return Buffer.from(dumbContent);
  }

  private generateMetadata(
    options?: IGeneratePhotoOptions,
  ): IPhoto["metadata"] {
    const date = clone(options?.date) ?? this.randomDate();
    const titles = clone(options?.titles) ?? this.generateTitles();
    const location =
      clone(options?.location) ??
      this.loremIpsumGenerator.generateWords(2).join(" ");
    const description =
      clone(options?.description) ?? this.generateDescription();
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

  generatePhotos(nbPhotos: number, options?: IGeneratePhotoOptions): IPhoto[] {
    const photos: IPhoto[] = [];
    while (photos.length < nbPhotos) {
      const photo = this.generatePhoto(options);
      photos.push(photo);
    }
    return photos;
  }

  generatePhotosStoredData(
    nb: number,
    options?: IGeneratePhotoStoredDataOptions,
  ): IPhotoStoredData[] {
    const photosStoredData: IPhotoStoredData[] = [];
    for (let i = 0; i < nb; i++) {
      const data = this.generatePhotoStoredData(options);
      photosStoredData.push(data);
    }
    return photosStoredData;
  }

  generatePhotoStoredData(
    options?: IGeneratePhotoStoredDataOptions,
  ): IPhotoStoredData {
    const photoStoredData: IPhotoStoredData = {
      _id: this.generateId(options),
      metadata: this.generateMetadata(options),
      tags: options?.tags || this.generateTags(options),
    };
    return photoStoredData;
  }

  private generateTags(options?: IGeneratePhotoStoredDataOptions): ITag[] {
    if (options?.tags) {
      return options.tags;
    }
    const nbTags = 3;
    const tags: ITag[] = [];
    for (let i = 0; i < nbTags; i++) {
      const tag: ITag = this.generateTag();
      tags.push(tag);
    }
    return tags;
  }

  private generateTag(): ITag {
    return {
      _id: this.uuidGenerator.generate(),
      name: this.loremIpsumGenerator.generateWords(1)[0],
    };
  }

  async generateAddPhotoParams(
    options?: IGenerateAddPhotoParams,
  ): Promise<IAddPhotoParams> {
    const photo = this.generatePhoto(options);
    const tagIds: ITag["_id"][] = options?.tagIds || [
      this.uuidGenerator.generate(),
      this.uuidGenerator.generate(),
    ];
    const addPhotoParams: IAddPhotoParams = { ...photo, tagIds };
    return addPhotoParams;
  }
}
