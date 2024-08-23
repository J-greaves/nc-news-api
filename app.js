const express = require("express");
const app = express();

const { getTopics } = require("./controllers/topics-controllers");

app.get("/api/topics", getTopics);

app.use((req, res, next) => {
  res.status(404).send({ msg: "Route not found" });
  next(err);
});

module.exports = app;
