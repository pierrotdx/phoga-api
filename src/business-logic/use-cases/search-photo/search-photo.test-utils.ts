import { IPhoto } from "@business-logic";
import { dumbPhotoGenerator } from "@utils";

export class SearchPhotoTestUtils {
  public readonly storedPhotos = this.generateStoredPhotos();

  resultShouldMatchStoredPhotos(result: IPhoto[]) {
    expect(result).toEqual(this.storedPhotos);
    expect.assertions(1);
  }

  resultShouldBeSortedAsRequired(
    result: IPhoto[],
    expectedSortedList: IPhoto[],
  ) {
    expect(result).toEqual(expectedSortedList);
    expect.assertions(1);
  }

  resultSizeShouldMatchRequiredSize(result: IPhoto[], requiredSize: number) {
    expect(result.length).toEqual(requiredSize);
    expect.assertions(1);
  }

  resultShouldStartFromNthMatchingDocument(
    result: IPhoto[],
    allMatchingDocs: IPhoto[],
    docPosition: number,
  ) {
    expect(result[0]).toEqual(allMatchingDocs[docPosition]);
    expect.assertions(1);
  }

  imagesPresenceShouldFollowRequirement(
    photos: IPhoto[],
    excludeImages: boolean,
  ) {
    photos.forEach((photo) => {
      if (excludeImages) {
        expect(photo.imageBuffer).toBeUndefined();
      } else {
        expect(photo.imageBuffer).toBeDefined();
      }
    });
    expect.assertions(photos.length);
  }

  private generateStoredPhotos() {
    const storedPhotos = [];
    const nbStoredPhotos = 3;
    for (let index = 0; index < nbStoredPhotos; index++) {
      storedPhotos.push(dumbPhotoGenerator.generate());
    }
    return storedPhotos;
  }
}
