import { LoremIpsumGenerator } from "./lorem-ipsum-generator";

describe("lorem-ipsum", () => {
  let loremIpsumGenerator: LoremIpsumGenerator;

  beforeEach(() => {
    loremIpsumGenerator = new LoremIpsumGenerator();
  });

  describe("generateWords", () => {
    it.each`
      nbWords
      ${1}
      ${2}
      ${5}
      ${9}
    `("should generate $nbWords words", ({ nbWords }: { nbWords: number }) => {
      const generatedWords = loremIpsumGenerator.generateWords(nbWords);
      expect(generatedWords.length).toBe(nbWords);
      expect.assertions(1);
    });
  });

  describe("generateSentences", () => {
    it.each`
      nbSentences
      ${1}
      ${3}
      ${7}
      ${15}
    `(
      "should generate $nbSentences sentence(s)",
      ({ nbSentences }: { nbSentences: number }) => {
        const sentences = loremIpsumGenerator.generateSentences(nbSentences);
        expect(sentences.length).toBe(nbSentences);
        expect.assertions(1);
      },
    );
  });
});
