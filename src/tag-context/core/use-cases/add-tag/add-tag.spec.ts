import { TagDbFake } from "../../../adapters";
import { ITagDb } from "../../gateways";
import { ITag } from "../../models";
import { AddTagTestUtils } from "./add-tag.test-utils";

describe("AddTag", () => {
  let tagDb: ITagDb;
  let testUtils: AddTagTestUtils;

  const tagToAdd: ITag = { _id: "dumb-id-1", name: "test-1" };

  beforeEach(() => {
    tagDb = new TagDbFake();
    testUtils = new AddTagTestUtils(tagDb);
  });

  afterEach(async () => {
    await testUtils.removeTagFromDb(tagToAdd._id);
  });

  it("should add the requested tag to the database", async () => {
    await testUtils.executeUseCase(tagToAdd);

    await testUtils.expectTagToBeInDb(tagToAdd);
  });

  describe("when a tag with the same id is already in the db", () => {
    let tagInDb: ITag;

    beforeEach(async () => {
      tagInDb = { _id: tagToAdd._id, name: "some value" };
      await testUtils.executeUseCase(tagInDb);
    });

    it("should throw an error", async () => {
      await testUtils.executeUseCaseAndExpectToThrow(tagToAdd);
    });
  });
});
