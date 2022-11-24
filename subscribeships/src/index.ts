import { app } from "./app";
import { db } from "./models/index";
const { sequelize } = db;
// make sure we load all need env variables
if (!process.env.JWT_KEY) {
  throw new Error("missing JWT_KEY env variable");
}
const start = async () => {
  const isNotProd = !(process.env.NODE_ENV === "prod");
  await sequelize.sync({ force: isNotProd });
  app.listen(3000, () => {
    console.log("listing on 3000!");
  });
};
start();
