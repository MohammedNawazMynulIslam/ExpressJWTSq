import { config } from "../config/index.js";
import app from "../app.js";
import { initDB } from "../db/index.js";

const main = async () => { 
  await initDB();
  app.listen(config.port, () => {
    console.log(`Listening to PORT ${config.port}`);
  });
}
main();
