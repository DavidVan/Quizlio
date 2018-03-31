const fs = require('fs');
const path = require('path');
const express = require('express');
const router = express.Router();

const accountSid = fs.readFileSync(path.join(__dirname, '../TwilioAccountSID'), 'utf8').replace(/\r?\n|\r/g,'');
const authToken = fs.readFileSync(path.join(__dirname, '../TwilioAuthKey'), 'utf8').replace(/\r?\n|\r/g,'');

const twilio = require('twilio');
const client = new twilio(accountSid, authToken);

// Handle GET request for index page.
router.get('/', (req, res, next) => {
    res.render('index', {
        title: 'Test',
        greeting: 'user'
    });
});

module.exports = router;