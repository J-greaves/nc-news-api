const express = require("express");
const {
  getArticleById,
  getArticles,
  getCommentsByArticleId,
  postCommentToArticleById,
  patchArticleById,
  postArticle,
} = require("../controllers/articles-controllers");

const articlesRouter = express.Router();

articlesRouter.route("/").get(getArticles).post(postArticle);

articlesRouter
  .route("/:article_id")
  .get(getArticleById)
  .patch(patchArticleById);

articlesRouter
  .route("/:article_id/comments")
  .get(getCommentsByArticleId)
  .post(postCommentToArticleById);

module.exports = articlesRouter;
