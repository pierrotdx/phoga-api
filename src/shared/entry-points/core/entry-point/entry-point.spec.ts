import { Permission } from "#shared/models";

import { EntryPoint } from "./entry-point";

describe(`${EntryPoint.name}`, () => {
  const relativePath = "relativePath/:id";

  describe(`${EntryPoint.prototype.getParent.name}`, () => {
    it("should return the first parent of the entry point", () => {
      const parent = new EntryPoint("parent");
      const entryPoint = new EntryPoint(relativePath, { parent });
      const result = entryPoint.getParent();
      expect(result).toBe(parent);
      expect.assertions(1);
    });
  });

  describe(`${EntryPoint.prototype.getRelativePath.name}`, () => {
    it("should return the entry point's relative path", () => {
      const entryPoint = new EntryPoint(relativePath);
      const result = entryPoint.getRelativePath();
      expect(result).toBe(relativePath);
      expect.assertions(1);
    });
  });

  describe(`${EntryPoint.prototype.getPermissions.name}`, () => {
    it("should return the entry point's permissions", () => {
      const permissions: Permission[] = [
        Permission.PhotosRead,
        Permission.RestrictedRead,
      ];
      const entryPoint = new EntryPoint(relativePath, { permissions });
      const result = entryPoint.getPermissions();
      expect(result).toEqual(permissions);
      expect.assertions(1);
    });
  });

  describe(`${EntryPoint.prototype.getFullPathRaw.name}`, () => {
    it("should return the entry point's raw full path", () => {
      const grandParent = new EntryPoint("grandParent");
      const parent = new EntryPoint("parent", { parent: grandParent });
      const entryPoint = new EntryPoint(relativePath, { parent });
      const expectedPath = `${grandParent.getRelativePath()}\/${parent.getRelativePath()}\/${relativePath}`;
      const result = entryPoint.getFullPathRaw();
      expect(result).toBe(expectedPath);
      expect.assertions(1);
    });
  });

  describe(`${EntryPoint.prototype.getFullPathWithParams.name}`, () => {
    it.each`
      rawPath         | params                         | expectedPath
      ${"/:id"}       | ${{ id: "dumb id" }}           | ${"/dumb id"}
      ${"/:someName"} | ${{ someName: "zijfnzeifne" }} | ${"/zijfnzeifne"}
      ${"/someName"}  | ${{ someName: "zijfnzeifne" }} | ${"/someName"}
      ${"/:toto"}     | ${{}}                          | ${"/:toto"}
    `(
      "should return the entry point's full path with replaced params",
      ({
        rawPath,
        params,
        expectedPath,
      }: {
        rawPath: string;
        params: any;
        expectedPath: string;
      }) => {
        const entryPoint = new EntryPoint(rawPath);
        const result = entryPoint.getFullPathWithParams(params);
        expect(result).toBe(expectedPath);
        expect.assertions(1);
      },
    );
  });
});
