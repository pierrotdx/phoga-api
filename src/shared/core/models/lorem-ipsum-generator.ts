export interface ILoremIpsumGenerator {
  generateWords(nbWords: number): string[];
  generateSentences(nbSentences: number): string[];
}
