const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser'); // FIXME: Keep only if using cookies
const schedule = require('node-schedule'); // FIXME: Keep only if scheduling cronjobs

// Routes
const sampleRouter = require('./routes/sample'); // FIXME: delete sample router

require('dotenv').config();

schedule.scheduleJob('0 0 0 0 0', () => console.log('Hello Cron Job!')); // FIXME: delete sample cronjob

const app = express();

const CLIENT_HOSTNAME =
  process.env.NODE_ENV === 'development'
    ? `${process.env.DEV_CLIENT_HOSTNAME}:${process.env.DEV_CLIENT_PORT}`
    : process.env.PROD_CLIENT_HOSTNAME;
const SERVER_PORT =
  process.env.NODE_ENV === 'development'
    ? process.env.DEV_SERVER_PORT
    : process.env.PROD_SERVER_PORT;

app.use(
  cors({
    origin: CLIENT_HOSTNAME,
  }),
);

app.use(cookieParser());

app.use(express.json()); // for req.body
app.use('/', sampleRouter); // FIXME: delete sample endpoint

app.listen(SERVER_PORT, () => {
  console.log(`Server listening on ${SERVER_PORT}`);
});
