const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const { INTERNAL_SERVER_ERROR } = require("./utils/errors");

const PORT = process.env.PORT || 3001;
const app = express();

mongoose.set("strictQuery", false);
mongoose.connect("mongodb://127.0.0.1:27017/wtwr_db", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(require("./routes/index"));

app.use((err, req, res, next) => {
  console.error(err);
  const { statusCode = INTERNAL_SERVER_ERROR, message } = err;
  res
  .status(statusCode)
  .send({
    message: statusCode === INTERNAL_SERVER_ERROR
    ? 'An error occured on the server'
    : message
  });
  next(new Error('Authorization error'));
});

app.listen(PORT, () => {
  console.log(`Server is runnning on port ${PORT}`);
});
