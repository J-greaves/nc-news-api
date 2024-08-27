const db = require("../db/connection");

exports.fetchArticleById = (article_id) => {
  if (isNaN(article_id)) {
    return Promise.reject({
      msg: "Invalid article id",
    });
  }
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
