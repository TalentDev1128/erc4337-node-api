const axios = require("axios");
const { ethers } = require("ethers")
const { toJSON } = require("./opUtils");
const { PaymasterAPI, calcPreVerificationGas } = require("@account-abstraction/sdk");

const SIG_SIZE = 65;
const DUMMY_PAYMASTER_AND_DATA =
  "0x0101010101010101010101010101010101010101000000000000000000000000000000000000000000000000000001010101010100000000000000000000000000000000000000000000000000000000000000000101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101";

function VerifyingPaymasterAPI (paymasterUrl, entryPoint) {
  PaymasterAPI.call(this, paymasterUrl, entryPoint)
  this.paymasterUrl = paymasterUrl;
  this.entryPoint = entryPoint;
}

VerifyingPaymasterAPI.prototype = Object.create(PaymasterAPI.prototype);
VerifyingPaymasterAPI.prototype.constructor = VerifyingPaymasterAPI;

VerifyingPaymasterAPI.prototype.getPaymasterAndData = async function(userOp) {
  // Hack: userOp includes empty paymasterAndData which calcPreVerificationGas requires.
  try {
    // userOp.preVerificationGas contains a promise that will resolve to an error.
    await ethers.utils.resolveProperties(userOp);
    // eslint-disable-next-line no-empty
  } catch (_) {}
  const pmOp = {
    sender: userOp.sender,
    nonce: userOp.nonce,
    initCode: userOp.initCode,
    callData: userOp.callData,
    callGasLimit: userOp.callGasLimit,
    verificationGasLimit: userOp.verificationGasLimit,
    maxFeePerGas: userOp.maxFeePerGas,
    maxPriorityFeePerGas: userOp.maxPriorityFeePerGas,
    // A dummy value here is required in order to calculate a correct preVerificationGas value.
    paymasterAndData: DUMMY_PAYMASTER_AND_DATA,
    signature: ethers.utils.hexlify(Buffer.alloc(SIG_SIZE, 1)),
  };
  const op = await ethers.utils.resolveProperties(pmOp);
  op.preVerificationGas = calcPreVerificationGas(op);

  // Ask the paymaster to sign the transaction and return a valid paymasterAndData value.
  return axios
    .post<paymasterResponse>(this.paymasterUrl, {
      jsonrpc: "2.0",
      id: 1,
      method: "pm_sponsorUserOperation",
      params: [await toJSON(op), this.entryPoint],
    })
    .then((res) => res.data.result.toString());
}

exports.getVerifyingPaymaster = (
  paymasterUrl,
  entryPoint
) => new VerifyingPaymasterAPI(paymasterUrl, entryPoint);
