const { ethers } = require("ethers");
const { getSimpleAccount } = require("./src/getSimpleAccount");
const db = require("../models");
const config = require("./config.json")
const UserSigningKey = db.usersigningkey;

// Create and Save a new UserSigningKey
exports.create = async (req, res) => {
  // Validate request
  if (!req.body.email) {
    res.status(400).send({ message: "email can not be empty!" });
    return;
  }

  const provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);
  const accountAPI = getSimpleAccount(
    provider,
    new ethers.Wallet(ethers.utils.randomBytes(32)).privateKey,
    config.entryPoint,
    config.simpleAccountFactory
  );
  const address = await accountAPI.getCounterFactualAddress();

  console.log(`SimpleAccount address: ${address}`);

  // Create a UserSigningKey
  const userSigningKey = new UserSigningKey({
    email: req.body.email,
    signingKey: address
  });

  // Save UserSigningKey in the database
  userSigningKey
    .save(userSigningKey)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the UserSigningKey."
      });
    });
};

// Retrieve all UserSigningKey from the database.
exports.findAll = (req, res) => {
  const email = req.query.email;
  var condition = email ? { email: { $regex: new RegExp(email), $options: "i" } } : {};

  UserSigningKey.find(condition)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving usersigningkey."
      });
    });
};

// Delete a UserSigningKey with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  UserSigningKey.findByIdAndRemove(id, { useFindAndModify: false })
    .then(data => {
      if (!data) {
        res.status(404).send({
          message: `Cannot delete UserSigningKey with id=${id}. Maybe UserSigningKey was not found!`
        });
      } else {
        res.send({
          message: "UserSigningKey was deleted successfully!"
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete UserSigningKey with id=" + id
      });
    });
};

// Delete all UserSigningKey from the database.
exports.deleteAll = (req, res) => {
  UserSigningKey.deleteMany({})
    .then(data => {
      res.send({
        message: `${data.deletedCount} UserSigningKey were deleted successfully!`
      });
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all userSigningKey."
      });
    });
};

