module.exports = app => {
  const usersigningkey = require("../controllers/usersigningkey.controller.js");

  var router = require("express").Router();

  // Create a new Usersigningkey
  router.post("/", usersigningkey.create);

  // Retrieve all Usersigningkey
  router.get("/", usersigningkey.findAll);

  // Delete a Usersigningkey with id
  router.delete("/:id", usersigningkey.delete);

  // Create a new Usersigningkey
  router.delete("/", usersigningkey.deleteAll);

  app.use("/api/wallet", router);
};
