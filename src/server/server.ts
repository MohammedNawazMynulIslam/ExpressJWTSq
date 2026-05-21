import { config } from './../config/index';
import app from "../app";
import { initDB } from '../db';

const main = () => { 
  initDB();
  app.listen(config.port, () => {
    console.log(`Listening to PORT ${config.port}`);
  });
}
main();