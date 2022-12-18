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
    { name: process.env.NETWORK, chainId: parseInt(process.env.CHAINID), rpcUrl: process.env.PONDER_RPC_URL_1 },
  ],
  sources: [
    {
      name: "AnomuraEquipment",
      network: process.env.NETWORK,
      address: process.env.ANOMURA_EQUIPMENT_ADDRESS,
      abi: "./abis/AnomuraEquipment.json",
      startBlock: parseInt(process.env.ANOMURA_EQUIPMENT_START_BLOCK),
    },
    {
      name: "UniversalEquipmentManager",
      network: process.env.NETWORK,
      address: process.env.UNIVERSAL_EQUIPMENT_MANAGER_ADDRESS,
      abi: "./abis/UniversalEquipmentManager.json",
      startBlock: parseInt(process.env.UNIVERSAL_EQUIPMENT_MANAGER_START_BLOCK),
    },
  ],
};

module.exports = ponderConfig;
