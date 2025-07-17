import { LogLabel, LogLevel } from "../models";
import { LogEntry } from "./log-entry";

describe("LogEntry", () => {
  const defaultLabels: LogLabel[] = [LogLabel.PhogaApi];

  describe("with no options", () => {
    it("should have its timestamp initialized", () => {
      const logEntry = new LogEntry(LogLevel.Info, "dumb message");

      expect(logEntry.timestamp).toBeDefined();
      expect(logEntry.timestamp).toBeInstanceOf(Date);
      expect.assertions(2);
    });

    it("should have its message initialized to the input value", () => {
      const inputMessage = "dumb message";
      const expectedMessage = inputMessage;

      const logEntry = new LogEntry(LogLevel.Info, inputMessage);

      expect(logEntry.message).toEqual(expectedMessage);
      expect.assertions(1);
    });

    it("should have its level initialized to the input value", () => {
      const inputLevel = LogLevel.Info;
      const expectedLevel = inputLevel;

      const logEntry = new LogEntry(inputLevel, "dumb message");

      expect(logEntry.level).toEqual(expectedLevel);
      expect.assertions(1);
    });

    it(`should have its labels initialized to '${defaultLabels}'`, () => {
      const expectedLabels = defaultLabels;

      const logEntry = new LogEntry(LogLevel.Info, "dumb message");

      expect(logEntry.labels).toEqual(expectedLabels);
      expect.assertions(1);
    });

    it("should not have context", () => {
      const expectedContext = undefined;

      const logEntry = new LogEntry(LogLevel.Info, "dumb message");

      expect(logEntry.context).toEqual(expectedContext);
      expect.assertions(1);
    });
  });

  describe("with the 'labels' option", () => {
    const sortAlphabetically = (a: string, b: string) => a.localeCompare(b);

    it("should have its labels initialized to the concatenation of default labels and input labels", () => {
      const inputLabels = ["label 1", "label 2"];
      const expectedLabels = [...inputLabels, ...defaultLabels];
      expectedLabels.sort(sortAlphabetically);

      const logEntry = new LogEntry(LogLevel.Info, "dumb message", {
        labels: inputLabels as LogLabel[],
      });
      logEntry.labels.sort(sortAlphabetically);

      expect(logEntry.labels).toEqual(expectedLabels);
      expect.assertions(1);
    });
  });

  describe("with the 'context' option", () => {
    it("should have its context initialized to the input context", () => {
      const inputContext = { a: "123", b: 123 };
      const expectedContext = inputContext;

      const logEntry = new LogEntry(LogLevel.Info, "dumb message", {
        context: inputContext,
      });

      expect(logEntry.context).toEqual(expectedContext);
      expect.assertions(1);
    });
  });
});
