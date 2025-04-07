import { TagDbFake } from "../../../adapters";
import { ITagDb } from "../../gateways";
import { ITag } from "../../models";
import { GetTagTestUtils } from "./get-tag.test-utils";

describe("GetTag", () => {
  let tagDb: ITagDb;
  let testUtils: GetTagTestUtils;

  beforeEach(() => {
    tagDb = new TagDbFake();
    testUtils = new GetTagTestUtils(tagDb);
  });

  describe("when the requested tag is in db", () => {
    let tagInDb: ITag;

    beforeEach(async () => {
      tagInDb = { _id: "dumb-id", name: "dumb-value" };
      await testUtils.insertTagInDb(tagInDb);
    });

    afterEach(async () => {
      await testUtils.removeTagFromDb(tagInDb._id);
    });

    it("should return the requested tag", async () => {
      const resultTag = await testUtils.executeUseCase(tagInDb._id);

      testUtils.expectTagsToBeEqual(tagInDb, resultTag);
    });
  });

  describe("when the requested tag is not in db", () => {
    it("should throw", async () => {
      const nonExistingTagId = "some id";

      await testUtils.executeUseCaseAndExpectToThrow(nonExistingTagId);
    });
  });
});
