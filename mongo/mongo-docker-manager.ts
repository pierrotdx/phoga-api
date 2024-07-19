import path from "path";
import compose from "docker-compose";

const mongoServiceName = "mongodb";

export const setupMongoContainer = async (
  configRepo: string = path.join(__dirname),
) => {
  try {
    const result = await compose.upOne(mongoServiceName, { cwd: configRepo });
    console.info(result.err);
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const teardownMongoContainer = async (
  configRepo: string = path.join(__dirname),
) => {
  try {
    const result = await compose.down({
      cwd: configRepo,
      commandOptions: [mongoServiceName, ["--volumes"]],
    });
    console.info(result.err);
  } catch (err) {
    console.error(err);
    throw err;
  }
};
