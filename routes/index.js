const fs = require('fs');
const path = require('path');
const express = require('express');
const router = express.Router();

const vr = require('../voiceresponse');

const gather = vr.gather({
    input: 'speech',
    action: '/completed'
});

// Handle GET request for index page.
router.get('/', (req, res, next) => {
    gather.say('Welcome to Twilio, please tell us why you\'re calling');
    res.send(vr.toString())
});

module.exports = router;