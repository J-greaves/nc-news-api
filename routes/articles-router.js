const express = require("express");
const {
  getArticleById,
  getArticles,
  getCommentsByArticleId,
  postCommentToArticleById,
  patchArticleById,
} = require("../controllers/articles-controllers");

const articlesRouter = express.Router();

articlesRouter.route("/").get(getArticles);

articlesRouter
  .route("/:article_id")
  .get(getArticleById)
  .patch(patchArticleById);

articlesRouter
  .route("/:article_id/comments")
  .get(getCommentsByArticleId)
  .post(postCommentToArticleById);

module.exports = articlesRouter;
