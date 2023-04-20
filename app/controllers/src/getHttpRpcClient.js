const { HttpRpcClient } = require("@account-abstraction/sdk/dist/src/HttpRpcClient");

exports.getHttpRpcClient = async(
  provider,
  bundlerUrl,
  entryPointAddress
) => {
  const chainId = await provider.getNetwork().then((net) => net.chainId);
  return new HttpRpcClient(bundlerUrl, entryPointAddress, chainId);
}
