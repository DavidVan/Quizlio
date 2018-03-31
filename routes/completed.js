const fs = require('fs');
const path = require('path');
const express = require('express');
const router = express.Router();

const client = require('../twilio_client');
const VoiceResponse = require('twilio').twiml.VoiceResponse;
const response = new VoiceResponse();

router.post('/', (req, res, next) => {
    response.say("You said " + req.body.SpeechResult);
    response.redirect({
        method: 'POST'
    }, '/')
    res.send(response.toString())
});

module.exports = router;