const secrets = require('./secrets')

const twilio = require('twilio');
const client = new twilio(secrets.accountSid, secrets.authToken);
const VoiceResponse = require('twilio').twiml.VoiceResponse;

const response = new VoiceResponse();

module.exports = response;