const db = require("../db/connection");
const format = require("pg-format");

const checkExists = (table_name, column_name, value, notFoundMsg) => {
  const queryStr = format(
    "SELECT * FROM %I WHERE %I = $1",
    table_name,
    column_name
  );
  return db.query(queryStr, [value]).then(({ rows }) => {
    if (rows.length === 0) {
      console.log("here?");
      return Promise.reject({ status: 404, msg: notFoundMsg });
    }
  });
};

module.exports = checkExists;
