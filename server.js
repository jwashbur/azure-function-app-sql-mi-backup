const express = require('express');
const axios = require('axios');
const { DefaultAzureCredential } = require('@azure/identity');
const { SecretClient } = require('@azure/keyvault-secrets');

const app = express();
app.use(express.static('public'));

const credential = new DefaultAzureCredential();
const keyVaultUrl = "https://key-prod-atlantis.vault.azure.net";
const secretName = "sqlmibackup-signalR-functionKey";
const functionAppNegotiateUrl = "https://sqlmibackups01.azurewebsites.net/api/negotiate";

app.get('/api/negotiate', async (req, res) => {
    try {
        // Authenticate and fetch the function key from Key Vault
        const secretClient = new SecretClient(keyVaultUrl, credential);
        const secret = await secretClient.getSecret(secretName);

        // Call the Azure Function's negotiate endpoint
        const response = await axios.get(functionAppNegotiateUrl, {
            headers: {
                'x-functions-key': secret.value
            }
        });

        res.status(200).json(response.data);
    } catch (err) {
        console.error("Negotiate error:", err.message);
        res.status(500).json({ error: "Failed to negotiate SignalR connection" });
    }
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
