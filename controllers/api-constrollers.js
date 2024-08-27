const { fetchDocs } = require("../models/api-models");

exports.getDocs = (req, res, next) => {
  fetchDocs()
    .then((endpoints) => {
      res.status(200).send({ endpoints });
    })
    .catch((err) => {
      console.log(err);
      next(err);
    });
};
