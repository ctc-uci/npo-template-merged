import cookieParser from "cookie-parser"; // TODO: Keep only if using cookies
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import schedule from "node-schedule"; // TODO: Keep only if scheduling cronjobs

import { authRouter } from "./routes/auth";
import { sampleRouter } from "./routes/sample"; // TODO: delete sample router
import { userRouter } from "./routes/users";

dotenv.config();

schedule.scheduleJob("0 0 0 0 0", () => console.log("Hello Cron Job!")); // TODO: delete sample cronjob

const CLIENT_HOSTNAME =
  process.env.NODE_ENV === "development"
    ? `${process.env.DEV_CLIENT_HOSTNAME}:${process.env.DEV_CLIENT_PORT}`
    : process.env.PROD_CLIENT_HOSTNAME;

const SERVER_PORT =
  process.env.NODE_ENV === "development"
    ? process.env.DEV_SERVER_PORT
    : process.env.PROD_SERVER_PORT;

const app = express();
app.use(
  cors({
    origin: CLIENT_HOSTNAME,
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());

app.use("/", sampleRouter); // TODO: delete sample endpoint
app.use("/auth", authRouter);
app.use("/users", userRouter);

app.listen(SERVER_PORT, () => {
  console.log(`Server listening on ${SERVER_PORT}`);
});
