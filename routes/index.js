const fs = require('fs');
const path = require('path');
const express = require('express');
const router = express.Router();

const client = require('../twilio_client');
const VoiceResponse = require('twilio').twiml.VoiceResponse;
const response = new VoiceResponse();

router.post('/', (req, res, next) => {
    response.gather({
        input: 'speech',
        action: '/completed'
    }).say('Welcome to Twilio, please tell us why you\'re calling');
    res.send(response.toString())
});

module.exports = router;