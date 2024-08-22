import cookieParser from "cookie-parser"; // FIXME: Keep only if using cookies
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import schedule from "node-schedule"; // FIXME: Keep only if scheduling cronjobs

// Routes
import { sampleRouter } from "./routes/sample"; // FIXME: delete sample router

dotenv.config();

schedule.scheduleJob("0 0 0 0 0", () => console.log("Hello Cron Job!")); // FIXME: delete sample cronjob

const app = express();

const CLIENT_HOSTNAME =
  process.env.NODE_ENV === "DEVELOPMENT"
    ? `${process.env.DEV_CLIENT_HOSTNAME}:${process.env.DEV_CLIENT_PORT}`
    : process.env.PROD_CLIENT_HOSTNAME;

const SERVER_PORT =
  (process.env.NODE_ENV === "DEVELOPMENT"
    ? process.env.DEV_SERVER_PORT
    : process.env.PROD_SERVER_PORT) ?? 3001;

app.use(
  cors({
    origin: CLIENT_HOSTNAME,
    credentials: true,
  })
);

app.use(cookieParser());

app.use(express.json()); // for req.body
app.use("/", sampleRouter); // FIXME: delete sample endpoint

app.listen(SERVER_PORT, () => {
  console.log(`Server listening on ${SERVER_PORT}`);
});
