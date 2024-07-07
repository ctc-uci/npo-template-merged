// FIXME: keep file only if using mongodb
const mongoose = require("mongoose");

const mongoURI =
    process.env.NODE_ENV === "development"
        ? process.env.DEV_DB_URI
        : process.env.PROD_DB_URI;

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const mongoConnection = mongoose.connection;
mongoConnection.once("open", () => {
    console.log("MongoDB database connection established successfully");
});

module.exports = mongoose;
