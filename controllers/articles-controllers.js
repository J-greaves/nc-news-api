const {
  fetchArticleById,
  fetchArticles,
  fetchCommentsByArticleId,
  insertNewComment,
  updateArticleById,
  insertNewArticle,
} = require("../models/articles-models");

exports.getArticleById = (req, res, next) => {
  const { article_id } = req.params;

  fetchArticleById(article_id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getArticles = (req, res, next) => {
  const {
    sort_by = "created_at",
    order = "desc",
    topic,
    limit = 10,
    p = 1,
  } = req.query;
  const pageSize = Number(limit);
  const page = Number(p);
  fetchArticles(sort_by, order, topic, pageSize, page)
    .then((articles) => {
      res.status(200).send(articles);
    })
    .catch((err) => {
      next(err);
    });
};

exports.getCommentsByArticleId = (req, res, next) => {
  const { article_id } = req.params;
  fetchCommentsByArticleId(article_id)
    .then((comments) => {
      res.status(200).send({ comments });
    })
    .catch((err) => {
      next(err);
    });
};

exports.postArticle = (req, res, next) => {
  const newArticle = req.body;
  insertNewArticle(newArticle)
    .then((article) => {
      res.status(201).send({ article });
    })
    .catch((err) => {
      next(err);
    });
};

exports.postCommentToArticleById = (req, res, next) => {
  const { article_id } = req.params;
  const newComment = req.body;
  insertNewComment(article_id, newComment)
    .then((comment) => {
      res.status(201).send({ comment });
    })
    .catch((err) => {
      next(err);
    });
};

exports.patchArticleById = (req, res, next) => {
  const { article_id } = req.params;
  const voteInc = req.body;
  updateArticleById(article_id, voteInc)
    .then((article) => {
      res.status(201).send({ article });
    })
    .catch((err) => {
      next(err);
    });
};
