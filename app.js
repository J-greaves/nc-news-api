const express = require("express");
const app = express();

const { getTopics } = require("./controllers/topics-controllers");
const { getDocs } = require("./controllers/api-constrollers");
const { getArticleById } = require("./controllers/articles-controllers");

app.get("/api", getDocs);

app.get("/api/topics", getTopics);

app.get("/api/articles/:article_id", getArticleById);

app.use((req, res, next) => {
  res.status(404).send({ msg: "Route not found" });
  next(err);
});

app.use((err, req, res, next) => {
  if (err.msg === "Invalid article id") {
    res.status(400).send({ msg: "Bad request" });
  }
  next(err);
});

app.use((err, req, res, next) => {
  if (err.msg === "article_id not found") {
    res.status(404).send({ msg: "Article not found" });
  }
  next(err);
});

module.exports = app;
