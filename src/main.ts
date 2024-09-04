import { AppLauncher } from "./app-launcher";

const app = new AppLauncher();
app.start().catch((err) => {
  console.error("error while launching app: ", err);
});
