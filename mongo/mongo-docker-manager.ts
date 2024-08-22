import compose from "docker-compose";
import path from "path";

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
