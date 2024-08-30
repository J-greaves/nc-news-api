const db = require("../db/connection");
const checkExists = require("../utils/utils");

exports.fetchUsers = () => {
  return db
    .query(
      `
        SELECT *
        FROM users       
        `
    )
    .then((result) => {
      return result.rows;
    });
};

exports.fetchUserByUsername = (username) => {
  return checkExists(
    "users",
    "username",
    username,
    "Username does not exist"
  ).then(() => {
    return db
      .query(
        `
      SELECT * 
      FROM users 
      WHERE users.username = $1`,
        [username]
      )
      .then((result) => {
        return result.rows[0];
      });
  });
};
