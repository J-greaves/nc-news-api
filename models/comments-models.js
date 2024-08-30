const db = require("../db/connection");
const checkExists = require("../utils/utils");

exports.removeCommentById = (comment_id) => {
  return checkExists(
    "comments",
    "comment_id",
    comment_id,
    "Comment ID does not exist"
  ).then(() => {
    return db.query("DELETE FROM comments WHERE comment_id = $1", [comment_id]);
  });
};

exports.updateCommentVotesById = (comment_id, voteInc) => {
  if (!voteInc.hasOwnProperty("inc_votes")) {
    return Promise.reject({ status: 400, msg: "Missing votes" });
  }
  return checkExists(
    "comments",
    "comment_id",
    comment_id,
    "Comment ID does not exist"
  )
    .then(() => {
      return db.query(
        `
      UPDATE comments
      SET votes = votes + $1
      WHERE comment_id = $2
      RETURNING *
      `,
        [voteInc.inc_votes, comment_id]
      );
    })
    .then((result) => {
      return result.rows[0];
    });
};
