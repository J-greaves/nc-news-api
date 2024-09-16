const db = require("../db/connection");
const checkExists = require("../utils/utils");

exports.fetchArticleById = (article_id) => {
  return db
    .query(
      `
      SELECT articles.*, 
      COUNT(comments.comment_id) AS comment_count 
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

exports.fetchArticles = (sort_by, order, topic, pageSize, page) => {
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

  const pageSizeInt = parseInt(pageSize, 10);
  const pageInt = parseInt(page, 10);

  if (
    isNaN(pageSizeInt) ||
    isNaN(pageInt) ||
    pageSizeInt <= 0 ||
    pageInt <= 0
  ) {
    return Promise.reject({
      status: 400,
      msg: "Invalid pagination parameters",
    });
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
  let countQueryStr = `
        SELECT COUNT(*) FROM articles
      `;
  const offset = (page - 1) * pageSize;
  const queryArray = [pageSize, offset];
  if (topic) {
    return checkExists(
      "topics",
      "slug",
      topic,
      "Topic not found or no articles for this topic"
    )
      .then(() => {
        queryStr += ` 
        WHERE articles.topic = $1 `;

        countQueryStr += ` WHERE topic = $1`;

        queryArray.unshift(topic);

        queryStr += `
        GROUP BY articles.article_id 
        ORDER BY ${sort_by} ${order}
        LIMIT $2 OFFSET $3`;
        return db.query(
          `SELECT COUNT(*) FROM articles WHERE articles.topic = $1`,
          [topic]
        );
      })
      .then((countResults) => {
        const total_count = Number(countResults.rows[0].count);
        return db.query(queryStr, queryArray).then((result) => {
          articles = result.rows;
          return { articles, total_count };
        });
      });
  }

  queryStr += ` GROUP BY articles.article_id
        ORDER BY ${sort_by} ${order}
        LIMIT $1 OFFSET $2`;
  return db.query(queryStr, queryArray).then((result) => {
    const articles = result.rows;
    return db.query("SELECT COUNT(*) FROM articles").then((result) => {
      const total_count = Number(result.rows[0].count);
      return { articles, total_count };
    });
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

exports.insertNewArticle = (newArticle) => {
  let article_img_url =
    "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700";

  if (newArticle.article_img_url) {
    article_img_url = newArticle.article_img_url;
  }

  const validColumns = ["author", "body", "topic", "title"];

  for (const key of validColumns) {
    if (!newArticle.hasOwnProperty(key)) {
      return Promise.reject({
        status: 400,
        msg: "Missing required actricle property",
      });
    }
  }

  for (let key in newArticle) {
    if (typeof newArticle[key] !== "string") {
      return Promise.reject({
        status: 400,
        msg: "Invalid values in article properties",
      });
    }
  }

  return Promise.all([
    checkExists(
      "users",
      "username",
      newArticle.author,
      "Username does not exist"
    ),
    checkExists("topics", "slug", newArticle.topic, "Topic does not exist"),
  ])
    .then(() => {
      return db.query(
        "INSERT INTO articles (author, title, body, topic, article_img_url) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [
          newArticle.author,
          newArticle.title,
          newArticle.body,
          newArticle.topic,
          article_img_url,
        ]
      );
    })
    .then((result) => {
      const newArticle = result.rows[0];
      const article_id = newArticle.article_id;

      return db
        .query(
          `
        SELECT COUNT(*) AS comment_count
        FROM comments
        WHERE article_id = $1 
        `,
          [article_id]
        )
        .then((countResult) => {
          const commentCount = Number(countResult.rows[0].comment_count);
          return {
            ...newArticle,
            comment_count: commentCount,
          };
        });
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
