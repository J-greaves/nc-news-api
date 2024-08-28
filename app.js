const express = require("express");
const app = express();

const { getTopics } = require("./controllers/topics-controllers");
const { getDocs } = require("./controllers/api-constrollers");
const {
  getArticleById,
  getArticles,
  getCommentsByArticleId,
  postCommentToArticleById,
} = require("./controllers/articles-controllers");

app.use(express.json());

app.get("/api", getDocs);

app.get("/api/topics", getTopics);

app.get("/api/articles/:article_id", getArticleById);

app.get("/api/articles/:article_id/comments", getCommentsByArticleId);

app.post("/api/articles/:article_id/comments", postCommentToArticleById);

app.get("/api/articles", getArticles);

app.use((req, res, next) => {
  res.status(404).send({ msg: "Route not found" });
  next(err);
});

app.use((err, req, res, next) => {
  if (err.code === "22P02") {
    res.status(400).send({ msg: "Article ID is invalid" });
  }
  next(err);
});

app.use((err, req, res, next) => {
  if (err.msg === "Invalid article id") {
    res.status(400).send({ msg: "Bad request" });
  }
  if (err.msg === "article_id not found") {
    res.status(404).send({ msg: "Article not found" });
  }
  if (err.msg === "Article ID does not exist") {
    res.status(404).send({ msg: "Article ID does not exist" });
  }
  if (err.msg === "Username does not exist") {
    res.status(404).send({ msg: "Username does not exist" });
  }
  if (err.msg === "Missing required username or body") {
    res.status(400).send({ msg: "Missing username or body" });
  }
  next(err);
});

module.exports = app;
