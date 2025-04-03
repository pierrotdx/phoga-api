import { TagDbFake } from "../../../adapters";
import { ITagDb } from "../../gateways";
import { ITag } from "../../models";
import { DeleteTagTestUtils } from "./delete-tag.test-utils";

describe("DeleteTag", () => {
  let tagDb: ITagDb;
  let testUtils: DeleteTagTestUtils;

  let tagToDelete: ITag;

  beforeEach(async () => {
    tagDb = new TagDbFake();
    testUtils = new DeleteTagTestUtils(tagDb);

    tagToDelete = testUtils.tagToDelete;
    await testUtils.insertTagInDb(tagToDelete);
  });

  it("should delete the requested tag", async () => {
    await testUtils.executeUseCase(tagToDelete._id);

    await testUtils.expectTagToBeDeleted(tagToDelete._id);
  });
});
