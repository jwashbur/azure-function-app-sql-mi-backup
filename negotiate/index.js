const { AzureFunction, Context, HttpRequest } = require("@azure/functions");
const { default: { negotiateConnection } } = require("@azure/azure-signalr");

module.exports = async function (context, req) {
    context.res = {
        body: negotiateConnection("backupHub")
    };
};
