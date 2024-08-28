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
  queryPromises = [];
  queryPromises.push(
    checkExists(
      "articles",
      "article_id",
      article_id,
      "Article ID does not exist"
    )
  );
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

exports.insertNewComment = (article_id, newComment) => {
  const validColumns = ["username", "body"];

  for (const key of validColumns) {
    if (!newComment.hasOwnProperty(key)) {
      return Promise.reject({ msg: "Missing required username or body" });
    }
  }
  return Promise.all([
    checkExists(
      "users",
      "username",
      newComment.username,
      "Username does not exist"
    ),
    checkExists(
      "articles",
      "article_id",
      article_id,
      "Article ID does not exist"
    ),
  ])
    .then(() => {
      return db.query(
        "INSERT INTO comments(body, author, article_id) VALUES ($1, $2, $3) RETURNING *",
        [newComment.body, newComment.username, article_id]
      );
    })
    .then((result) => {
      return result.rows[0];
    });
};

exports.updateArticleById = (article_id, newVotes) => {
  if (!newVotes.hasOwnProperty("inc_votes")) {
    return Promise.reject({ msg: "Missing votes" });
  }
  return Promise.all([
    checkExists(
      "articles",
      "article_id",
      article_id,
      "Article ID does not exist"
    ),
  ])
    .then(() => {
      return db.query(
        `
        UPDATE articles
        SET votes = votes + $1
        WHERE article_id = $2
        RETURNING *
        `,
        [newVotes.inc_votes, article_id]
      );
    })
    .then((result) => {
      return result.rows[0];
    });
};
