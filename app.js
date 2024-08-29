const express = require("express");
const app = express();

const articlesRouter = require("./routes/articles-router");
const commentsRouter = require("./routes/comments-router");
const topicsRouter = require("./routes/topics-router");
const usersRouter = require("./routes/users-router");

const { getDocs } = require("./controllers/api-constrollers");

app.use(express.json());

app.get("/api", getDocs);
app.use("/api/articles", articlesRouter);
app.use("/api/comments", commentsRouter);
app.use("/api/topics", topicsRouter);
app.use("/api/users", usersRouter);

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
