const db = require("../db/connection");
const checkExists = require("../utils/utils");

exports.removeCommentById = (comment_id) => {
  return Promise.all([
    checkExists(
      "comments",
      "comment_id",
      comment_id,
      "Comment ID does not exist"
    ),
  ]).then(() => {
    return db.query("DELETE FROM comments WHERE comment_id = $1", [comment_id]);
  });
};
