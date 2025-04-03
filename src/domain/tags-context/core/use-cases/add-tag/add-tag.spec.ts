import { TagDbFake } from "../../../adapters";
import { ITagDb } from "../../gateways";
import { ITag } from "../../models";
import { AddTagTestUtils } from "./add-tag.test-utils";

describe("AddTag", () => {
  let tagDb: ITagDb;
  let testUtils: AddTagTestUtils;

  beforeEach(() => {
    tagDb = new TagDbFake();
    testUtils = new AddTagTestUtils(tagDb);
  });

  afterEach(async () => {
    await testUtils.cleanDbFromDumbTags();
  });

  it("should add a tag to the database", async () => {
    const tagToAdd = testUtils.dumbTags[0];

    await testUtils.executeUseCase(tagToAdd);

    await testUtils.expectTagToBeInDb(tagToAdd);
  });

  describe("when a tag with the same id is already in the db", () => {
    let tag1: ITag;

    beforeEach(async () => {
      tag1 = testUtils.dumbTags[0];
      await testUtils.executeUseCase(tag1);
    });

    it("should throw an error", async () => {
      const tag2 = { _id: tag1._id, value: "some value" };

      await testUtils.executeUseCaseAndExpectToThrow(tag2);
    });
  });
});
