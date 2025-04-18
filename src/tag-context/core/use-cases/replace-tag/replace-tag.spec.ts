import { TagDbFake } from "../../../adapters";
import { ITagDb } from "../../gateways";
import { ITag } from "../../models";
import { ReplaceTagTestUtils } from "./replace-tag.test-utils";

describe("ReplaceTag", () => {
  let tagDb: ITagDb;
  let testUtils: ReplaceTagTestUtils;

  const newTag: ITag = { _id: "dumb-id", name: "new tag" };

  beforeEach(() => {
    tagDb = new TagDbFake();
    testUtils = new ReplaceTagTestUtils(tagDb);
  });

  afterEach(async () => {
    await testUtils.removeTagFromDb(newTag._id);
  });

  describe("when there is already a tag with the same id in db", () => {
    let tagToReplace: ITag;

    beforeEach(async () => {
      tagToReplace = { _id: newTag._id, name: "tag to replace" };
      await testUtils.insertTagInDb(tagToReplace);
    });

    afterEach(async () => {
      await testUtils.removeTagFromDb(tagToReplace._id);
    });

    it("should replace the tag", async () => {
      await testUtils.executeUseCase(newTag);

      await testUtils.expectTagToBeInDb(newTag);
    });
  });

  describe("when there is no tag with the same id in db", () => {
    it("should add the tag to the db", async () => {
      await testUtils.executeUseCase(newTag);

      await testUtils.expectTagToBeInDb(newTag);
    });
  });
});
