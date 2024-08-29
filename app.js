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
  if (err.msg) {
    res.status(err.status).send({ msg: err.msg });
  }
});

module.exports = app;
