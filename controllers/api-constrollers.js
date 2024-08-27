const { fetchDocs } = require("../models/api-models");

exports.getDocs = (req, res, next) => {
  fetchDocs()
    .then((docs) => {
      res.status(200).send({ docs });
    })
    .catch((err) => {
      console.log(err);
      next(err);
    });
};
