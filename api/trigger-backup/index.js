const { DefaultAzureCredential } = require("@azure/identity");
const { SecretClient } = require("@azure/keyvault-secrets");
const axios = require("axios");

module.exports = async function (context, req) {
  const credential = new DefaultAzureCredential();

  const kvUri = `https://key-prod-atlantis.vault.azure.net`;
  const secretName = "sqlmibackup-signalR-functionKey";

  const client = new SecretClient(kvUri, credential);
  let functionKey;

  try {
    const secret = await client.getSecret(secretName);
    functionKey = secret.value;
  } catch (err) {
    context.log.error("Failed to retrieve secret from Key Vault:", err.message);
    context.res = {
      status: 500,
      body: "Unable to retrieve function key from Key Vault.",
    };
    return;
  }

  const functionUrl = `https://sqlmibackups01.azurewebsites.net/api/sqlmibackup-signalR?code=${functionKey}`;

  try {
    const result = await axios.post(functionUrl);
    context.res = {
      status: 200,
      body: result.data,
    };
  } catch (err) {
    context.log.error("Error calling Function App:", err.message);
    context.res = {
      status: 500,
      body: "Failed to trigger backup.",
    };
  }
};
