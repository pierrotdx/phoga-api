import { LogEntry, LogLevel } from "../../../core";
import { LoggerWinston } from "./logger.winston";
import { LoggerWinstonTestUtils } from "./logger.winston.test-utils";

describe("LoggerWinston", () => {
  let testedClass: LoggerWinston;
  let testUtils: LoggerWinstonTestUtils;

  let winstonLogSpy: jest.SpyInstance;

  beforeEach(() => {
    testedClass = new LoggerWinston();
    testUtils = new LoggerWinstonTestUtils(testedClass);

    winstonLogSpy = jest.spyOn(testedClass["winstonLogger"], "log");
  });

  afterEach(() => {
    winstonLogSpy.mockRestore();
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
      testedClass.mute();

      const isMuted = testUtils.isMuted();
      expect(isMuted).toBeTruthy();
    });
  });

  describe("unmute()", () => {
    beforeEach(() => {
      testUtils.simulateMutedState(true);
    });

    it("should unmute the logger", () => {
      testedClass.unmute();

      const isMuted = testUtils.isMuted();
      expect(isMuted).toBeFalsy();
    });
  });

  describe("log()", () => {
    describe("when the logger is muted", () => {
      beforeEach(() => {
        testUtils.simulateMutedState(true);
      });

      it("should be silent", () => {
        const isSilent = testedClass["winstonLogger"].silent;
        expect(isSilent).toBeTruthy();
      });
    });

    describe("when the logger is not muted", () => {
      beforeEach(() => {
        testUtils.simulateMutedState(false);
      });

      it("should log the entry", () => {
        const logEntry = new LogEntry(LogLevel.Info, "dumb message");

        testedClass.log(logEntry);

        expect(winstonLogSpy).toHaveBeenCalledTimes(1);
        expect.assertions(1);
      });

      describe.each`
        logMethod | expectedLogLevel
        ${"info"} | ${LogLevel.Info}
        ${"warn"} | ${LogLevel.Warn}
      `(
        `when calling the '$logMethod()' method`,
        ({ logMethod, expectedLogLevel }) => {
          const messageToLog = "dumb message";

          it(`should log the entry with '${expectedLogLevel}' level`, () => {
            testedClass[logMethod](messageToLog);

            expect(winstonLogSpy).toHaveBeenCalledTimes(1);
            expect(winstonLogSpy).toHaveBeenCalledWith(
              expectedLogLevel,
              messageToLog,
            );
            expect.assertions(2);
          });
        },
      );

      describe(`when calling "error()" method`, () => {
        const errorToLog = new Error("dumb error");
        const errorLogLevel = LogLevel.Error;

        it(`should log the entry with '${errorLogLevel}' level`, () => {
          const expectedLogLevel = errorLogLevel;

          testedClass.error(errorToLog);

          expect(winstonLogSpy).toHaveBeenCalledTimes(1);
          expect(winstonLogSpy).toHaveBeenCalledWith(
            expectedLogLevel,
            errorToLog.message,
            errorToLog,
          );
          expect.assertions(2);
        });
      });
    });
  });
});
