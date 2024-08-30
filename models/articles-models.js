const db = require("../db/connection");
const checkExists = require("../utils/utils");

exports.fetchArticleById = (article_id) => {
  return db
    .query(
      `
      SELECT articles.*, COUNT(comments.comment_id) AS comment_count 
      FROM articles 
      LEFT JOIN comments ON articles.article_id = comments.article_id
      WHERE articles.article_id = $1
      GROUP BY articles.article_id;
      `,
      [article_id]
    )
    .then((result) => {
      if (result.rows.length === 0) {
        return Promise.reject({ status: 404, msg: "article_id not found" });
      }
      return result.rows[0];
    });
};

exports.fetchArticles = (sort_by, order, topic) => {
  const validColumns = [
    "article_id",
    "title",
    "author",
    "topic",
    "created_at",
    "votes",
    "comment_count",
  ];
  const validOrders = ["asc", "desc"];

  if (!validColumns.includes(sort_by)) {
    return Promise.reject({ status: 400, msg: "Invalid sort_by column" });
  }

  if (!validOrders.includes(order)) {
    return Promise.reject({ status: 400, msg: "Invalid order" });
  }

  let queryStr = `
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
        `;
  const topicQuery = [];
  if (topic) {
    return checkExists(
      "articles",
      "topic",
      topic,
      "Topic not found or no articles for this topic"
    )
      .then(() => {
        queryStr += ` 
        WHERE articles.topic = $1 `;
        topicQuery.push(topic);

        queryStr += `
        GROUP BY articles.article_id 
        ORDER BY ${sort_by} ${order}`;

        return db.query(queryStr, topicQuery);
      })
      .then((result) => {
        return result.rows;
      });
  }

  queryStr += ` GROUP BY articles.article_id
        ORDER BY ${sort_by} ${order}`;

  return db.query(queryStr, topicQuery).then((result) => {
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
      return Promise.reject({
        status: 400,
        msg: "Missing required username or body",
      });
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
    return Promise.reject({ status: 400, msg: "Missing votes" });
  }
  return checkExists(
    "articles",
    "article_id",
    article_id,
    "Article ID does not exist"
  )
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
