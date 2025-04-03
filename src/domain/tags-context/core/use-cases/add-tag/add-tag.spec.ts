import { AssertionsCounter, IAssertionsCounter } from "@assertions-counter";

import { TagDbFake } from "../../../adapters";
import { ITagDb } from "../../gateways";
import { ITag } from "../../models";
import { AddTag } from "./add-tag";
import { AddTagTestUtils } from "./add-tag.test-utils";

describe("AddTag", () => {
  let addTag: AddTag;
  let testUtils: AddTagTestUtils;
  let tagDb: ITagDb;
  let assertionCounters: IAssertionsCounter;

  beforeEach(() => {
    tagDb = new TagDbFake();
    addTag = new AddTag(tagDb);
    assertionCounters = new AssertionsCounter();
    testUtils = new AddTagTestUtils(tagDb, assertionCounters);
  });

  it("should add a tag to the database", async () => {
    const tagToAdd: ITag = { _id: "dumb-id", value: "test" };

    await addTag.execute(tagToAdd);

    await testUtils.expectTagToBeInDb(tagToAdd);
    assertionCounters.checkAssertions();
  });

  describe("when a tag with the same id is already in the db", () => {
    const tag1 = { _id: "dumb-id", value: "test 1" };

    beforeEach(async () => {
      await addTag.execute(tag1);
    });

    it("should throw an error if a tag with the same id already exists", async () => {
      const tag2 = { _id: tag1._id, value: "test 2" };

      await expect(addTag.execute(tag2)).rejects.toBeDefined();
      assertionCounters.increase();

      assertionCounters.checkAssertions();
    });
  });
});
