const express = require("express");
const app = express();

const { getTopics } = require("./controllers/topics-controllers");
const { getDocs } = require("./controllers/api-constrollers");
const {
  getArticleById,
  getArticles,
  getCommentsByArticleId,
  postCommentToArticleById,
  patchArticleById,
} = require("./controllers/articles-controllers");
const { deleteCommentById } = require("./controllers/comments-controllers");
const { getUsers } = require("./controllers/users-controllers");

app.use(express.json());

app.get("/api", getDocs);

app.get("/api/topics", getTopics);

app.get("/api/users", getUsers);

app.get("/api/articles", getArticles);

app.get("/api/articles/:article_id", getArticleById);

app.patch("/api/articles/:article_id", patchArticleById);

app.get("/api/articles/:article_id/comments", getCommentsByArticleId);

app.post("/api/articles/:article_id/comments", postCommentToArticleById);

app.delete("/api/comments/:comment_id", deleteCommentById);

app.use((req, res, next) => {
  res.status(404).send({ msg: "Route not found" });
  next(err);
});

app.use((err, req, res, next) => {
  if (err.code === "22P02") {
    if (req.path.includes("/articles/") && req.path.includes("/comments/")) {
      res.status(400).send({ msg: "Article ID is invalid" });
    } else if (req.path.includes("/articles/")) {
      res.status(400).send({ msg: "Article ID is invalid" });
    } else if (req.path.includes("/comments/")) {
      res.status(400).send({ msg: "Comment ID is invalid" });
    }
  } else next(err);
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
  if (err.msg === "Missing votes") {
    res.status(400).send({ msg: "Missing votes" });
  }
  if (err.msg === "Comment ID does not exist") {
    res.status(404).send({ msg: "Comment ID does not exist" });
  }
  if (err.msg === "Invalid sort_by column") {
    res.status(400).send({ msg: "Invalid sort_by column" });
  }
  if (err.msg === "Invalid order") {
    res.status(400).send({ msg: "Invalid order" });
  }
  next(err);
});

module.exports = app;
