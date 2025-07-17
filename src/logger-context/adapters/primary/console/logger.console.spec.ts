import { LogEntry, LogLevel } from "../../../core";
import { LoggerConsole } from "./logger.console";
import { LoggerConsoleTestUtils } from "./logger.console.test-utils";

describe("LoggerConsole", () => {
  let logger: LoggerConsole;
  let testUtils: LoggerConsoleTestUtils;

  beforeEach(() => {
    logger = new LoggerConsole();
    testUtils = new LoggerConsoleTestUtils(logger);
  });

  describe("by default", () => {
    it("should not be muted", () => {
      const isMuted = testUtils.isMuted();
      expect(isMuted).toBeFalsy();
    });
  });

  describe("mute()", () => {
    beforeEach(() => {
      testUtils.simulateMutedState(false);
    });

    it("should mute the logger", () => {
      logger.mute();

      const isMuted = testUtils.isMuted();
      expect(isMuted).toBeTruthy();
    });
  });

  describe("unmute()", () => {
    beforeEach(() => {
      testUtils.simulateMutedState(true);
    });

    it("should unmute the logger", () => {
      logger.unmute();

      const isMuted = testUtils.isMuted();
      expect(isMuted).toBeFalsy();
    });
  });

  describe("log()", () => {
    describe("when the logger is muted", () => {
      const consoleSpies: jest.SpyInstance[] = [];

      beforeEach(() => {
        testUtils.simulateMutedState(true);

        consoleSpies.push(
          jest.spyOn(console, "log"),
          jest.spyOn(console, "info"),
          jest.spyOn(console, "error"),
          jest.spyOn(console, "warn"),
        );
      });

      afterEach(() => {
        consoleSpies.forEach((spy) => spy.mockRestore());
      });

      it.each`
        logLevel
        ${LogLevel.Error}
        ${LogLevel.Warn}
        ${LogLevel.Info}
      `("should not log anything at '$logLevel' level", ({ logLevel }) => {
        const logEntry = new LogEntry(logLevel, "dumb message");
        logger.log(logEntry);

        consoleSpies.forEach((spy) => {
          expect(spy).not.toHaveBeenCalled();
        });
      });
    });

    describe("when the logger is not muted", () => {
      beforeEach(() => {
        testUtils.simulateMutedState(false);
      });

      describe.each`
        logLevel          | expectedLogMethod
        ${LogLevel.Error} | ${"error"}
        ${LogLevel.Warn}  | ${"warn"}
        ${LogLevel.Info}  | ${"info"}
      `(
        `when the log entry is of level '$logLevel'`,
        ({ logLevel, expectedLogMethod }) => {
          const message = "dumb message";
          const logEntry = new LogEntry(logLevel, message);

          let spy: jest.SpyInstance;

          beforeEach(() => {
            spy = jest.spyOn(console, expectedLogMethod);
          });

          afterEach(() => {
            spy.mockRestore();
          });

          it(`should log the entry as an '${expectedLogMethod}'`, () => {
            logger.log(logEntry);

            expect(spy).toHaveBeenCalledTimes(1);
          });
        },
      );
    });
  });
});
