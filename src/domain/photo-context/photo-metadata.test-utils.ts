import { IAssertionsCounter } from "@assertions-counter";
import { IPhoto, IPhotoMetadataDb, thumbnailSize } from "@domain";
import { IImageEditor } from "@shared";

export class PhotoMetadataTestUtils {
  constructor(
    private readonly db: IPhotoMetadataDb,
    private readonly imageEditor: IImageEditor,
  ) {}

  async expectPhotoMetadataToBeInDb(
    photo: IPhoto,
    assertionsCounter: IAssertionsCounter,
  ): Promise<void> {
    const dbMetadata = await this.db.getById(photo._id);
    expect(dbMetadata).toEqual(photo.metadata);
    assertionsCounter.increase();
  }

  async expectMetadataNotToBeInDb(
    id: IPhoto["_id"],
    assertionsCounter: IAssertionsCounter,
  ): Promise<void> {
    const dbMetadata = await this.db.getById(id);
    expect(dbMetadata).toBeUndefined();
    assertionsCounter.increase();
  }

  async expectThumbnailToBeInDb(
    photo: IPhoto,
    assertionsCounter: IAssertionsCounter,
  ): Promise<void> {
    const metadata = await this.db.getById(photo._id);
    expect(metadata.thumbnail).toBeDefined();
    const size = this.imageEditor.getSize(metadata.thumbnail);
    expect(size).toEqual(thumbnailSize);
    assertionsCounter.increase(2);
    assertionsCounter.checkAssertions();
  }
}
