import {
  AssertionsCounter,
  IAssertionsCounter,
} from "#shared/assertions-counter";
import { ISearchResult } from "#shared/models";
import { MongoDoc } from "#shared/mongo";
import { TagTestUtils } from "#shared/test-utils";

import { ISearchTagFilter, ISearchTagOptions, ITag } from "../../../../core";
import { MongoTestUtils } from "./mongo.test-utils";
import { TagDbMongo } from "./tag-db.mongo";

export class TagDbMongoTestUtils {
  private readonly mongoTestUtils: MongoTestUtils;

  private testedClass: TagDbMongo;
  private readonly assertionsCounter: IAssertionsCounter;
  private readonly tagTestUtils: TagTestUtils;

  constructor(testGlobalData: any) {
    this.mongoTestUtils = new MongoTestUtils(testGlobalData);
    this.tagTestUtils = new TagTestUtils(this.testedClass);
    this.assertionsCounter = new AssertionsCounter();
  }

  async globalBeforeEach(): Promise<void> {
    await this.mongoTestUtils.openMongoConnection();
    this.onMongoConnection();
  }

  private onMongoConnection(): void {
    this.testedClass = new TagDbMongo(this.mongoTestUtils.mongoManager);
  }

  async globalAfterEach(): Promise<void> {
    await this.mongoTestUtils.closeMongoConnection();
  }

  async deleteDoc(id: MongoDoc["_id"]): Promise<void> {
    await this.mongoTestUtils.deleteDoc(id);
  }

  async deleteDocs(docIds: MongoDoc["_id"][]): Promise<void> {
    const deleteAllDocs$ = docIds.map(async (id) => {
      await this.deleteDoc(id);
    });
    await Promise.all(deleteAllDocs$);
  }

  async insertDoc(doc: MongoDoc): Promise<void> {
    await this.mongoTestUtils.insertDoc(doc);
  }

  async insertDocs(docs: MongoDoc[]): Promise<void> {
    const insertAllDocs$ = docs.map(async (doc) => {
      await this.insertDoc(doc);
    });
    await Promise.all(insertAllDocs$);
  }

  async insert(tag: ITag): Promise<void> {
    await this.testedClass.insert(tag);
  }

  async getById(id: ITag["_id"]): Promise<ITag> {
    return await this.testedClass.getById(id);
  }

  async replace(tag: ITag): Promise<void> {
    await this.testedClass.replace(tag);
  }

  async delete(id: ITag["_id"]): Promise<void> {
    await this.testedClass.delete(id);
  }

  async find(filter?: ISearchTagFilter, options?: ISearchTagOptions): Promise<ISearchResult<ITag>> {
    return await this.testedClass.find(filter, options);
  }

  async expectTagToBeInDb(expectedTag: ITag): Promise<void> {
    const dbTag = await this.mongoTestUtils.findDoc(expectedTag._id);

    expect(dbTag).toBeDefined();
    expect(dbTag).toEqual(expectedTag);
    this.assertionsCounter.increase(2);

    this.assertionsCounter.checkAssertions();
  }

  async expectInsertToThrow(tag: ITag): Promise<void> {
    try {
      await this.insert(tag);
    } catch (err) {
      expect(err).toBeDefined();
    } finally {
      this.assertionsCounter.increase(1);
      this.assertionsCounter.checkAssertions();
    }
  }

  expectTagsToBeEqual(tag1: ITag, tag2: ITag): void {
    expect(tag1).toEqual(tag2);
    this.assertionsCounter.increase();

    this.assertionsCounter.checkAssertions();
  }

  async expectValuesToMatch(
    value: unknown,
    expectedValue: unknown,
  ): Promise<void> {
    expect(value).toBe(expectedValue);
    this.assertionsCounter.increase(1);
    this.assertionsCounter.checkAssertions();
  }

  async expectTagNotToBeInDb(id: ITag["_id"]): Promise<void> {
    const dbTag = await this.mongoTestUtils.findDoc(id);

    expect(dbTag).toBeNull();
    this.assertionsCounter.increase();

    this.assertionsCounter.checkAssertions();
  }

  expectSearchResultToBe(
    expectedSearchResult: ISearchResult<ITag>,
    searchResult: ISearchResult<ITag>,
  ): void {
    this.tagTestUtils.expectSearchResultToBe(
      expectedSearchResult,
      searchResult,
    );
    this.tagTestUtils.checkAssertions();
  }
}
