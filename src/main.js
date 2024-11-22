// prettier-ignore
{
    require("module-alias/register");
    import { LoggerWinston } from "@logger";
    import { AppLauncher } from "./app-launcher";
}
var logger = new _logger_1.LoggerWinston();
var app = new app_launcher_1.AppLauncher(logger);
app.start().catch(function (err) {
    logger.error(err);
});
