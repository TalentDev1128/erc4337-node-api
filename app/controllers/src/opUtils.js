const { ethers } = require("ethers");

exports.toJSON = (op) => {
  return ethers.utils.resolveProperties(op).then((userOp) =>
    Object.keys(userOp)
      .map((key) => {
        let val = (userOp)[key];
        if (typeof val !== "string" || !val.startsWith("0x")) {
          val = ethers.utils.hexValue(val);
        }
        return [key, val];
      })
      .reduce(
        (set, [k, v]) => ({
          ...set,
          [k]: v,
        }),
        {}
      )
  );
}

exports.printOp  = async (
  op
) => {
  return toJSON(op).then((userOp) => JSON.stringify(userOp, null, 2));
}
