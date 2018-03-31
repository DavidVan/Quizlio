const secrets = require('./secrets')

const twilio = require('twilio');
const client = new twilio(secrets.accountSid, secrets.authToken);

module.exports = client;