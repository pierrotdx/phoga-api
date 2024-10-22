import { LoremIpsum } from "lorem-ipsum";

import { ILoremIpsumGenerator } from "@utils";

export class LoremIpsumGenerator implements ILoremIpsumGenerator {
  private readonly lorem = new LoremIpsum();

  generateWords(nbWords: number): string[] {
    const words = this.lorem.generateWords(nbWords).split(" ");
    return words;
  }

  generateSentences(nbSentences: number): string[] {
    const sentences = this.lorem.generateSentences(nbSentences).split(".");
    sentences.pop();
    return sentences;
  }
}
