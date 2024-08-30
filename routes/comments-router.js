const express = require("express");
const {
  deleteCommentById,
  patchCommentVotesById,
} = require("../controllers/comments-controllers");

const commentsRouter = express.Router();

commentsRouter
  .route("/:comment_id")
  .delete(deleteCommentById)
  .patch(patchCommentVotesById);

module.exports = commentsRouter;
