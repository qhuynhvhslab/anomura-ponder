const { graphqlPlugin } = require("@ponder/graphql");

/**
 * @type {import('@ponder/core').PonderConfig}
 */
const ponderConfig = {
  plugins: [graphqlPlugin()],
  database: {
    kind: "sqlite",
  },
  networks: [
    { name: "goerli", chainId: 5, rpcUrl: process.env.PONDER_RPC_URL_1 },
  ],
  sources: [
    {
      name: "AnomuraEquipment",
      network: "goerli",
      address: "0xE394Ac77f89FbFAF464FC5796f90C2E192c2f2de",
      abi: "./abis/AnomuraEquipment.json",
      startBlock: 7990478,
    },
  ],
};

module.exports = ponderConfig;
