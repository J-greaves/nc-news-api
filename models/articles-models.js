const db = require("../db/connection");
const checkExists = require("../utils/utils");

exports.fetchArticleById = (article_id) => {
  return db
    .query("SELECT * FROM articles WHERE article_id = $1", [article_id])
    .then((result) => {
      if (result.rows.length === 0) {
        return Promise.reject({
          msg: "article_id not found",
        });
      }
      return result.rows[0];
    });
};

exports.fetchArticles = () => {
  return db
    .query(
      `
        SELECT articles.article_id,
        articles.title,
        articles.author,
        articles.topic,
        articles.created_at,
        articles.votes,
        articles.article_img_url,
        COUNT(comments.comment_id) AS comment_count
        FROM articles
        LEFT JOIN comments ON articles.article_id = comments.article_id
        GROUP BY articles.article_id
        ORDER BY articles.created_at DESC
    `
    )
    .then((result) => {
      return result.rows;
    });
};

exports.fetchCommentsByArticleId = (article_id) => {
  const queryPromises = [];
  queryPromises.push(checkExists("articles", "article_id", article_id));
  queryPromises.push(
    db.query(
      `
        SELECT *
        FROM comments
        WHERE article_id = $1
        ORDER BY comments.created_at DESC
        `,
      [article_id]
    )
  );
  return Promise.all(queryPromises).then((result) => {
    return result[1].rows;
  });
};
