const express = require("express");
const app = express();

const { getTopics } = require("./controllers/topics-controllers");

app.use(express.json());

app.all("/api/topics", (req, res, next) => {
  if (req.method !== "GET") {
    res.status(405).send({ msg: "Method not allowed" });
  } else {
    next();
  }
});

app.get("/api/topics", getTopics);

app.use((req, res, next) => {
  res.status(404).send({ msg: "Route not found" });
  next(err);
});

module.exports = app;
